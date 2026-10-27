import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send } from "lucide-react";

import { forgotPassword } from "../api";
import AuthField from "../components/AuthField";
import AuthLayout from "../components/AuthLayout";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const detail = await forgotPassword(email.trim());
      setMessage(detail);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we will send you a reset link"
    >
      <form onSubmit={handleSubmit} noValidate>
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

        {message && (
          <p
            role="status"
            className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800"
          >
            {message}
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
          <Send className="h-4 w-4" aria-hidden="true" />
          {loading ? "Sending…" : "Send reset link"}
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

export default ForgotPassword;