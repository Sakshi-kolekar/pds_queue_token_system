import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";

import { apiGet, getUser } from "../api";

const roleLabels = {
  ADMIN: "Admin",
  STAFF: "Staff",
};

function formatDate(value) {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Dashboard() {
  const user = getUser();

  const [data, setData] = useState(null);
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const summary = await apiGet("/reports/dashboard/");
      const tokens = await apiGet(`/tokens/?token_date=${summary.date}`);

      setData(summary);
      setQueue(Array.isArray(tokens) ? tokens : tokens.results ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        <p className="mb-3">{error}</p>
        <button
          type="button"
          onClick={load}
          className="rounded-md bg-red-700 px-3 py-1.5 text-white hover:bg-red-600"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-gray-600">Loading dashboard…</p>;
  }

  const t = data.tokens_today;

  const stats = [
    { title: "Total beneficiaries", value: data.total_beneficiaries, color: "text-blue-600" },
    { title: "Tokens today", value: t.total, color: "text-slate-700" },
    { title: "Waiting", value: t.waiting, color: "text-amber-500" },
    { title: "Serving", value: t.serving, color: "text-purple-600" },
    { title: "Served", value: t.served, color: "text-green-600" },
    { title: "Missed", value: t.missed, color: "text-red-600" },
  ];

  // Tokens being served first, then the waiting ones in token order
  const currentQueue = queue
    .filter((token) => token.status === "CALLED" || token.status === "WAITING")
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "CALLED" ? -1 : 1;
      return a.id - b.id;
    })
    .slice(0, 8);

  return (
    <div>
      <header className="mb-6 flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome, {roleLabels[user.role]}! Here is the system overview for{" "}
            {formatDate(data.date)}.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          Refresh
        </button>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.title} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{stat.title}</p>
            <h2 className={`mt-3 text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Current queue */}
        <section className="rounded-xl bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="mb-4 text-lg font-bold">Current queue</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-gray-500">
                <tr>
                  <th className="p-3">Token no.</th>
                  <th className="p-3">Beneficiary name</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {currentQueue.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-500">
                      No tokens in the queue right now.
                    </td>
                  </tr>
                )}

                {currentQueue.map((token) => (
                  <tr key={token.id} className="border-b">
                    <td className="p-3 font-medium">{token.token_no}</td>
                    <td className="p-3">{token.beneficiary_name}</td>
                    <td className="p-3">
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          token.status === "CALLED"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {token.status === "CALLED" ? "Serving" : "Waiting"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick actions */}
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Quick actions</h2>

          <div className="space-y-3">
            <Link
              to="/tokens"
              className="block w-full rounded-lg bg-blue-600 p-3 text-left text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Generate token
            </Link>

            <Link
              to="/beneficiaries"
              className="block w-full rounded-lg bg-green-600 p-3 text-left text-sm font-semibold text-white hover:bg-green-700"
            >
              + Add beneficiary
            </Link>

            <Link
              to="/queue"
              className="block w-full rounded-lg bg-purple-600 p-3 text-left text-sm font-semibold text-white hover:bg-purple-700"
            >
              View queue
            </Link>

            {user.role === "ADMIN" && (
              <Link
                to="/reports"
                className="block w-full rounded-lg bg-teal-600 p-3 text-left text-sm font-semibold text-white hover:bg-teal-700"
              >
                View reports
              </Link>
            )}
          </div>
        </section>
      </div>

      {/* Counters */}
      <section className="mt-6 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Counters</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-gray-500">
              <tr>
                <th className="p-3">Counter</th>
                <th className="p-3">Operator</th>
                <th className="p-3">Current token</th>
                <th className="p-3">Tokens today</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {data.counters.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    No counters yet.
                  </td>
                </tr>
              )}

              {data.counters.map((c) => {
                const active = String(c.status).toUpperCase() === "ACTIVE";

                return (
                  <tr key={c.id} className="border-b">
                    <td className="p-3">
                      {c.counter_no}
                      {c.name ? ` · ${c.name}` : ""}
                    </td>
                    <td className="p-3">{c.operator || "Not assigned"}</td>
                    <td className="p-3 font-medium">
                      {c.current_token || "None"}
                    </td>
                    <td className="p-3">{c.tokens_today.total}</td>
                    <td className="p-3">
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          active
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {c.status}
                      </span>
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

export default Dashboard;