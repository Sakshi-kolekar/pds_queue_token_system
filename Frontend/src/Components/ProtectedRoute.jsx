import { Navigate, Outlet } from "react-router-dom";

import { getUser } from "../api";
import { homePathForRole } from "../menu";

function ProtectedRoute({ roles }) {
  const user = getUser();

  // Not logged in
  if (!localStorage.getItem("access") || !user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but this role is not allowed on this page
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;