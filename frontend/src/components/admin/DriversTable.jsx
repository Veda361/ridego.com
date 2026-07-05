"use client";

import { useMemo, useState } from "react";
import {
  Car,
  Search,
  Star,
  Phone,
  Mail,
  Eye,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function DriversTable({
  drivers = [],
}) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [vehicleFilter, setVehicleFilter] =
    useState("all");
  const [currentPage, setCurrentPage] =
    useState(1);

  const DRIVERS_PER_PAGE = 10;

  const processedDrivers = useMemo(() => {
    let data = [...drivers];

    // Search
    if (search.trim()) {
      const query = search.toLowerCase();

      data = data.filter((driver) => {
        return (
          driver.userId?.name
            ?.toLowerCase()
            .includes(query) ||
          driver.userId?.email
            ?.toLowerCase()
            .includes(query) ||
          driver.vehicleType
            ?.toLowerCase()
            .includes(query) ||
          driver.vehicleNumber
            ?.toLowerCase()
            .includes(query)
        );
      });
    }

    // Availability Filter
    if (statusFilter !== "all") {
      data = data.filter((driver) =>
        statusFilter === "available"
          ? driver.isAvailable
          : !driver.isAvailable
      );
    }

    // Vehicle Filter
    if (vehicleFilter !== "all") {
      data = data.filter(
        (driver) =>
          driver.vehicleType === vehicleFilter
      );
    }

    // Sorting
    data.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (
            (b.rating || 0) -
            (a.rating || 0)
          );

        case "vehicle":
          return a.vehicleType.localeCompare(
            b.vehicleType
          );

        case "status":
          return (
            Number(b.isAvailable) -
            Number(a.isAvailable)
          );

        default:
          return a.userId?.name.localeCompare(
            b.userId?.name
          );
      }
    });

    return data;
  }, [
    drivers,
    search,
    sortBy,
    statusFilter,
    vehicleFilter,
  ]);

  const totalPages = Math.ceil(
    processedDrivers.length /
      DRIVERS_PER_PAGE
  );

  const paginatedDrivers =
    processedDrivers.slice(
      (currentPage - 1) *
        DRIVERS_PER_PAGE,
      currentPage *
        DRIVERS_PER_PAGE
    );

  const vehicleTypes = [
    "all",
    ...new Set(
      drivers.map(
        (driver) => driver.vehicleType
      )
    ),
  ];

  return (
    <div className="mt-10 rounded-3xl border border-white/10 glass-card p-8 hover:border-brand-red/20 transition-all duration-300">

      {/* Header */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-3">

          <Car
            size={28}
            className="text-brand-red"
          />

          <div>

            <h2 className="text-2xl font-bold">
              Drivers
            </h2>

            <p className="text-sm text-slate-400">
              {processedDrivers.length} Drivers
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
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-72 rounded-xl border border-slate-700 bg-slate-955/50 py-3 pl-11 pr-4 outline-none focus:border-brand-red transition-colors"
            />

          </div>

          {/* Vehicle Filter */}

          <select
            value={vehicleFilter}
            onChange={(e) => {
              setVehicleFilter(
                e.target.value
              );
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-700 bg-slate-955/50 px-4 outline-none focus:border-brand-red transition-colors"
          >

            {vehicleTypes.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type === "all"
                  ? "All Vehicles"
                  : type}
              </option>
            ))}

          </select>

          {/* Status */}

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

            <option value="available">
              Available
            </option>

            <option value="busy">
              Busy
            </option>

          </select>

          {/* Sorting */}

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value)
            }
            className="rounded-xl border border-slate-700 bg-slate-955/50 px-4 outline-none focus:border-brand-red transition-colors"
          >

            <option value="name">
              Name
            </option>

            <option value="rating">
              Rating
            </option>

            <option value="vehicle">
              Vehicle
            </option>

            <option value="status">
              Availability
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
                Driver
              </th>

              <th className="text-left">
                Vehicle
              </th>

              <th className="text-left">
                Vehicle No.
              </th>

              <th className="text-left">
                Rating
              </th>

              <th className="text-left">
                Status
              </th>

              <th className="text-center">
                Actions
              </th>

            </tr>

          </thead>
          <tbody>

            {paginatedDrivers.length > 0 ? (
  paginatedDrivers.map((driver) => (
    <tr
      key={driver._id}
      className="border-b border-slate-800 transition hover:bg-slate-800/50"
    >
      <td className="py-4">

        <div className="flex items-center gap-4">

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 font-bold">
            {driver.userId?.name
              ?.charAt(0)
              ?.toUpperCase()}
          </div>

          <div>

            <p className="font-semibold">
              {driver.userId?.name}
            </p>

            <div className="mt-1 space-y-1">

              <p className="flex items-center gap-1 text-xs text-slate-400">
                <Mail size={12} />
                {driver.userId?.email}
              </p>

              <p className="flex items-center gap-1 text-xs text-slate-400">
                <Phone size={12} />
                {driver.userId?.phone ||
                  "No Phone"}
              </p>

            </div>

          </div>

        </div>

      </td>

      <td>

        <span className="rounded-lg bg-blue-500/20 px-3 py-1 text-sm text-blue-400">
          {driver.vehicleType}
        </span>

      </td>

      <td>

        {driver.vehicleNumber}

      </td>

      <td>

        <div className="flex items-center gap-2">

          <Star
            size={16}
            className="fill-yellow-400 text-yellow-400"
          />

          <span>
            {(driver.rating || 0).toFixed(1)}
          </span>

        </div>

      </td>

      <td>

        {driver.isAvailable ? (
          <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">
            Available
          </span>
        ) : (
          <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-400">
            Busy
          </span>
        )}

      </td>

      <td>

        <div className="flex justify-center gap-2">

          <button
            onClick={() =>
              console.log(
                "View Driver",
                driver._id
              )
            }
            className="rounded-lg bg-blue-500/20 p-2 text-blue-400 transition hover:bg-blue-500/40"
            title="View Driver"
          >
            <Eye size={18} />
          </button>

          {driver.isAvailable ? (

            <button
              onClick={() =>
                console.log(
                  "Suspend Driver",
                  driver._id
                )
              }
              className="rounded-lg bg-red-500/20 p-2 text-red-400 transition hover:bg-red-500/40"
              title="Suspend Driver"
            >
              <Ban size={18} />
            </button>

          ) : (

            <button
              onClick={() =>
                console.log(
                  "Activate Driver",
                  driver._id
                )
              }
              className="rounded-lg bg-green-500/20 p-2 text-green-400 transition hover:bg-green-500/40"
              title="Activate Driver"
            >
              <CheckCircle size={18} />
            </button>

          )}

        </div>

      </td>

    </tr>
  ))
) : (
  <tr>

    <td
      colSpan={6}
      className="py-10 text-center text-slate-500"
    >
      No drivers found.
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
                    setCurrentPage(index + 1)
                  }
                  className={`h-10 w-10 rounded-xl transition ${
                    currentPage === index + 1
                      ? "bg-green-600 text-white"
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
              currentPage === totalPages
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