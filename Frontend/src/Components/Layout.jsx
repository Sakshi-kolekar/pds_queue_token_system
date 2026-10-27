import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarClock,
  ClipboardList,
  History,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Menu,
  Settings,
  Store,
  Ticket,
  Users,
  X,
} from "lucide-react";

import { getUser, logout } from "../api";
import { menuForRole } from "../menu";

const roleLabels = {
  ADMIN: "Admin",
  STAFF: "Staff",
  CUSTOMER: "Customer",
};

// Icon for each menu path
const icons = {
  "/dashboard": LayoutDashboard,
  "/beneficiaries": Users,
  "/tokens": Ticket,
  "/queue": ListOrdered,
  "/slots": CalendarClock,
  "/counters": Store,
  "/notifications": Bell,
  "/history": History,
  "/reports": ClipboardList,
  "/settings": Settings,
};

function Layout() {
  const navigate = useNavigate();
  const user = getUser();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 md:flex">
      {/* Dark overlay behind the sidebar on mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#0b2a5b] text-white transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Ticket className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <div className="text-base font-semibold">PDS Token</div>
              <div className="text-xs text-blue-200">Queue management</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded-md p-1 text-blue-100 hover:bg-white/10 md:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {menuForRole(user.role).map((item) => {
            const Icon = icons[item.path] || LayoutDashboard;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                    isActive
                      ? "bg-blue-600 font-medium text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`
                }
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3">
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-900">
              {roleLabels[user.role]}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-blue-100 hover:bg-white/10"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>

      {/* Page area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar, only on mobile */}
        <header className="flex items-center gap-3 bg-[#0b2a5b] px-4 py-3 text-white md:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="rounded-md p-1 hover:bg-white/10"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <span className="text-base font-medium">PDS Token</span>
        </header>

        <main className="mx-auto w-full max-w-6xl p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;