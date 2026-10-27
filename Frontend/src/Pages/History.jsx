import { useEffect, useState } from "react";

import { apiGet } from "../api";

const asList = (data) => (Array.isArray(data) ? data : data.results ?? []);

const statusLabel = {
  GENERATED: "Generated",
  WAITING: "Waiting",
  CALLED: "Called",
  SERVED: "Served",
  MISSED: "Missed",
};

const statusStyle = {
  GENERATED: "bg-purple-100 text-purple-700",
  WAITING: "bg-yellow-100 text-yellow-700",
  CALLED: "bg-blue-100 text-blue-700",
  SERVED: "bg-green-100 text-green-700",
  MISSED: "bg-red-100 text-red-700",
};

const remarks = {
  CREATE: "Token created successfully",
  CALL: "Token called at counter",
  SERVE: "Service completed",
  MISSED: "Beneficiary did not arrive",
};

// Turn one audit log entry into one table row
function toRow(log, tokensById) {
  const token = tokensById[log.entity_id];
  const details = log.details || {};
  const isCreate = log.action === "CREATE";

  return {
    id: log.id,
    token: token?.token_no || details.token_no || `#${log.entity_id}`,
    beneficiary: token?.beneficiary_name || "-",
    oldStatus: isCreate ? "GENERATED" : details.old_status,
    newStatus: isCreate ? details.status || "WAITING" : details.new_status,
    changedBy: log.username || "-",
    at: log.created_at,
    remarks: remarks[log.action] || log.action,
  };
}

function History() {
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [logs, tokens] = await Promise.all([
          apiGet("/audit-logs/?entity_name=Token"),
          apiGet("/tokens/"),
        ]);

        if (!active) return;

        const tokensById = {};
        asList(tokens).forEach((token) => {
          tokensById[token.id] = token;
        });

        setRows(asList(logs).map((log) => toRow(log, tokensById)));
        setError("");
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoaded(true);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const term = search.trim().toLowerCase();

  const filtered = rows.filter((item) => {
    const matchesSearch =
      !term ||
      item.token.toLowerCase().includes(term) ||
      item.beneficiary.toLowerCase().includes(term) ||
      item.changedBy.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "All" || item.newStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function badge(status) {
    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          statusStyle[status] || "bg-slate-100 text-slate-700"
        }`}
      >
        {statusLabel[status] || status || "-"}
      </span>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#12365b]">
          Token Status History
        </h1>
        <p className="mt-2 text-slate-500">
          Track token status changes and activities.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Records</p>
          <h2 className="mt-2 text-3xl font-bold">{rows.length}</h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Served Tokens</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {rows.filter((item) => item.newStatus === "SERVED").length}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Missed Tokens</p>
          <h2 className="mt-2 text-3xl font-bold text-red-500">
            {rows.filter((item) => item.newStatus === "MISSED").length}
          </h2>
        </div>
      </div>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">History Records</h2>

        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="text"
            aria-label="Search history"
            placeholder="Search token, beneficiary or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="WAITING">Waiting</option>
            <option value="CALLED">Called</option>
            <option value="SERVED">Served</option>
            <option value="MISSED">Missed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="p-4">Token</th>
                <th className="p-4">Beneficiary</th>
                <th className="p-4">Old Status</th>
                <th className="p-4">New Status</th>
                <th className="p-4">Changed By</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Remarks</th>
              </tr>
            </thead>

            <tbody>
              {!loaded && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading history…
                  </td>
                </tr>
              )}

              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="p-4 font-semibold">{item.token}</td>
                  <td className="p-4">{item.beneficiary}</td>
                  <td className="p-4">{badge(item.oldStatus)}</td>
                  <td className="p-4">{badge(item.newStatus)}</td>
                  <td className="p-4">{item.changedBy}</td>
                  <td className="p-4">
                    <div>
                      {new Date(item.at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(item.at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="p-4">{item.remarks}</td>
                </tr>
              ))}

              {loaded && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No history records found.
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

export default History;