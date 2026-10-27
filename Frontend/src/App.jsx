import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Beneficiaries from "./pages/Beneficiaries";
import Tokens from "./pages/Tokens";
import Queue from "./pages/Queue";
import Slots from "./pages/Slots";
import Counters from "./pages/Counters";
import Notifications from "./pages/Notifications";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Any logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/queue" element={<Queue />} />
            <Route path="/notifications" element={<Notifications />} />

            {/* Admin and Staff only */}
            <Route element={<ProtectedRoute roles={["ADMIN", "STAFF"]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/beneficiaries" element={<Beneficiaries />} />
              <Route path="/tokens" element={<Tokens />} />
              <Route path="/slots" element={<Slots />} />
              <Route path="/counters" element={<Counters />} />
              <Route path="/history" element={<History />} />
            </Route>

            {/* Admin only */}
            <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;