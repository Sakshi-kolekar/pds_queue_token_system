import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Info,
  ListOrdered,
  LogIn,
  Store,
  Ticket,
  UserPlus,
  Users,
  CalendarClock,
} from "lucide-react";

const navLinks = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
];

const features = [
  {
    icon: Ticket,
    title: "Token Generation",
    text: "Generate tokens quickly and easily.",
  },
  {
    icon: Users,
    title: "Queue Management",
    text: "Track waiting and current tokens.",
  },
  {
    icon: Store,
    title: "Counter Management",
    text: "Manage counters and staff assignments.",
  },
  {
    icon: Bell,
    title: "Notifications & History",
    text: "Track token updates and previous records.",
  },
];

const steps = [
  {
    icon: UserPlus,
    title: "01. Register Beneficiary",
    text: "Register or search beneficiary.",
  },
  {
    icon: Ticket,
    title: "02. Generate Token",
    text: "Get a unique token number.",
  },
  {
    icon: CalendarClock,
    title: "03. Assign Slot & Counter",
    text: "Get your slot and counter.",
  },
  {
    icon: ListOrdered,
    title: "04. Track Queue",
    text: "Check current token status.",
  },
  {
    icon: CheckCircle2,
    title: "05. Service Completion",
    text: "Staff marks the token Completed or Missed.",
    done: true,
  },
];

const audiences = [
  {
    who: "For Beneficiaries",
    what: "Easy token generation and queue tracking.",
  },
  { who: "For Staff", what: "Manage tokens, counters and service delivery." },
  {
    who: "For Government",
    what: "Better monitoring and efficient service delivery.",
  },
];

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
        <Users className="h-5 w-5 text-white" aria-hidden="true" />
      </div>
      <div className="leading-tight">
        <div className="text-lg font-semibold text-white">PDS Token</div>
        <div className="text-xs text-blue-100">
          Queue &amp; Token Management System
        </div>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div id="top" className="min-h-screen bg-white text-slate-900">
      {/* Header: logo on the left, menu and Login on the right */}
      <header className="bg-[#0b2a5b]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <Logo />

          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <nav className="flex flex-wrap items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm text-blue-50 hover:bg-white/10"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <Link
              to="/login"
              className="ml-1 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-blue-700">
              Welcome to
            </p>
            <h1 className="mb-4 text-4xl font-bold leading-tight text-[#0b2a5b] sm:text-5xl">
              PDS <span className="text-blue-600">Queue &amp;</span> Token{" "}
              <span className="text-blue-600">Management System</span>
            </h1>
            <p className="mb-8 max-w-lg text-base text-slate-600">
              A simple and efficient solution for managing beneficiaries,
              generating tokens, and organizing queues at public distribution
              counters. Track your token status and enjoy a smoother service
              experience.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-500"
              >
                <Ticket className="h-4 w-4" aria-hidden="true" />
                Get Token
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/queue"
                className="flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-6 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50"
              >
                <Clock className="h-4 w-4" aria-hidden="true" />
                Track Queue
              </Link>
            </div>
          </div>

          <img
            src="image.png"
            alt="Public distribution center with a token board and a queue of beneficiaries"
            className="w-full rounded-2xl"
          />
        </div>
      </section>

      {/* Key features */}
      <section id="features" className="bg-blue-50/60">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-6 py-12 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-blue-700">
              Key features
            </p>
            <h2 className="text-2xl font-bold text-[#0b2a5b]">
              What Makes Our System Special
            </h2>
            <div className="mt-3 h-1 w-10 rounded bg-blue-600" />
          </div>

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-xl bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Icon className="h-6 w-6 text-blue-700" aria-hidden="true" />
                </div>
                <h3 className="mb-1 text-base font-semibold text-[#0b2a5b]">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-[#0b2a5b]">How It Works</h2>
          <p className="mt-1 text-sm text-slate-600">
            Simple Steps for a Better Service Experience
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className={`rounded-xl border p-4 text-center ${
                  step.done
                    ? "border-green-300 bg-green-50"
                    : "border-blue-100 bg-blue-50"
                }`}
              >
                <div className="mb-2 flex justify-center">
                  <Icon
                    className={`h-7 w-7 ${
                      step.done ? "text-green-600" : "text-blue-700"
                    }`}
                    aria-hidden="true"
                  />
                </div>
                <h3
                  className={`text-sm font-semibold ${
                    step.done ? "text-green-800" : "text-[#0b2a5b]"
                  }`}
                >
                  {step.title}
                </h3>
                <p className="mt-1 text-xs text-slate-600">{step.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-6xl px-6 pb-14">
        <div className="grid gap-8 rounded-2xl bg-blue-50 p-8 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-blue-700">
              About the project
            </p>
            <h2 className="mb-3 text-2xl font-bold text-[#0b2a5b]">
              Making Public Distribution Easier
            </h2>
            <p className="text-sm text-slate-600">
              The PDS Queue &amp; Token Management System helps manage
              beneficiary registration, token generation, queue handling and
              counter management at public distribution counters, ensuring
              faster and more transparent service for everyone.
            </p>
          </div>

          <ul className="space-y-3">
            {audiences.map((item) => (
              <li key={item.who} className="flex items-start gap-3 text-sm">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
                  aria-hidden="true"
                />
                <span>
                  <span className="font-semibold text-[#0b2a5b]">
                    {item.who}
                  </span>{" "}
                  <span className="text-slate-600">– {item.what}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer (same as before) */}
      <footer id="contact" className="bg-[#0b2a5b]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Logo />
          <p className="text-xs text-blue-100">
            © 2026 PDS Token. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;