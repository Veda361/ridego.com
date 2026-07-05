"use client";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

export default function AnalyticsCharts({ stats }) {
  /*
  ==========================
  Revenue Chart
  ==========================
  */

  const revenueData = [
    {
      name: "Today",
      revenue: stats.todayRevenue || 0,
    },
    {
      name: "Week",
      revenue: stats.weeklyRevenue || 0,
    },
    {
      name: "Month",
      revenue: stats.monthlyRevenue || 0,
    },
    {
      name: "Total",
      revenue: stats.totalRevenues || 0,
    },
  ];

  /*
  ==========================
  Ride Status
  ==========================
  */

  const rideStatusData = [
    {
      name: "Completed",
      value: stats.completedRides || 0,
    },
    {
      name: "Cancelled",
      value: stats.cancelledRides || 0,
    },
    {
      name: "Pending",
      value: stats.pendingRides || 0,
    },
    {
      name: "Accepted",
      value: stats.acceptedRides || 0,
    },
    {
      name: "In Progress",
      value: stats.inProgressRides || 0,
    },
  ];

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-2">

      {/* ==========================
          Revenue Chart
      ========================== */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

        <h2 className="mb-6 text-2xl font-bold">
          Revenue Analytics
        </h2>

        <ResponsiveContainer
          width="100%"
          height={320}
        >
          <LineChart data={revenueData}>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
            />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#22c55e"
              strokeWidth={3}
            />

          </LineChart>
        </ResponsiveContainer>

      </div>

      {/* ==========================
          Ride Status Chart
      ========================== */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

        <h2 className="mb-6 text-2xl font-bold">
          Ride Status
        </h2>

        <ResponsiveContainer
          width="100%"
          height={320}
        >
          <PieChart>

            <Pie
              data={rideStatusData}
              dataKey="value"
              nameKey="name"
              outerRadius={110}
              label
            >
              {rideStatusData.map(
                (_, index) => (
                  <Cell
                    key={index}
                    fill={
                      COLORS[
                        index %
                          COLORS.length
                      ]
                    }
                  />
                )
              )}
            </Pie>

            <Tooltip />

            <Legend />

          </PieChart>
        </ResponsiveContainer>

      </div>


            {/* ==========================
          Driver Availability
      ========================== */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

        <h2 className="mb-6 text-2xl font-bold">
          Driver Availability
        </h2>

        <ResponsiveContainer
          width="100%"
          height={320}
        >
          <LineChart
            data={[
              {
                name: "Available",
                value:
                  stats.availableDrivers || 0,
              },
              {
                name: "Busy",
                value:
                  stats.busyDrivers || 0,
              },
              {
                name: "Offline",
                value:
                  stats.offlineDrivers || 0,
              },
            ]}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
            />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
            />

          </LineChart>
        </ResponsiveContainer>

      </div>

      {/* ==========================
          Payment Status
      ========================== */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

        <h2 className="mb-6 text-2xl font-bold">
          Payment Analytics
        </h2>

        <ResponsiveContainer
          width="100%"
          height={320}
        >
          <PieChart>

            <Pie
              data={[
                {
                  name: "Paid",
                  value:
                    stats.paidPayments || 0,
                },
                {
                  name: "Failed",
                  value:
                    stats.failedPayments || 0,
                },
              ]}
              dataKey="value"
              nameKey="name"
              outerRadius={110}
              label
            >
              <Cell fill="#22c55e" />

              <Cell fill="#ef4444" />

            </Pie>

            <Tooltip />

            <Legend />

          </PieChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}