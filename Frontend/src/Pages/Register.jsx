import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, User, UserPlus } from "lucide-react";

import { register } from "../api";
import AuthField from "../components/AuthField";
import AuthLayout from "../components/AuthLayout";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password) {
      setError("Fill in all the fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(username.trim(), email.trim(), password);
      navigate("/login", {
        state: { message: "Account created. You can log in now." },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register as a customer to track your tokens"
    >
      <form onSubmit={handleSubmit} noValidate>
        <AuthField
          id="username"
          label="Username"
          icon={User}
          value={username}
          onChange={setUsername}
          placeholder="Choose a username"
          autoComplete="username"
        />

        <AuthField
          id="email"
          label="Email address"
          icon={Mail}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Enter your email address"
          autoComplete="email"
        />

        <AuthField
          id="password"
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />

        <AuthField
          id="confirm"
          label="Confirm password"
          icon={Lock}
          type="password"
          value={confirm}
          onChange={setConfirm}
          placeholder="Enter the password again"
          autoComplete="new-password"
        />

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
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          {loading ? "Creating account…" : "Register"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-blue-800 hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Register;