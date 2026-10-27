import { useState } from "react";
import { Landmark, Menu, X, ArrowUpRight } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="relative z-20 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 md:px-12 lg:px-20">
      <a href="#home" className="flex items-center gap-3">
        <div className="rounded-xl bg-green-950 p-3 text-lime-200">
          <Landmark size={24} />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-green-950">
            PDS Connect
          </h2>
          <p className="text-xs text-gray-500">
            Queue Management System
          </p>
        </div>
      </a>

      <button
        className="text-green-950 md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X /> : <Menu />}
      </button>

      <div
        className={`${
          open ? "flex" : "hidden"
        } absolute left-0 top-full w-full flex-col gap-5 border-b bg-white p-6 md:static md:flex md:w-auto md:flex-row md:items-center md:border-0 md:p-0`}
      >
        <a href="#home" className="text-sm font-medium text-gray-600 hover:text-green-800">
          Home
        </a>
        <a href="#features" className="text-sm font-medium text-gray-600 hover:text-green-800">
          Features
        </a>
        <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-green-800">
          How It Works
        </a>
        <a href="#live-queue" className="text-sm font-medium text-gray-600 hover:text-green-800">
          Live Queue
        </a>
        <a
          href="/login"
          className="flex items-center justify-center gap-2 rounded-xl bg-green-950 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
        >
          Login <ArrowUpRight size={16} />
        </a>
      </div>
    </nav>
  );
}