"use client";

import { ShieldCheck, RefreshCcw } from "lucide-react";

export default function DashboardHeader({
  onRefresh,
  loading,
}) {
  const date = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      {/* Left */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-red/10 border border-brand-red/30 text-brand-red shadow-[0_0_15px_rgba(255,51,51,0.15)]">
            <ShieldCheck size={28} />
          </div>

          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-slate-400">
              Manage users, drivers, rides, payments and platform analytics.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
            ● System Online
          </span>

          <span className="rounded-full border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm text-slate-300">
            {date}
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-full bg-brand-red hover:bg-[#e62b1e] px-5 py-3 font-semibold transition hover:opacity-90 shadow-[0_0_15px_rgba(255,51,51,0.25)] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          <RefreshCcw
            size={18}
            className={loading ? "animate-spin" : ""}
          />

          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>
  );
}