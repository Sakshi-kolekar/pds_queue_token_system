import { useEffect, useState } from "react";

import { apiGet } from "../api";

const asList = (data) => (Array.isArray(data) ? data : data.results ?? []);

const statusLabel = {
  WAITING: "Waiting",
  CALLED: "Called",
  SERVED: "Served",
  MISSED: "Missed",
  CANCELLED: "Cancelled",
};

const statusColor = {
  SERVED: "bg-green-100 text-green-700",
  WAITING: "bg-yellow-100 text-yellow-700",
  CALLED: "bg-blue-100 text-blue-700",
  MISSED: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-700",
};

// Stops a spreadsheet from treating a text value as a formula
function csvCell(value) {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function Reports() {
  const [tokens, setTokens] = useState([]);
  const [slots, setSlots] = useState([]);
  const [counters, setCounters] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [counterId, setCounterId] = useState("");
  const [reportType, setReportType] = useState("All");
  const [search, setSearch] = useState("");

  // Tokens, slots and counters are loaded once
  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [tokenData, slotData, counterData] = await Promise.all([
          apiGet("/tokens/"),
          apiGet("/slots/"),
          apiGet("/counters/"),
        ]);

        if (!active) return;

        setTokens(asList(tokenData));
        setSlots(asList(slotData));
        setCounters(asList(counterData));
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

  // The summary numbers are calculated by the backend for the chosen filters
  useEffect(() => {
    let active = true;

    const params = new URLSearchParams();
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    if (counterId) params.set("counter", counterId);
    if (reportType !== "All") params.set("status", reportType);

    const query = params.toString();

    async function loadSummary() {
      try {
        const data = await apiGet(`/reports/tokens/${query ? `?${query}` : ""}`);
        if (!active) return;
        setSummary(data.summary);
        setError("");
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    loadSummary();

    return () => {
      active = false;
    };
  }, [dateFrom, dateTo, counterId, reportType]);

  function counterIdOf(token) {
    const slot = slots.find((item) => item.id === token.slot);
    if (!slot) return null;
    return typeof slot.counter === "object" ? slot.counter?.id : slot.counter;
  }

  function counterNo(token) {
    const id = counterIdOf(token);
    return counters.find((item) => item.id === id)?.counter_no || "-";
  }

  const term = search.trim().toLowerCase();

  const filteredTokens = tokens.filter((token) => {
    if (dateFrom && token.token_date < dateFrom) return false;
    if (dateTo && token.token_date > dateTo) return false;
    if (reportType !== "All" && token.status !== reportType) return false;
    if (counterId && String(counterIdOf(token)) !== counterId) return false;

    if (!term) return true;

    return (
      token.token_no.toLowerCase().includes(term) ||
      (token.beneficiary_name || "").toLowerCase().includes(term) ||
      counterNo(token).toLowerCase().includes(term)
    );
  });

  const totalTokens = summary?.total ?? 0;
  const servedTokens = summary?.served ?? 0;
  const pendingTokens = (summary?.waiting ?? 0) + (summary?.serving ?? 0);
  const missedTokens = summary?.missed ?? 0;

  const percent = (value) =>
    totalTokens ? Math.round((value / totalTokens) * 100) : 0;

  function exportCSV() {
    const headers = ["Token", "Beneficiary", "Counter", "Status", "Date"];

    const rows = filteredTokens.map((token) => [
      token.token_no,
      token.beneficiary_name,
      counterNo(token),
      statusLabel[token.status] || token.status,
      token.token_date,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `PDS_Token_Report_${new Date().toLocaleDateString("en-CA")}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#12365b]">
            Reports & Analytics
          </h1>
          <p className="mt-2 text-slate-500">
            View token distribution and service reports.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          disabled={filteredTokens.length === 0}
          className="rounded-lg bg-[#12365b] px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
        >
          Download CSV
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {/* Filters */}
      <section className="mb-6 grid grid-cols-1 gap-4 rounded-xl bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="r-from" className="mb-1 block text-sm font-medium">
            From date
          </label>
          <input
            id="r-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="r-to" className="mb-1 block text-sm font-medium">
            To date
          </label>
          <input
            id="r-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="r-counter" className="mb-1 block text-sm font-medium">
            Counter
          </label>
          <select
            id="r-counter"
            value={counterId}
            onChange={(e) => setCounterId(e.target.value)}
            className={`${inputClass} bg-white`}
          >
            <option value="">All counters</option>
            {counters.map((counter) => (
              <option key={counter.id} value={counter.id}>
                {counter.counter_no}
                {counter.name ? ` · ${counter.name}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="r-status" className="mb-1 block text-sm font-medium">
            Status
          </label>
          <select
            id="r-status"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className={`${inputClass} bg-white`}
          >
            <option value="All">All Statuses</option>
            <option value="SERVED">Served</option>
            <option value="WAITING">Waiting</option>
            <option value="CALLED">Called</option>
            <option value="MISSED">Missed</option>
          </select>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border-l-4 border-blue-500 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Tokens</p>
          <h2 className="mt-2 text-3xl font-bold">{totalTokens}</h2>
          <p className="mt-2 text-xs text-slate-500">
            All recorded tokens for these filters
          </p>
        </div>

        <div className="rounded-xl border-l-4 border-green-500 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Served Tokens</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {servedTokens}
          </h2>
          <p className="mt-2 text-xs text-slate-500">Successfully completed</p>
        </div>

        <div className="rounded-xl border-l-4 border-yellow-500 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending Tokens</p>
          <h2 className="mt-2 text-3xl font-bold text-yellow-600">
            {pendingTokens}
          </h2>
          <p className="mt-2 text-xs text-slate-500">Waiting or called</p>
        </div>

        <div className="rounded-xl border-l-4 border-red-500 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Missed Tokens</p>
          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {missedTokens}
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            Beneficiary did not arrive
          </p>
        </div>
      </div>

      <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">Token Summary</h2>

        {[
          { label: "Served", value: servedTokens, bar: "bg-green-500" },
          { label: "Pending", value: pendingTokens, bar: "bg-yellow-500" },
          { label: "Missed", value: missedTokens, bar: "bg-red-500" },
        ].map((item, index, list) => (
          <div key={item.label}>
            <div className="mb-3 flex justify-between text-sm">
              <span>{item.label}</span>
              <span>
                {item.value} / {totalTokens}
              </span>
            </div>
            <div
              className={`h-3 overflow-hidden rounded-full bg-slate-100 ${
                index < list.length - 1 ? "mb-5" : ""
              }`}
            >
              <div
                className={`h-full rounded-full ${item.bar}`}
                style={{ width: `${percent(item.value)}%` }}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-xl font-bold">
            Token Report
            <span className="ml-2 text-sm font-normal text-slate-500">
              {filteredTokens.length}
            </span>
          </h2>
        </div>

        <div className="p-5">
          <input
            type="text"
            aria-label="Search the report"
            placeholder="Search token, beneficiary or counter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="p-4">Token No.</th>
                <th className="p-4">Beneficiary</th>
                <th className="p-4">Counter</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>

            <tbody>
              {!loaded && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Loading report…
                  </td>
                </tr>
              )}

              {filteredTokens.map((token) => (
                <tr key={token.id} className="border-t border-slate-100">
                  <td className="p-4 font-semibold">{token.token_no}</td>
                  <td className="p-4">{token.beneficiary_name}</td>
                  <td className="p-4">{counterNo(token)}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusColor[token.status] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {statusLabel[token.status] || token.status}
                    </span>
                  </td>
                  <td className="p-4">{token.token_date}</td>
                </tr>
              ))}

              {loaded && filteredTokens.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No report records found.
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

export default Reports;