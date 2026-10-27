import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Beneficiaries", path: "/beneficiaries" },
  { name: "Tokens", path: "/tokens" },
  { name: "Queue", path: "/queue" },
  { name: "Slots", path: "/slots" },
  { name: "Counters", path: "/counters" },
  { name: "Notifications", path: "/notifications" },
  { name: "History", path: "/history" },
  { name: "Reports", path: "/reports" },
  { name: "Settings", path: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="relative z-50 min-h-screen w-52 shrink-0 bg-[#12365b] p-4 text-white">
      <h2 className="mb-8 text-xl font-bold">PDS</h2>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block cursor-pointer rounded-lg px-3 py-3 text-sm ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-200 hover:bg-blue-800"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
