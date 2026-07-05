"use client";

import { useMemo, useState } from "react";

import {
  Route,
  Search,
  MapPin,
  IndianRupee,
  Clock3,
  Eye,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

export default function RidesTable({
  rides = [],
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [sortBy, setSortBy] =
    useState("newest");
  const [currentPage, setCurrentPage] =
    useState(1);

  const RIDES_PER_PAGE = 10;

  const processedRides = useMemo(() => {
    let data = [...rides];

    // Search
    if (search.trim()) {
      const query = search.toLowerCase();

      data = data.filter((ride) => {
        return (
          ride.pickup?.address
            ?.toLowerCase()
            .includes(query) ||
          ride.destination?.address
            ?.toLowerCase()
            .includes(query) ||
          ride.status
            ?.toLowerCase()
            .includes(query) ||
          ride.riderId?.name
            ?.toLowerCase()
            .includes(query) ||
          ride.driverId?.name
            ?.toLowerCase()
            .includes(query)
        );
      });
    }

    // Status Filter
    if (statusFilter !== "all") {
      data = data.filter(
        (ride) =>
          ride.status === statusFilter
      );
    }

    // Sorting
    data.sort((a, b) => {
      switch (sortBy) {
        case "fare":
          return (
            (b.fare || 0) -
            (a.fare || 0)
          );

        case "distance":
          return (
            (b.distance || 0) -
            (a.distance || 0)
          );

        case "duration":
          return (
            (b.duration || 0) -
            (a.duration || 0)
          );

        case "oldest":
          return (
            new Date(a.createdAt) -
            new Date(b.createdAt)
          );

        default:
          return (
            new Date(b.createdAt) -
            new Date(a.createdAt)
          );
      }
    });

    return data;
  }, [
    rides,
    search,
    statusFilter,
    sortBy,
  ]);

  const totalPages = Math.ceil(
    processedRides.length /
      RIDES_PER_PAGE
  );

  const paginatedRides =
    processedRides.slice(
      (currentPage - 1) *
        RIDES_PER_PAGE,
      currentPage *
        RIDES_PER_PAGE
    );

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400";

      case "pending":
        return "bg-yellow-500/20 text-yellow-400";

      case "accepted":
        return "bg-blue-500/20 text-blue-400";

      case "arriving":
        return "bg-cyan-500/20 text-cyan-400";

      case "in_progress":
        return "bg-indigo-500/20 text-indigo-400";

      case "cancelled":
        return "bg-red-500/20 text-red-400";

      default:
        return "bg-slate-700 text-white";
    }
  };

  return (
    <div className="mt-10 rounded-3xl border border-white/10 glass-card p-8 hover:border-brand-red/20 transition-all duration-300">

      {/* Header */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-3">

          <Route
            size={28}
            className="text-brand-red"
          />

          <div>

            <h2 className="text-2xl font-bold">
              Ride Management
            </h2>

            <p className="text-sm text-slate-400">
              {processedRides.length} Rides
            </p>

          </div>

        </div>

        <div className="flex flex-wrap gap-3">

          {/* Search */}

          <div className="relative">

            <Search
              size={18}
              className="absolute left-4 top-3.5 text-slate-500"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(
                  e.target.value
                );
                setCurrentPage(1);
              }}
              placeholder="Search rides..."
              className="w-72 rounded-xl border border-slate-700 bg-slate-955/50 py-3 pl-11 pr-4 outline-none focus:border-brand-red transition-colors"
            />

          </div>

          {/* Status Filter */}

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(
                e.target.value
              );
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-700 bg-slate-955/50 px-4 outline-none focus:border-brand-red transition-colors"
          >
            <option value="all">
              All Status
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="accepted">
              Accepted
            </option>

            <option value="arriving">
              Arriving
            </option>

            <option value="in_progress">
              In Progress
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>

          </select>

          {/* Sort */}

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value
              )
            }
            className="rounded-xl border border-slate-700 bg-slate-955/50 px-4 outline-none focus:border-brand-red transition-colors"
          >

            <option value="newest">
              Newest
            </option>

            <option value="oldest">
              Oldest
            </option>

            <option value="fare">
              Highest Fare
            </option>

            <option value="distance">
              Longest Distance
            </option>

            <option value="duration">
              Longest Duration
            </option>

          </select>

        </div>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>

            <tr className="border-b border-slate-800 text-slate-400">

              <th className="py-4 text-left">
                Ride
              </th>

              <th className="text-left">
                Rider
              </th>

              <th className="text-left">
                Driver
              </th>

              <th className="text-left">
                Route
              </th>

              <th className="text-left">
                Fare
              </th>

              <th className="text-left">
                Status
              </th>

              <th className="text-left">
                Date
              </th>

              <th className="text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {paginatedRides.length > 0 ? (
  paginatedRides.map((ride) => (
    <tr
      key={ride._id}
      className="border-b border-slate-800 transition hover:bg-slate-800/50"
    >
      {/* Ride ID */}

      <td className="py-4">

        <div>

          <p className="font-semibold">
            #{ride._id.slice(-6)}
          </p>

          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">

            <Clock3 size={12} />

            {ride.duration || 0} min

          </p>

        </div>

      </td>

      {/* Rider */}

      <td>

        <div>

          <p className="font-semibold">
            {ride.riderId?.name ||
              "Unknown"}
          </p>

          <p className="text-xs text-slate-400">
            {ride.riderId?.email}
          </p>

        </div>

      </td>

      {/* Driver */}

      <td>

        {ride.driverId ? (

          <div>

            <p className="font-semibold">
              {ride.driverId?.name}
            </p>

            <p className="text-xs text-slate-400">
              {ride.driverId?.email}
            </p>

          </div>

        ) : (

          <span className="rounded-lg bg-yellow-500/20 px-3 py-1 text-xs text-yellow-400">
            Not Assigned
          </span>

        )}

      </td>

      {/* Route */}

      <td>

        <div className="space-y-2">

          <div className="flex items-center gap-2">

            <MapPin
              size={14}
              className="text-green-400"
            />

            <span className="max-w-xs truncate">
              {ride.pickup?.address}
            </span>

          </div>

          <div className="flex items-center gap-2">

            <MapPin
              size={14}
              className="text-red-400"
            />

            <span className="max-w-xs truncate">
              {ride.destination?.address}
            </span>

          </div>

        </div>

      </td>

      {/* Fare */}

      <td>

        <div>

          <div className="flex items-center gap-1 font-semibold">

            <IndianRupee size={15} />

            {ride.fare || 0}

          </div>

          <p className="mt-1 text-xs text-slate-400">
            {ride.distance || 0} km
          </p>

        </div>

      </td>

            {/* Status */}

      <td>

        <span
          className={`rounded-full px-3 py-1 text-xs capitalize ${getStatusColor(
            ride.status
          )}`}
        >
          {ride.status.replace("_", " ")}
        </span>

      </td>

      {/* Date */}

      <td>

        <div className="flex items-center gap-2 text-sm">

          <Calendar
            size={15}
            className="text-slate-400"
          />

          {new Date(
            ride.createdAt
          ).toLocaleDateString()}

        </div>

      </td>

      {/* Actions */}

      <td>

        <div className="flex justify-center gap-2">

          <button
            onClick={() =>
              console.log(
                "View Ride",
                ride._id
              )
            }
            className="rounded-lg bg-blue-500/20 p-2 text-blue-400 transition hover:bg-blue-500/40"
            title="View Ride"
          >
            <Eye size={18} />
          </button>

          {ride.status !==
            "completed" &&
            ride.status !==
              "cancelled" && (
              <button
                onClick={() =>
                  console.log(
                    "Cancel Ride",
                    ride._id
                  )
                }
                className="rounded-lg bg-red-500/20 p-2 text-red-400 transition hover:bg-red-500/40"
                title="Cancel Ride"
              >
                <XCircle size={18} />
              </button>
            )}

        </div>

      </td>

    </tr>
  ))
) : (

  <tr>

    <td
      colSpan={8}
      className="py-10 text-center text-slate-500"
    >
      No rides found.
    </td>

  </tr>

)}

          </tbody>

        </table>

      </div>

      {/* Pagination */}

      {totalPages > 1 && (

        <div className="mt-8 flex items-center justify-between">

          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((page) =>
                Math.max(page - 1, 1)
              )
            }
            className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <div className="flex gap-2">

            {Array.from(
              { length: totalPages },
              (_, index) => (
                <button
                  key={index}
                  onClick={() =>
                    setCurrentPage(
                      index + 1
                    )
                  }
                  className={`h-10 w-10 rounded-xl transition ${
                    currentPage ===
                    index + 1
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 hover:bg-slate-700"
                  }`}
                >
                  {index + 1}
                </button>
              )
            )}

          </div>

          <button
            disabled={
              currentPage ===
              totalPages
            }
            onClick={() =>
              setCurrentPage((page) =>
                Math.min(
                  page + 1,
                  totalPages
                )
              )
            }
            className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={18} />
          </button>

        </div>

      )}

    </div>
  );
}