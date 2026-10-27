import { useCallback, useEffect, useState } from "react";

import { apiGet, apiPost, getUser } from "../api";

const REFRESH_MS = 5000;

const asList = (data) => (Array.isArray(data) ? data : data.results ?? []);

// Local date as YYYY-MM-DD (matches the dates the backend stores)
const todayISO = () => new Date().toLocaleDateString("en-CA");

const statusLabel = {
  WAITING: "Waiting",
  CALLED: "Serving",
  SERVED: "Served",
  MISSED: "Missed",
  CANCELLED: "Cancelled",
};

const statusStyle = {
  CALLED: "bg-green-100 text-green-700",
  SERVED: "bg-blue-100 text-blue-700",
  WAITING: "bg-amber-100 text-amber-700",
  MISSED: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-700",
};

// Serving first, then waiting, then the finished ones
const order = { CALLED: 0, WAITING: 1, SERVED: 2, MISSED: 3, CANCELLED: 4 };

function Queue() {
  const user = getUser();
  const isStaff = user.role === "ADMIN" || user.role === "STAFF";

  const [tokens, setTokens] = useState([]);
  const [live, setLive] = useState(null);
  const [slots, setSlots] = useState([]);
  const [counters, setCounters] = useState([]);

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  // Slots and counters are needed only to show the counter of each token
  useEffect(() => {
    if (!isStaff) return;

    let active = true;

    async function loadStatic() {
      try {
        const [slotData, counterData] = await Promise.all([
          apiGet("/slots/"),
          apiGet("/counters/"),
        ]);

        if (!active) return;

        setSlots(asList(slotData));
        setCounters(asList(counterData));
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    loadStatic();

    return () => {
      active = false;
    };
  }, [isStaff]);

  const load = useCallback(async () => {
    try {
      if (isStaff) {
        setTokens(asList(await apiGet(`/tokens/?token_date=${todayISO()}`)));
      } else {
        setLive(await apiGet("/queue/live/"));
      }
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoaded(true);
    }
  }, [isStaff]);

  // Load once, then refresh every 5 seconds
  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  function counterNo(token) {
    const slot = slots.find((item) => item.id === token.slot);
    if (!slot) return "-";

    const id = typeof slot.counter === "object" ? slot.counter?.id : slot.counter;
    return counters.find((item) => item.id === id)?.counter_no || "-";
  }

  // One list of rows for both kinds of user
  let rows = [];

  if (isStaff) {
    rows = tokens.map((token) => ({
      id: token.id,
      token_no: token.token_no,
      beneficiary: token.beneficiary_name,
      counter: counterNo(token),
      status: token.status,
    }));
  } else if (live) {
    rows = [
      ...live.now_serving,
      ...live.waiting,
      ...live.recently_served,
      ...live.missed,
    ].map((token) => ({
      id: token.id,
      token_no: token.token_no,
      beneficiary: null,
      counter: token.counter_no,
      status: token.status,
    }));
  }

  rows.sort((a, b) => order[a.status] - order[b.status] || a.id - b.id);

  // Position is counted only among tokens still in the queue
  let position = 0;
  const table = rows.map((row) => ({
    ...row,
    position:
      row.status === "CALLED" || row.status === "WAITING" ? ++position : "-",
  }));

  const cards = isStaff
    ? [
        { label: "Total Tokens", value: rows.length },
        {
          label: "Waiting",
          value: rows.filter((row) => row.status === "WAITING").length,
        },
        {
          label: "Serving",
          value: rows.filter((row) => row.status === "CALLED").length,
        },
      ]
    : [
        {
          label: "Total Tokens",
          value: live
            ? live.counts.waiting +
              live.counts.now_serving +
              live.counts.served +
              live.counts.missed
            : 0,
        },
        { label: "Waiting", value: live?.counts.waiting ?? 0 },
        { label: "Serving", value: live?.counts.now_serving ?? 0 },
      ];

  const nextWaiting = rows.find((row) => row.status === "WAITING");

  async function changeStatus(id, action) {
    setActionError("");
    setBusy(true);

    try {
      await apiPost(`/tokens/${id}/${action}/`, {});
      await load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const columns = isStaff ? 6 : 4;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {isStaff ? "Queue Management" : "Live Queue"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isStaff
              ? "Manage token queue and call the next beneficiary."
              : "See which tokens are being served today."}
          </p>
        </div>

        {isStaff && (
          <button
            type="button"
            onClick={() => nextWaiting && changeStatus(nextWaiting.id, "call")}
            disabled={busy || !nextWaiting}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Call Next Token
          </button>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {actionError && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {actionError}
        </p>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((item) => (
          <div key={item.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-gray-600">
            <tr>
              <th className="p-4">Position</th>
              <th className="p-4">Token No.</th>
              {isStaff && <th className="p-4">Beneficiary</th>}
              <th className="p-4">Counter</th>
              <th className="p-4">Status</th>
              {isStaff && <th className="p-4">Action</th>}
            </tr>
          </thead>

          <tbody>
            {!loaded && (
              <tr>
                <td
                  colSpan={columns}
                  className="p-6 text-center text-gray-500"
                >
                  Loading queue…
                </td>
              </tr>
            )}

            {table.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-4">{item.position}</td>

                <td className="p-4 font-semibold">{item.token_no}</td>

                {isStaff && <td className="p-4">{item.beneficiary}</td>}

                <td className="p-4">{item.counter}</td>

                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      statusStyle[item.status]
                    }`}
                  >
                    {statusLabel[item.status]}
                  </span>
                </td>

                {isStaff && (
                  <td className="p-4">
                    {item.status === "CALLED" ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => changeStatus(item.id, "serve")}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                        >
                          Serve
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => changeStatus(item.id, "missed")}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          Missed
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                )}
              </tr>
            ))}

            {loaded && table.length === 0 && (
              <tr>
                <td
                  colSpan={columns}
                  className="p-6 text-center text-gray-500"
                >
                  No tokens in the queue today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Queue;