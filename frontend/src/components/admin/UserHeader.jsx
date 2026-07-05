"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserHeader({
  user,
  loading,
  onRefresh,
}) {
  const router = useRouter();

  return (
    <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

      {/* Left */}

      <div className="flex items-center gap-5">

        <button
          onClick={() => router.back()}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 transition hover:border-blue-500 hover:bg-slate-800"
        >
          <ArrowLeft size={20} />
        </button>

        <div>

          <h1 className="text-4xl font-bold tracking-tight">
            User Details
          </h1>

          <p className="mt-2 text-slate-400">
            Manage user profile, rides and payments
          </p>

        </div>

      </div>

      {/* Right */}

      <div className="flex items-center gap-4">

        <div
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            user?.isOnline
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {user?.isOnline
            ? "🟢 Online"
            : "🔴 Offline"}
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>

    </div>
  );
}