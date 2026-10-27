import { useCallback, useEffect, useState } from "react";

import { apiGet, apiPatch, apiPost, getUser } from "../api";

const asList = (data) => (Array.isArray(data) ? data : data.results ?? []);

const roleLabels = {
  ADMIN: "Admin",
  STAFF: "Staff",
  CUSTOMER: "Customer",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500";

const buttonClass =
  "rounded-lg bg-[#12365b] px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60";

function Notice({ notice }) {
  if (!notice) return null;

  return (
    <p
      role={notice.type === "error" ? "alert" : "status"}
      className={`mb-4 rounded-lg px-3 py-2 text-sm ${
        notice.type === "success"
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {notice.text}
    </p>
  );
}

function detailText(details) {
  if (!details || typeof details !== "object") return "";

  return Object.entries(details)
    .map(([key, value]) => `${key.replace(/_/g, " ")}: ${value}`)
    .join(" · ");
}

function Settings() {
  const me = getUser();

  // Profile
  const [profile, setProfile] = useState({
    username: me.username,
    email: me.email || "",
  });
  const [profileNotice, setProfileNotice] = useState(null);
  const [profileBusy, setProfileBusy] = useState(false);

  // Password
  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });
  const [passwordNotice, setPasswordNotice] = useState(null);
  const [passwordBusy, setPasswordBusy] = useState(false);

  // Users and roles
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState("ALL");
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "STAFF",
  });
  const [userNotice, setUserNotice] = useState(null);
  const [userBusy, setUserBusy] = useState(null);

  // Important action history
  const [logs, setLogs] = useState([]);
  const [loadError, setLoadError] = useState("");

  const loadAdminData = useCallback(async () => {
    try {
      const [userData, logData] = await Promise.all([
        apiGet("/users/"),
        apiGet("/audit-logs/"),
      ]);

      setUsers(asList(userData));
      setLogs(asList(logData).slice(0, 15));
      setLoadError("");
    } catch (err) {
      setLoadError(err.message);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  async function saveProfile(event) {
    event.preventDefault();
    setProfileNotice(null);

    if (!profile.username.trim() || !profile.email.trim()) {
      setProfileNotice({
        type: "error",
        text: "Username and email are required.",
      });
      return;
    }

    setProfileBusy(true);

    try {
      const data = await apiPatch("/auth/me/", {
        username: profile.username.trim(),
        email: profile.email.trim(),
      });

      localStorage.setItem(
        "user",
        JSON.stringify({ ...getUser(), username: data.username, email: data.email })
      );

      setProfile({ username: data.username, email: data.email });
      setProfileNotice({ type: "success", text: "Profile saved." });
    } catch (err) {
      setProfileNotice({ type: "error", text: err.message });
    } finally {
      setProfileBusy(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setPasswordNotice(null);

    if (!password.current || !password.newPassword || !password.confirm) {
      setPasswordNotice({
        type: "error",
        text: "Please fill all password fields.",
      });
      return;
    }

    if (password.newPassword.length < 8) {
      setPasswordNotice({
        type: "error",
        text: "New password must contain at least 8 characters.",
      });
      return;
    }

    if (password.newPassword !== password.confirm) {
      setPasswordNotice({
        type: "error",
        text: "New password and confirm password do not match.",
      });
      return;
    }

    setPasswordBusy(true);

    try {
      await apiPost("/auth/change-password/", {
        current_password: password.current,
        new_password: password.newPassword,
      });

      setPassword({ current: "", newPassword: "", confirm: "" });
      setPasswordNotice({
        type: "success",
        text: "Password changed successfully.",
      });
    } catch (err) {
      setPasswordNotice({ type: "error", text: err.message });
    } finally {
      setPasswordBusy(false);
    }
  }

  async function addUser(event) {
    event.preventDefault();
    setUserNotice(null);

    if (!newUser.username.trim() || !newUser.email.trim() || !newUser.password) {
      setUserNotice({ type: "error", text: "Please fill all fields." });
      return;
    }

    if (newUser.password.length < 8) {
      setUserNotice({
        type: "error",
        text: "Password must contain at least 8 characters.",
      });
      return;
    }

    setUserBusy("new");

    try {
      await apiPost("/users/", {
        username: newUser.username.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        role: newUser.role,
      });

      setNewUser({ username: "", email: "", password: "", role: "STAFF" });
      setUserNotice({ type: "success", text: "User added successfully." });
      await loadAdminData();
    } catch (err) {
      setUserNotice({ type: "error", text: err.message });
    } finally {
      setUserBusy(null);
    }
  }

  async function updateUser(user, changes) {
    setUserNotice(null);
    setUserBusy(user.id);

    try {
      await apiPatch(`/users/${user.id}/`, changes);
      await loadAdminData();
    } catch (err) {
      setUserNotice({ type: "error", text: err.message });
    } finally {
      setUserBusy(null);
    }
  }

  function changeRole(user, role) {
    if (
      role === "ADMIN" &&
      !window.confirm(
        `Make ${user.username} an Admin? Admins have full access to the system.`
      )
    ) {
      return;
    }

    updateUser(user, { role });
  }

  const visibleUsers = users.filter(
    (user) => userFilter === "ALL" || user.role === userFilter
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#12365b]">Settings</h1>
        <p className="mt-2 text-slate-500">
          Manage your profile, users and system activity.
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

      <div className="space-y-6">
        {/* Profile */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Profile Settings</h2>
            <p className="mt-1 text-sm text-slate-500">
              Update your profile information.
            </p>
          </div>

          <Notice notice={profileNotice} />

          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label htmlFor="s-username" className="mb-1 block text-sm font-medium">
                Username
              </label>
              <input
                id="s-username"
                type="text"
                value={profile.username}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="s-email" className="mb-1 block text-sm font-medium">
                Email Address
              </label>
              <input
                id="s-email"
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>

            <button type="submit" disabled={profileBusy} className={buttonClass}>
              {profileBusy ? "Saving…" : "Save Profile"}
            </button>
          </form>
        </section>

        {/* Password */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Change Password</h2>
            <p className="mt-1 text-sm text-slate-500">
              Update your account password.
            </p>
          </div>

          <Notice notice={passwordNotice} />

          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label htmlFor="s-current" className="mb-1 block text-sm font-medium">
                Current Password
              </label>
              <input
                id="s-current"
                type="password"
                autoComplete="current-password"
                value={password.current}
                onChange={(e) =>
                  setPassword({ ...password, current: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="s-new" className="mb-1 block text-sm font-medium">
                New Password
              </label>
              <input
                id="s-new"
                type="password"
                autoComplete="new-password"
                value={password.newPassword}
                onChange={(e) =>
                  setPassword({ ...password, newPassword: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="s-confirm" className="mb-1 block text-sm font-medium">
                Confirm New Password
              </label>
              <input
                id="s-confirm"
                type="password"
                autoComplete="new-password"
                value={password.confirm}
                onChange={(e) =>
                  setPassword({ ...password, confirm: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>

            <button type="submit" disabled={passwordBusy} className={buttonClass}>
              {passwordBusy ? "Updating…" : "Update Password"}
            </button>
          </form>
        </section>

        {/* Users and roles */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Users and Roles</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add staff accounts and manage who can do what.
            </p>
          </div>

          <Notice notice={userNotice} />

          <form
            onSubmit={addUser}
            className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div>
              <label htmlFor="n-username" className="mb-1 block text-sm font-medium">
                Username
              </label>
              <input
                id="n-username"
                type="text"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="n-email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <input
                id="n-email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="n-password" className="mb-1 block text-sm font-medium">
                Password
              </label>
              <input
                id="n-password"
                type="password"
                autoComplete="new-password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="n-role" className="mb-1 block text-sm font-medium">
                Role
              </label>
              <select
                id="n-role"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className={`${inputClass} bg-white`}
              >
                <option value="STAFF">Staff</option>
                <option value="CUSTOMER">Customer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={userBusy === "new"}
                className={buttonClass}
              >
                {userBusy === "new" ? "Adding…" : "+ Add User"}
              </button>
            </div>
          </form>

          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-semibold">
              Users
              <span className="ml-2 text-sm font-normal text-slate-500">
                {visibleUsers.length}
              </span>
            </h3>
            <select
              aria-label="Filter users by role"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="ALL">All roles</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">Username</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {visibleUsers.map((user) => {
                  const isMe = user.id === me.id;
                  const busy = userBusy === user.id;

                  return (
                    <tr key={user.id} className="border-t border-slate-100">
                      <td className="p-3 font-medium">
                        {user.username}
                        {isMe && (
                          <span className="ml-2 text-xs text-slate-500">
                            (you)
                          </span>
                        )}
                      </td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        <select
                          aria-label={`Role of ${user.username}`}
                          value={user.role}
                          disabled={isMe || busy}
                          onChange={(e) => changeRole(user, e.target.value)}
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 disabled:bg-slate-50"
                        >
                          {Object.entries(roleLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              user.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                          <button
                            type="button"
                            disabled={isMe || busy}
                            onClick={() =>
                              updateUser(user, { is_active: !user.is_active })
                            }
                            className="text-xs text-blue-800 hover:underline disabled:text-slate-400 disabled:no-underline"
                          >
                            {user.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {visibleUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Important action history */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Important Action History</h2>
            <p className="mt-1 text-sm text-slate-500">
              The 15 most recent actions recorded in the system.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Done by</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Record</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-100">
                    <td className="p-3 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3">{log.username || "-"}</td>
                    <td className="p-3 font-medium">{log.action}</td>
                    <td className="p-3">
                      {log.entity_name} #{log.entity_id}
                    </td>
                    <td className="p-3 text-slate-600">
                      {detailText(log.details)}
                    </td>
                  </tr>
                ))}

                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      No actions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;