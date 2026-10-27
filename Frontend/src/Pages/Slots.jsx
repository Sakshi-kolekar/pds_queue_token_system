import { useCallback, useEffect, useState } from "react";

import { apiDelete, apiGet, apiPost, getUser } from "../api";

const asList = (data) => (Array.isArray(data) ? data : data.results ?? []);

const statusLabel = {
  AVAILABLE: "Available",
  FULL: "Full",
  CLOSED: "Closed",
};

const statusStyle = {
  AVAILABLE: "bg-green-100 text-green-700",
  FULL: "bg-red-100 text-red-700",
  CLOSED: "bg-slate-100 text-slate-700",
};

function formatTime(time) {
  if (!time) return "";
  const [hours, minutes] = String(time).split(":");
  const hour = Number(hours);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${String(displayHour).padStart(2, "0")}:${minutes} ${period}`;
}

function Slots() {
  const user = getUser();
  const isAdmin = user.role === "ADMIN";

  const [slots, setSlots] = useState([]);
  const [counters, setCounters] = useState([]);
  const [loadError, setLoadError] = useState("");

  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [counterId, setCounterId] = useState("");
  const [max, setMax] = useState("30");

  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [slotData, counterData] = await Promise.all([
        apiGet("/slots/"),
        apiGet("/counters/"),
      ]);

      setSlots(asList(slotData));
      setCounters(asList(counterData));
      setLoadError("");
    } catch (err) {
      setLoadError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const chosenCounter =
    counterId || (counters[0] ? String(counters[0].id) : "");

  function counterText(slot) {
    const id =
      typeof slot.counter === "object" ? slot.counter?.id : slot.counter;
    const counter = counters.find((item) => item.id === id);

    if (!counter) return `Counter #${id}`;
    return `${counter.counter_no}${counter.name ? ` · ${counter.name}` : ""}`;
  }

  async function addSlot(event) {
    event.preventDefault();
    setMessage(null);

    if (!chosenCounter) {
      setMessage({
        type: "error",
        text: "Create a counter first, then add slots for it.",
      });
      return;
    }

    if (!date) {
      setMessage({ type: "error", text: "Please select a slot date." });
      return;
    }

    if (end <= start) {
      setMessage({
        type: "error",
        text: "End time must be after start time.",
      });
      return;
    }

    if (Number(max) < 1) {
      setMessage({
        type: "error",
        text: "Maximum tokens must be at least 1.",
      });
      return;
    }

    setSaving(true);

    try {
      await apiPost("/slots/", {
        counter: Number(chosenCounter),
        slot_date: date,
        start_time: start,
        end_time: end,
        max_tokens: Number(max),
      });

      setMessage({ type: "success", text: "Slot added successfully." });
      setDate("");
      setStart("");
      setEnd("");
      setMax("30");
      await load();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function deleteSlot(slot) {
    if (!window.confirm("Delete this slot?")) return;

    setMessage(null);

    try {
      await apiDelete(`/slots/${slot.id}/`);
      setMessage({ type: "success", text: "Slot deleted." });
      await load();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  const inputClass = "w-full rounded border border-slate-300 p-3";

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0b2a5b]">Slots Management</h1>

      <p className="mb-6 mt-1 text-sm text-gray-500">
        {isAdmin
          ? "Create and manage token distribution time slots."
          : "View the token distribution time slots."}
      </p>

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

      {isAdmin && (
        <form
          onSubmit={addSlot}
          className="mb-6 grid grid-cols-1 gap-4 rounded-xl bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3"
        >
          <div>
            <label htmlFor="slot-date" className="mb-1 block text-sm">
              Slot Date
            </label>
            <input
              id="slot-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="slot-start" className="mb-1 block text-sm">
              Start Time
            </label>
            <input
              id="slot-start"
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="slot-end" className="mb-1 block text-sm">
              End Time
            </label>
            <input
              id="slot-end"
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="slot-counter" className="mb-1 block text-sm">
              Counter
            </label>
            <select
              id="slot-counter"
              value={chosenCounter}
              onChange={(e) => setCounterId(e.target.value)}
              disabled={counters.length === 0}
              className={`${inputClass} bg-white disabled:bg-slate-50`}
            >
              {counters.length === 0 && (
                <option value="">No counters yet</option>
              )}
              {counters.map((counter) => (
                <option key={counter.id} value={counter.id}>
                  {counter.counter_no}
                  {counter.name ? ` · ${counter.name}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="slot-max" className="mb-1 block text-sm">
              Maximum Tokens
            </label>
            <input
              id="slot-max"
              type="number"
              min="1"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="self-end rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "+ Add Slot"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-gray-600">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Start</th>
              <th className="p-4">End</th>
              <th className="p-4">Counter</th>
              <th className="p-4">Max Tokens</th>
              <th className="p-4">Status</th>
              {isAdmin && <th className="p-4">Action</th>}
            </tr>
          </thead>

          <tbody>
            {slots.map((slot) => (
              <tr key={slot.id} className="border-t">
                <td className="p-4">{slot.slot_date}</td>
                <td className="p-4">{formatTime(slot.start_time)}</td>
                <td className="p-4">{formatTime(slot.end_time)}</td>
                <td className="p-4">{counterText(slot)}</td>
                <td className="p-4">{slot.max_tokens}</td>

                <td className="p-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      statusStyle[slot.status] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {statusLabel[slot.status] || slot.status}
                  </span>
                </td>

                {isAdmin && (
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => deleteSlot(slot)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {slots.length === 0 && (
              <tr>
                <td
                  colSpan={isAdmin ? 7 : 6}
                  className="p-6 text-center text-gray-500"
                >
                  No slots available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Slots;