import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, Lock } from "lucide-react";

import { resetPassword } from "../api";
import AuthField from "../components/AuthField";
import AuthLayout from "../components/AuthLayout";

function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const uid = params.get("uid");
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

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
      const detail = await resetPassword(uid, token, password);
      navigate("/login", { state: { message: detail } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!uid || !token) {
    return (
      <AuthLayout
        title="Link not valid"
        subtitle="This password reset link is incomplete"
      >
        <p className="text-center text-sm text-slate-600">
          <Link
            to="/forgot-password"
            className="font-medium text-blue-800 hover:underline"
          >
            Request a new reset link
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Enter and confirm your new password"
    >
      <form onSubmit={handleSubmit} noValidate>
        <AuthField
          id="password"
          label="New password"
          icon={Lock}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />

        <AuthField
          id="confirm"
          label="Confirm new password"
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
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          {loading ? "Saving…" : "Reset password"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        <Link to="/login" className="font-medium text-blue-800 hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}

export default ResetPassword;