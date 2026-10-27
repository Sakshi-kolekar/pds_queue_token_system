export const menuItems = [
  { label: "Dashboard", path: "/dashboard", roles: ["ADMIN", "STAFF"] },
  { label: "Beneficiaries", path: "/beneficiaries", roles: ["ADMIN", "STAFF"] },
  { label: "Tokens", path: "/tokens", roles: ["ADMIN", "STAFF"] },
  { label: "Queue", path: "/queue", roles: ["ADMIN", "STAFF", "CUSTOMER"] },
  { label: "Slots", path: "/slots", roles: ["ADMIN", "STAFF"] },
  { label: "Counters", path: "/counters", roles: ["ADMIN", "STAFF"] },
  {
    label: "Notifications",
    path: "/notifications",
    roles: ["ADMIN", "STAFF", "CUSTOMER"],
  },
  { label: "History", path: "/history", roles: ["ADMIN", "STAFF"] },
  { label: "Reports", path: "/reports", roles: ["ADMIN"] },
  { label: "Settings", path: "/settings", roles: ["ADMIN"] },
];

export function menuForRole(role) {
  return menuItems.filter((item) => item.roles.includes(role));
}

// Page a user lands on right after login
export function homePathForRole(role) {
  return role === "CUSTOMER" ? "/queue" : "/dashboard";
}