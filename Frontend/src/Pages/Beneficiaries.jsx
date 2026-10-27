import { useCallback, useEffect, useState } from "react";

import { apiGet, apiPatch, apiPost, getUser } from "../api";

const asList = (data) => (Array.isArray(data) ? data : data.results ?? []);

const initialForm = {
  full_name: "",
  aadhaar_no: "",
  phone: "",
  address: "",
  user: "",
};

export default function Beneficiaries() {
  const isAdmin = getUser().role === "ADMIN";

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await apiGet("/beneficiaries/");
      setBeneficiaries(asList(data));
    } catch (err) {
      setError(err.message || "Unable to load beneficiaries.");
    }

    // The user list is available to admins only
    if (isAdmin) {
      try {
        const users = asList(await apiGet("/users/"));
        setCustomers(
          users.filter((u) => u.role === "CUSTOMER" && u.is_active)
        );
      } catch {
        setCustomers([]);
      }
    }
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  // Customers that are not yet linked to a beneficiary
  const linkedIds = beneficiaries.map((item) => item.user).filter(Boolean);
  const freeCustomers = customers.filter((c) => !linkedIds.includes(c.id));

  function accountName(userId) {
    if (!userId) return null;
    const match = customers.find((c) => c.id === userId);
    return match ? match.email || match.username : "Linked";
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.full_name.trim() ||
      !form.aadhaar_no ||
      !form.phone ||
      !form.address.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^\d{12}$/.test(form.aadhaar_no)) {
      setError("Aadhaar number must contain exactly 12 digits.");
      return;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      setError("Phone number must contain exactly 10 digits.");
      return;
    }

    setLoading(true);

    try {
      const body = {
        full_name: form.full_name.trim(),
        aadhaar_no: form.aadhaar_no,
        phone: form.phone,
        address: form.address.trim(),
        status: "ACTIVE",
      };

      if (isAdmin && form.user) body.user = Number(form.user);

      await apiPost("/beneficiaries/", body);

      setSuccess("Beneficiary added successfully.");
      setForm(initialForm);
      await load();
    } catch (err) {
      if (err.data?.aadhaar_no) {
        setError("This Aadhaar number is already in use.");
      } else {
        setError(err.message || "Unable to save beneficiary.");
      }
    } finally {
      setLoading(false);
    }
  };

  async function setLink(beneficiary, userId) {
    setError("");
    setSuccess("");

    try {
      await apiPatch(`/beneficiaries/${beneficiary.id}/`, { user: userId });
      setSuccess(
        userId
          ? "Customer account linked. The customer can now see their notifications."
          : "Customer account unlinked."
      );
      await load();
    } catch (err) {
      setError(err.message || "Could not update the link.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500";

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-800">
        Beneficiaries
      </h1>

      <p className="mb-6 text-gray-600">
        Register and manage beneficiary details.
      </p>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      <div className="mb-8 rounded-xl bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-5 text-xl font-semibold text-gray-800">
          Add Beneficiary
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Enter full name"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Aadhaar Number
            </label>
            <input
              type="text"
              name="aadhaar_no"
              value={form.aadhaar_no}
              onChange={handleChange}
              placeholder="Enter 12-digit test number"
              maxLength={12}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              maxLength={10}
              className={inputClass}
              required
            />
          </div>

          {isAdmin && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Customer account (optional)
              </label>
              <select
                name="user"
                value={form.user}
                onChange={handleChange}
                className={`${inputClass} bg-white`}
              >
                <option value="">Not linked</option>
                {freeCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.email || c.username}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter address"
              rows={3}
              className={inputClass}
              required
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Add Beneficiary"}
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-xl font-semibold text-gray-800">
            Beneficiary List
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Full Name</th>
                <th className="p-4">Aadhaar Number</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Address</th>
                <th className="p-4">Status</th>
                <th className="p-4">Account</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {beneficiaries.length > 0 ? (
                beneficiaries.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4">{item.id}</td>
                    <td className="p-4">{item.full_name}</td>
                    <td className="p-4">{item.aadhaar_no}</td>
                    <td className="p-4">{item.phone}</td>
                    <td className="p-4">{item.address}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          item.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="p-4">
                      {item.user ? (
                        <div className="flex items-center gap-2">
                          <span className="text-green-700">
                            {isAdmin ? accountName(item.user) : "Linked"}
                          </span>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => setLink(item, null)}
                              className="text-xs text-blue-800 hover:underline"
                            >
                              Unlink
                            </button>
                          )}
                        </div>
                      ) : isAdmin ? (
                        <select
                          aria-label={`Link a customer account to ${item.full_name}`}
                          value=""
                          onChange={(e) =>
                            e.target.value &&
                            setLink(item, Number(e.target.value))
                          }
                          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs"
                        >
                          <option value="">Link account…</option>
                          {freeCustomers.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.email || c.username}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-400">Not linked</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    No beneficiaries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}