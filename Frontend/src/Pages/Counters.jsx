import { useCallback, useEffect, useState } from "react";

import { apiDelete, apiGet, apiPost, apiPut, getUser } from "../api";

const asList = (data) => (Array.isArray(data) ? data : data.results ?? []);

function Counters() {
  const user = getUser();
  const isAdmin = user.role === "ADMIN";

  const [counters, setCounters] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [loadError, setLoadError] = useState("");

  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [operatorId, setOperatorId] = useState("");

  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      setCounters(asList(await apiGet("/counters/")));
      setLoadError("");
    } catch (err) {
      setLoadError(err.message);
    }

    // The users list is available to admins only
    if (isAdmin) {
      try {
        const users = asList(await apiGet("/users/"));
        setStaffUsers(users.filter((u) => u.role === "STAFF" && u.is_active));
      } catch {
        setStaffUsers([]);
      }
    }
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const isActive = (counter) =>
    String(counter.status).toUpperCase() === "ACTIVE";

  function operatorOf(counter) {
    const op = counter.operator;

    if (!op) return "Not assigned";
    if (typeof op === "object") return op.username || "Assigned";

    const match = staffUsers.find((u) => u.id === op);
    return counter.operator_name || match?.username || "Assigned";
  }

  function operatorValue(counter) {
    const op = counter.operator;
    if (!op) return null;
    return typeof op === "object" ? op.id : op;
  }

  async function addCounter(event) {
    event.preventDefault();
    setMessage(null);

    if (!number.trim() || !name.trim()) {
      setMessage({
        type: "error",
        text: "Please enter the counter number and name.",
      });
      return;
    }

    setSaving(true);

    try {
      await apiPost("/counters/", {
        counter_no: number.trim().toUpperCase(),
        name: name.trim(),
        operator: operatorId ? Number(operatorId) : null,
        status: "ACTIVE",
      });

      setMessage({ type: "success", text: "Counter added successfully." });
      setNumber("");
      setName("");
      setOperatorId("");
      await load();
    } catch (err) {
      if (err.data?.counter_no) {
        setMessage({ type: "error", text: "Counter number already exists." });
      } else {
        setMessage({ type: "error", text: err.message });
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(counter) {
    setMessage(null);
    setBusyId(counter.id);

    try {
      await apiPut(`/counters/${counter.id}/`, {
        counter_no: counter.counter_no,
        name: counter.name,
        operator: operatorValue(counter),
        status: isActive(counter) ? "INACTIVE" : "ACTIVE",
      });
      await load();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setBusyId(null);
    }
  }

  async function deleteCounter(counter) {
    if (!window.confirm("Are you sure you want to delete this counter?")) {
      return;
    }

    setMessage(null);
    setBusyId(counter.id);

    try {
      await apiDelete(`/counters/${counter.id}/`);
      setMessage({ type: "success", text: "Counter deleted." });
      await load();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setBusyId(null);
    }
  }

  const activeCount = counters.filter(isActive).length;

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#12365b]">
          Counter Management
        </h1>
        <p className="mt-2 text-slate-500">
          {isAdmin
            ? "Manage counters, operators and counter status."
            : "View counters, operators and counter status."}
        </p>
      </div>

      {loadError && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {loadError}
        </p>
      )}

      {message && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={`mb-4 rounded-lg px-3 py-2 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Counters</p>
          <h2 className="mt-2 text-3xl font-bold">{counters.length}</h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active Counters</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {activeCount}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Inactive Counters</p>
          <h2 className="mt-2 text-3xl font-bold text-red-500">
            {counters.length - activeCount}
          </h2>
        </div>
      </div>

      {isAdmin && (
        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">Add New Counter</h2>

          <form
            onSubmit={addCounter}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div>
              <label
                htmlFor="counter-no"
                className="mb-1 block text-sm font-medium"
              >
                Counter Number
              </label>
              <input
                id="counter-no"
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Enter e.g. C004"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label
                htmlFor="counter-name"
                className="mb-1 block text-sm font-medium"
              >
                Counter Name
              </label>
              <input
                id="counter-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter counter name"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label
                htmlFor="counter-operator"
                className="mb-1 block text-sm font-medium"
              >
                Operator (optional)
              </label>
              <select
                id="counter-operator"
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="">Not assigned</option>
                {staffUsers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-[#12365b] px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {saving ? "Saving…" : "+ Add Counter"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-xl font-bold">Counter List</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Counter No.</th>
                <th className="p-4">Counter Name</th>
                <th className="p-4">Operator</th>
                <th className="p-4">Status</th>
                {isAdmin && <th className="p-4">Actions</th>}
              </tr>
            </thead>

            <tbody>
              {counters.map((counter) => (
                <tr key={counter.id} className="border-t border-slate-100">
                  <td className="p-4">{counter.id}</td>
                  <td className="p-4 font-semibold">{counter.counter_no}</td>
                  <td className="p-4">{counter.name}</td>
                  <td className="p-4">{operatorOf(counter)}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isActive(counter)
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isActive(counter) ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {isAdmin && (
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={busyId === counter.id}
                          onClick={() => toggleStatus(counter)}
                          className="rounded-lg bg-blue-100 px-3 py-2 text-sm text-blue-700 hover:bg-blue-200 disabled:opacity-60"
                        >
                          Change Status
                        </button>

                        <button
                          type="button"
                          disabled={busyId === counter.id}
                          onClick={() => deleteCounter(counter)}
                          className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 hover:bg-red-200 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {counters.length === 0 && (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 5}
                    className="p-8 text-center text-slate-500"
                  >
                    No counters available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Counters;