import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Lock, LogIn, User } from "lucide-react";

import { login } from "../api";
import { homePathForRole } from "../menu";
import AuthField from "../components/AuthField";
import AuthLayout from "../components/AuthLayout";

const roles = [
  { value: "ADMIN", label: "Admin" },
  { value: "STAFF", label: "Staff" },
  { value: "CUSTOMER", label: "Customer / Beneficiary" },
];

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // Message sent from the Register or Reset password pages
  const notice = location.state?.message;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
    setError("Enter your username or email, and your password.");
      return;
    }

    if (!role) {
      setError("Select the role you want to log in as.");
      return;
    }

    setLoading(true);

    try {
      const user = await login(username.trim(), password);

      // The selected role must match the account's real role
      if (user.role !== role) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        setError("This account is not registered for the selected role.");
        return;
      }

      navigate(homePathForRole(user.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Login to your PDS Token account"
    >
      <form onSubmit={handleSubmit} noValidate>
        <AuthField
          id="username"
          label="Username or email"
          icon={User}
          value={username}
          onChange={setUsername}
          placeholder="Enter your username or email"
          autoComplete="username"
        />

        <AuthField
          id="password"
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <label
          htmlFor="role"
          className="mb-1 block text-sm font-semibold text-[#0b2a5b]"
        >
          Login as
        </label>
        <div className="relative mb-5">
          <User
            className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={`w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
              role ? "text-slate-900" : "text-slate-400"
            }`}
          >
            <option value="">Select role</option>
            {roles.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
        </div>

        {notice && (
          <p
            role="status"
            className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800"
          >
            {notice}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#234577] py-3 text-sm font-medium text-white hover:bg-[#1b3961] disabled:opacity-60"
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          {loading ? "Signing in…" : "Login"}
        </button>
      </form>

      <div className="mt-3 text-center text-sm">
        <Link
          to="/forgot-password"
          className="font-medium text-blue-800 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
        <div className="h-px flex-1 bg-slate-200" />
        OR
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <p className="text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium text-blue-800 hover:underline">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Login;