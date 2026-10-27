import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCircle2, Megaphone, Ticket, XCircle } from "lucide-react";

import { apiGet, apiPatch, getUser } from "../api";

const REFRESH_MS = 10000;

const asList = (data) => (Array.isArray(data) ? data : data.results ?? []);

const typeInfo = {
  TOKEN_GENERATED: { label: "Token Generated", icon: Ticket },
  TOKEN_CALLED: { label: "Token Called", icon: Megaphone },
  TOKEN_SERVED: { label: "Token Served", icon: CheckCircle2 },
  TOKEN_MISSED: { label: "Token Missed", icon: XCircle },
};

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Notifications() {
  const user = getUser();
  const isCustomer = user.role === "CUSTOMER";

  const [notifications, setNotifications] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setNotifications(asList(await apiGet("/notifications/")));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Load once, then check for new notifications every 10 seconds
  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  async function markAsRead(id) {
    setBusy(true);

    try {
      await apiPatch(`/notifications/${id}/`, { is_read: true });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function markAllAsRead() {
    const unread = notifications.filter((item) => !item.is_read);
    if (unread.length === 0) return;

    setBusy(true);

    try {
      await Promise.all(
        unread.map((item) =>
          apiPatch(`/notifications/${item.id}/`, { is_read: true })
        )
      );
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#12365b]">Notifications</h1>
          <p className="mt-2 text-slate-500">
            View and manage token notifications.
          </p>
        </div>

        <button
          type="button"
          onClick={markAllAsRead}
          disabled={busy || unreadCount === 0}
          className="rounded-lg bg-[#12365b] px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
        >
          Mark All as Read
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

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Notifications</p>
          <h2 className="mt-2 text-3xl font-bold">{notifications.length}</h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Unread Notifications</p>
          <h2 className="mt-2 text-3xl font-bold text-orange-500">
            {unreadCount}
          </h2>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-xl font-bold">Recent Notifications</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {!loaded && (
            <p className="p-6 text-sm text-slate-500">
              Loading notifications…
            </p>
          )}

          {notifications.map((notification) => {
            const info = typeInfo[notification.type] || {
              label: notification.type,
              icon: Bell,
            };
            const Icon = info.icon;

            return (
              <div
                key={notification.id}
                className={`flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between ${
                  notification.is_read ? "bg-white" : "bg-blue-50"
                }`}
              >
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Icon className="h-5 w-5 text-blue-700" aria-hidden="true" />
                  </div>

                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{info.label}</h3>

                      {!notification.is_read && (
                        <span className="rounded-full bg-blue-600 px-2 py-1 text-xs text-white">
                          New
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-600">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {notification.token_no &&
                        `Token: ${notification.token_no} · `}
                      {!isCustomer &&
                        notification.beneficiary_name &&
                        `${notification.beneficiary_name} · `}
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                </div>

                {!notification.is_read && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => markAsRead(notification.id)}
                    className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 disabled:opacity-60"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            );
          })}

          {loaded && notifications.length === 0 && (
            <div className="p-10 text-center text-slate-500">
              <Bell className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
              <p className="mt-3 font-semibold">No notifications available.</p>
              {isCustomer && (
                <p className="mt-1 text-sm">
                  If you expect notifications, ask the admin to link your
                  account to your beneficiary record.
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Notifications;