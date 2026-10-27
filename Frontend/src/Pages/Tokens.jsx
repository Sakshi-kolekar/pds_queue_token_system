import { useCallback, useEffect, useState } from "react";
import { Search, Ticket } from "lucide-react";

import { apiGet, apiPost } from "../api";

const statusLabel = {
  WAITING: "Waiting",
  CALLED: "Serving",
  SERVED: "Served",
  MISSED: "Missed",
  CANCELLED: "Cancelled",
};

const statusStyle = {
  WAITING: "bg-amber-100 text-amber-700",
  CALLED: "bg-blue-100 text-blue-700",
  SERVED: "bg-green-100 text-green-700",
  MISSED: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-700",
};

const asList = (data) => (Array.isArray(data) ? data : data.results ?? []);

// Local date as YYYY-MM-DD (matches the dates the backend stores)
const todayISO = () => new Date().toLocaleDateString("en-CA");

const hhmm = (time) => (time ? String(time).slice(0, 5) : "");

function Tokens() {
  const [tokens, setTokens] = useState([]);
  const [slots, setSlots] = useState([]);
  const [counters, setCounters] = useState([]);
  const [loadError, setLoadError] = useState("");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [slotId, setSlotId] = useState("");

  const [message, setMessage] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(null);

  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const [tokenData, slotData, counterData] = await Promise.all([
        apiGet(`/tokens/?token_date=${todayISO()}`),
        apiGet("/slots/"),
        apiGet("/counters/"),
      ]);

      setTokens(asList(tokenData));
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

  const today = todayISO();

  // Only today's slots that can still take tokens
  const todaySlots = slots.filter(
    (slot) => slot.slot_date === today && slot.status === "AVAILABLE"
  );

  const chosenSlot = slotId || (todaySlots[0] ? String(todaySlots[0].id) : "");

  function counterOf(slot) {
    if (!slot) return null;
    const id = typeof slot.counter === "object" ? slot.counter?.id : slot.counter;
    return counters.find((counter) => counter.id === id) || null;
  }

  function counterText(counter) {
    if (!counter) return "-";
    return `${counter.counter_no}${counter.name ? ` · ${counter.name}` : ""}`;
  }

  function slotText(slot) {
    if (!slot) return "-";
    return `${hhmm(slot.start_time)} - ${hhmm(slot.end_time)}`;
  }

  function slotById(id) {
    return slots.find((slot) => slot.id === Number(id));
  }

  async function searchBeneficiaries(event) {
    event.preventDefault();
    setMessage(null);

    if (!query.trim()) {
      setMessage({
        type: "error",
        text: "Enter a name, Aadhaar number or phone number to search.",
      });
      return;
    }

    setSearching(true);

    try {
      const data = await apiGet(
        `/beneficiaries/?search=${encodeURIComponent(query.trim())}`
      );
      const list = asList(data);

      setResults(list);
      setSelected(null);

      if (list.length === 0) {
        setMessage({
          type: "error",
          text: "No beneficiary found. Add them on the Beneficiaries page first.",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSearching(false);
    }
  }

  async function generateToken() {
    setMessage(null);

    if (!selected) {
      setMessage({ type: "error", text: "Search and select a beneficiary first." });
      return;
    }

    if (selected.status !== "ACTIVE") {
      setMessage({
        type: "error",
        text: "This beneficiary is inactive and cannot get a token.",
      });
      return;
    }

    if (!chosenSlot) {
      setMessage({
        type: "error",
        text: "No slot is available for today. Ask the admin to create one.",
      });
      return;
    }

    const openToken = tokens.find(
      (token) =>
        token.beneficiary === selected.id &&
        (token.status === "WAITING" || token.status === "CALLED")
    );

    if (openToken) {
      setMessage({
        type: "error",
        text: `${selected.full_name} already has an active token today (${openToken.token_no}).`,
      });
      return;
    }

    setGenerating(true);

    try {
      const token = await apiPost("/tokens/", {
        beneficiary: selected.id,
        slot: Number(chosenSlot),
      });

      setPreview(token);
      setMessage({
        type: "success",
        text: `Token ${token.token_no} generated successfully!`,
      });
      setSelected(null);
      setResults([]);
      setQuery("");
      await load();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setGenerating(false);
    }
  }

  async function changeStatus(token, action) {
    setActionError("");
    setBusyId(token.id);

    try {
      await apiPost(`/tokens/${token.id}/${action}/`, {});
      await load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const summary = [
    { key: "WAITING", title: "Waiting tokens" },
    { key: "CALLED", title: "Serving tokens" },
    { key: "SERVED", title: "Served tokens" },
    { key: "MISSED", title: "Missed tokens" },
  ];

  const previewSlot = preview ? slotById(preview.slot) : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0b2a5b] md:text-3xl">
          Generate Token
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Search beneficiary details and generate a queue token.
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

      {/* Token summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.title}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-800">
              {tokens.filter((token) => token.status === item.key).length}
            </h2>
          </div>
        ))}
      </div>

      {/* Generate form and token preview */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
          <h2 className="mb-5 text-xl font-bold">Beneficiary details</h2>

          <form onSubmit={searchBeneficiaries} className="mb-4 flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, Aadhaar or phone"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={searching}
              className="flex items-center gap-2 rounded-lg bg-blue-800 px-5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              {searching ? "Searching…" : "Search"}
            </button>
          </form>

          {results.length > 0 && !selected && (
            <ul className="mb-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {results.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-slate-50"
                  >
                    <span className="font-medium">{item.full_name}</span>
                    <span className="text-slate-500">
                      {item.aadhaar_no} · {item.phone}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selected && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
              <div>
                <p className="font-semibold">{selected.full_name}</p>
                <p className="text-slate-500">
                  Aadhaar: {selected.aadhaar_no} · Phone: {selected.phone}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    selected.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {selected.status}
                </span>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-xs text-blue-800 hover:underline"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="slot"
              className="mb-2 block text-sm font-medium"
            >
              Slot and counter
            </label>
            <select
              id="slot"
              value={chosenSlot}
              onChange={(e) => setSlotId(e.target.value)}
              disabled={todaySlots.length === 0}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-800 disabled:bg-slate-50"
            >
              {todaySlots.length === 0 && (
                <option value="">No slot available today</option>
              )}
              {todaySlots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slotText(slot)} · {counterText(counterOf(slot))}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={generateToken}
            disabled={generating}
            className="w-full rounded-lg bg-blue-800 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:opacity-60"
          >
            {generating ? "Generating…" : "Generate token"}
          </button>

          {message && (
            <p
              role={message.type === "error" ? "alert" : "status"}
              className={`mt-4 rounded-lg p-3 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </p>
          )}
        </section>

        {/* Token preview */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="mb-5 text-xl font-bold">Token preview</h2>

          <div className="rounded-xl border border-slate-200 p-5">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                <Ticket className="h-7 w-7 text-blue-800" aria-hidden="true" />
              </div>

              <p className="mt-4 text-sm text-slate-500">Token number</p>

              <h3 className="my-2 text-4xl font-extrabold text-blue-900">
                {preview?.token_no || "T----"}
              </h3>

              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  statusStyle[preview?.status || "WAITING"]
                }`}
              >
                {statusLabel[preview?.status || "WAITING"]}
              </span>
            </div>

            <div className="my-5 border-t border-dashed border-slate-300" />

            <div className="space-y-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Beneficiary</span>
                <span className="text-right font-semibold">
                  {preview?.beneficiary_name || "Not generated yet"}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Slot</span>
                <span className="font-semibold">{slotText(previewSlot)}</span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Counter</span>
                <span className="font-semibold">
                  {counterText(counterOf(previewSlot))}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Date</span>
                <span className="font-semibold">
                  {preview?.token_date || today}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Token preview updates after generating a token.
          </p>
        </section>
      </div>

      {/* Today's token list */}
      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-bold">Today&apos;s token list</h2>
          <p className="mt-1 text-sm text-slate-500">
            Call a token, then mark it served or missed.
          </p>
        </div>

        {actionError && (
          <p
            role="alert"
            className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {actionError}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4">Token no.</th>
                <th className="p-4">Beneficiary</th>
                <th className="p-4">Slot</th>
                <th className="p-4">Counter</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {tokens.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No tokens generated today.
                  </td>
                </tr>
              )}

              {tokens.map((token) => {
                const slot = slotById(token.slot);
                const busy = busyId === token.id;

                return (
                  <tr key={token.id} className="border-t border-slate-100">
                    <td className="p-4 font-semibold text-blue-900">
                      {token.token_no}
                    </td>
                    <td className="p-4">{token.beneficiary_name}</td>
                    <td className="p-4">{slotText(slot)}</td>
                    <td className="p-4">{counterText(counterOf(slot))}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          statusStyle[token.status]
                        }`}
                      >
                        {statusLabel[token.status]}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {token.status === "WAITING" && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => changeStatus(token, "call")}
                            className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                          >
                            Call
                          </button>
                        )}

                        {token.status === "CALLED" && (
                          <>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => changeStatus(token, "serve")}
                              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                            >
                              Serve
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => changeStatus(token, "missed")}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                              Missed
                            </button>
                          </>
                        )}

                        {(token.status === "SERVED" ||
                          token.status === "MISSED" ||
                          token.status === "CANCELLED") && (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Tokens;