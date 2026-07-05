"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Users,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useRouter } from "next/navigation";

export default function UsersTable({ users = [] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const USERS_PER_PAGE = 10;

  const processedUsers = useMemo(() => {
    let data = [...users];

    // Search
    if (search.trim()) {
      const query = search.toLowerCase();

      data = data.filter((user) => {
        return (
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query) ||
          user.phone?.toLowerCase().includes(query)
        );
      });
    }

    // Role Filter
    if (roleFilter !== "all") {
      data = data.filter(
        (user) => user.role === roleFilter
      );
    }

    // Status Filter
    if (statusFilter !== "all") {
      data = data.filter((user) =>
        statusFilter === "online"
          ? user.isOnline
          : !user.isOnline
      );
    }

    // Sorting
    data.sort((a, b) => {
      switch (sortBy) {
        case "role":
          return a.role.localeCompare(b.role);

        case "online":
          return Number(b.isOnline) - Number(a.isOnline);

        case "newest":
          return (
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
          );

        default:
          return a.name.localeCompare(b.name);
      }
    });

    return data;
  }, [
    users,
    search,
    sortBy,
    roleFilter,
    statusFilter,
  ]);

  const totalPages = Math.ceil(
    processedUsers.length / USERS_PER_PAGE
  );

  const paginatedUsers = processedUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400";

      case "driver":
        return "bg-green-500/20 text-green-400";

      default:
        return "bg-blue-500/20 text-blue-400";
    }
  };

  const handleDelete = (id) => {
    if (
      window.confirm(
        "Delete this user permanently?"
      )
    ) {
      console.log("Delete:", id);

      // TODO:
      // Call DELETE API here
    }
  };

  return (
    <div className="mt-10 rounded-3xl border border-white/10 glass-card p-8 hover:border-brand-red/20 transition-all duration-300">

      {/* Header */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-3">
          <Users
            className="text-brand-red"
            size={28}
          />

          <div>
            <h2 className="text-2xl font-bold">
              Users
            </h2>

            <p className="text-sm text-slate-400">
              {processedUsers.length} Users
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
              className="w-72 rounded-xl border border-slate-700 bg-slate-950/50 py-3 pl-11 pr-4 outline-none focus:border-brand-red transition-colors"
            />

          </div>

          {/* Role */}

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-700 bg-slate-955/50 px-4 outline-none focus:border-brand-red transition-colors"
          >
            <option value="all">
              All Roles
            </option>

            <option value="admin">
              Admin
            </option>

            <option value="driver">
              Driver
            </option>

            <option value="rider">
              Rider
            </option>

          </select>

          {/* Status */}

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-700 bg-slate-955/50 px-4 outline-none focus:border-brand-red transition-colors"
          >
            <option value="all">
              All Status
            </option>

            <option value="online">
              Online
            </option>

            <option value="offline">
              Offline
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

            <option value="role">
              Role
            </option>

            <option value="online">
              Online
            </option>

            <option value="newest">
              Newest
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
                User
              </th>

              <th className="text-left">
                Email
              </th>

              <th className="text-left">
                Role
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
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-slate-800 transition hover:bg-slate-800/50"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div>
                        <p className="font-semibold">
                          {user.name}
                        </p>

                        <p className="text-xs text-slate-400">
                          {user.phone || "No Phone"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>{user.email}</td>

                  <td>
                    <span
                      className={`rounded-full px-3 py-1 text-xs capitalize ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td>
                    {user.isOnline ? (
                      <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">
                        Online
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-400">
                        Offline
                      </span>
                    )}
                  </td>

                  <td>
                    <div className="flex items-center justify-center gap-2">

                      <button
                        className="rounded-lg bg-blue-500/20 p-2 text-blue-400 transition hover:bg-blue-500/40"
                        onClick={() =>
                          router.push(`/admin/users/${user._id}`)
                        }
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        className="rounded-lg bg-red-500/20 p-2 text-red-400 transition hover:bg-red-500/40"
                        onClick={() =>
                          handleDelete(user._id)
                        }
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-slate-500"
                >
                  No users found.
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
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 hover:bg-slate-700"
                  }`}
                >
                  {index + 1}
                </button>
              )
            )}

          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((page) =>
                Math.min(page + 1, totalPages)
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