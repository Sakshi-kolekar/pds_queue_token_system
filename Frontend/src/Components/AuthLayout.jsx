import { Ticket } from "lucide-react";

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div
        className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-100/60"
        aria-hidden="true"
      />
      <div
        className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-blue-100/60"
        aria-hidden="true"
      />
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,60 C360,160 1000,0 1440,90 L1440,160 L0,160 Z"
          fill="#234577"
        />
      </svg>

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col items-center px-4 pb-28 pt-10">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#234577]">
            <Ticket className="h-9 w-9 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-4xl font-bold text-[#0b2a5b]">PDS Token</h1>
          <p className="mt-1 text-lg text-slate-600">
            Queue and Token Management System
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Fair Distribution · Better Access · Digital India
          </p>
        </div>

        <div className="w-full rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          <h2 className="text-center text-2xl font-bold text-[#0b2a5b]">
            {title}
          </h2>
          <p className="mb-6 mt-1 text-center text-sm text-slate-600">
            {subtitle}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;