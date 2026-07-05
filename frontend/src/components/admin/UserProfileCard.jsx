"use client";

import {
  Mail,
  Phone,
  ShieldCheck,
  CalendarDays,
  Circle,
  User,
  Edit,
  Ban,
  Trash2,
  Copy,
} from "lucide-react";

export default function UserProfileCard({
  user,
}) {
  const copyUID = () => {
    navigator.clipboard.writeText(
      user?.firebaseUid || ""
    );
  };

  const roleColor = () => {
    switch (user?.role) {
      case "admin":
        return "bg-purple-500/20 text-purple-400";

      case "driver":
        return "bg-green-500/20 text-green-400";

      default:
        return "bg-blue-500/20 text-blue-400";
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">

      {/* Banner */}

      <div className="h-36 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700" />

      <div className="px-8 pb-8">

        {/* Avatar */}

        <div className="-mt-16 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-6">

            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-slate-900 bg-blue-600 text-5xl font-bold">

              {user?.name
                ?.charAt(0)
                ?.toUpperCase()}

            </div>

            <div>

              <h2 className="text-4xl font-bold">

                {user?.name}

              </h2>

              <p className="mt-2 text-lg text-slate-400">

                {user?.email}

              </p>

              <div className="mt-4 flex flex-wrap gap-3">

                <span
                  className={`rounded-full px-4 py-1 text-sm font-medium capitalize ${roleColor()}`}
                >
                  {user?.role}
                </span>

                <span
                  className={`flex items-center gap-2 rounded-full px-4 py-1 text-sm ${
                    user?.isOnline
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  <Circle
                    size={10}
                    className="fill-current"
                  />

                  {user?.isOnline
                    ? "Online"
                    : "Offline"}

                </span>

              </div>

            </div>

          </div>

          {/* Action Buttons */}

          <div className="flex flex-wrap gap-3">

            <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 transition hover:bg-blue-700">

              <Edit size={18} />

              Edit

            </button>

            <button className="flex items-center gap-2 rounded-xl bg-yellow-600 px-5 py-3 transition hover:bg-yellow-700">

              <Ban size={18} />

              Suspend

            </button>

            <button className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 transition hover:bg-red-700">

              <Trash2 size={18} />

              Delete

            </button>

          </div>

        </div>

                {/* Information Grid */}

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {/* Email */}

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

            <div className="mb-3 flex items-center gap-3">

              <Mail
                size={20}
                className="text-blue-400"
              />

              <h3 className="font-semibold">
                Email Address
              </h3>

            </div>

            <p className="break-all text-slate-300">
              {user?.email || "N/A"}
            </p>

          </div>

          {/* Phone */}

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

            <div className="mb-3 flex items-center gap-3">

              <Phone
                size={20}
                className="text-green-400"
              />

              <h3 className="font-semibold">
                Phone Number
              </h3>

            </div>

            <p className="text-slate-300">
              {user?.phone || "Not Available"}
            </p>

          </div>

          {/* Role */}

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

            <div className="mb-3 flex items-center gap-3">

              <ShieldCheck
                size={20}
                className="text-purple-400"
              />

              <h3 className="font-semibold">
                User Role
              </h3>

            </div>

            <span
              className={`rounded-full px-3 py-1 text-sm capitalize ${roleColor()}`}
            >
              {user?.role}
            </span>

          </div>

          {/* Joined */}

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

            <div className="mb-3 flex items-center gap-3">

              <CalendarDays
                size={20}
                className="text-yellow-400"
              />

              <h3 className="font-semibold">
                Joined
              </h3>

            </div>

            <p className="text-slate-300">
              {user?.createdAt
                ? new Date(
                    user.createdAt
                  ).toLocaleDateString()
                : "Unknown"}
            </p>

          </div>

          {/* Firebase UID */}

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

            <div className="mb-3 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <User
                  size={20}
                  className="text-cyan-400"
                />

                <h3 className="font-semibold">
                  Firebase UID
                </h3>

              </div>

              <button
                onClick={copyUID}
                className="rounded-lg bg-slate-800 p-2 transition hover:bg-slate-700"
              >
                <Copy size={16} />
              </button>

            </div>

            <p className="break-all text-xs text-slate-400">
              {user?.firebaseUid || "N/A"}
            </p>

          </div>

          {/* Mongo ID */}

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

            <div className="mb-3 flex items-center gap-3">

              <User
                size={20}
                className="text-orange-400"
              />

              <h3 className="font-semibold">
                User ID
              </h3>

            </div>

            <p className="break-all text-xs text-slate-400">
              {user?._id}
            </p>

          </div>

        </div>

                {/* Bottom Summary */}

        <div className="mt-10 grid gap-6 lg:grid-cols-3">

          {/* Account Status */}

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">

            <h3 className="mb-5 text-lg font-semibold">
              Account Status
            </h3>

            <div className="space-y-4">

              <div className="flex items-center justify-between">

                <span className="text-slate-400">
                  User Status
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    user?.isOnline
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {user?.isOnline
                    ? "Online"
                    : "Offline"}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-slate-400">
                  Account Type
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-sm capitalize ${roleColor()}`}
                >
                  {user?.role}
                </span>

              </div>

            </div>

          </div>

          {/* Profile Completion */}

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">

            <h3 className="mb-5 text-lg font-semibold">
              Profile Completion
            </h3>

            <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-800">

              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                style={{
                  width: `${
                    [
                      user?.name,
                      user?.email,
                      user?.phone,
                    ].filter(Boolean).length * 33
                  }%`,
                }}
              />

            </div>

            <p className="text-sm text-slate-400">
              Complete user information helps improve the riding experience.
            </p>

          </div>

          {/* Quick Info */}

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">

            <h3 className="mb-5 text-lg font-semibold">
              Quick Info
            </h3>

            <div className="space-y-3">

              <div className="flex justify-between">

                <span className="text-slate-400">
                  Email Verified
                </span>

                <span className="text-green-400">
                  Yes
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-400">
                  Phone Added
                </span>

                <span>
                  {user?.phone
                    ? "Yes"
                    : "No"}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-400">
                  User ID
                </span>

                <span className="text-xs">
                  {user?._id?.slice(-6)}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}