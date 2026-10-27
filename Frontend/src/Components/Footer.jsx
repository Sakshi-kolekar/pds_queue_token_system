import { Landmark, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white px-6 py-8 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <a href="#home" className="flex items-center gap-3">
            <span className="rounded-xl bg-green-950 p-3 text-lime-200">
              <Landmark size={22} />
            </span>
            <span>
              <strong className="block text-green-950">PDS Connect</strong>
              <small className="text-gray-500">Queue Management System</small>
            </span>
          </a>

          <p className="text-sm text-gray-500">
            Digital queue management for better public service.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} PDS Connect. Internship project.</span>
          <span className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-green-700" />
            Secure access
          </span>
        </div>
      </div>
    </footer>
  );
}