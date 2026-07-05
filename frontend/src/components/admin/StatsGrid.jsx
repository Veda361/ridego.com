"use client";

import {
  Users,
  User,
  ShieldCheck,
  Car,
  Wifi,
  CircleDot,
  Route,
  CheckCircle2,
  XCircle,
  IndianRupee,
  CalendarDays,
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
} from "lucide-react";

import { useEffect, useState } from "react";

/*
====================================
Animated Counter
====================================
*/

function AnimatedNumber({
  value,
  duration = 700,
}) {
  const [count, setCount] =
    useState(0);

  useEffect(() => {
    const end =
      Number(
        String(value).replace(
          /[^0-9]/g,
          ""
        )
      ) || 0;

    let start = 0;

    const increment =
      end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;

      if (start >= end) {
        start = end;
        clearInterval(timer);
      }

      setCount(Math.floor(start));
    }, 16);

    return () =>
      clearInterval(timer);
  }, [value, duration]);

  if (
    typeof value === "string" &&
    value.includes("₹")
  ) {
    return <>₹{count}</>;
  }

  if (
    typeof value === "string" &&
    value.includes("%")
  ) {
    return <>{count}%</>;
  }

  return <>{count}</>;
}

/*
====================================
Number Formatter
====================================
*/

const formatNumber = (value) => {
  if (typeof value === "string")
    return value;

  if (value >= 1000000)
    return (
      (value / 1000000).toFixed(1) +
      "M"
    );

  if (value >= 1000)
    return (
      (value / 1000).toFixed(1) + "K"
    );

  return value;
};

/*
====================================
Progress %
====================================
*/

const progressValue = (value) => {
  if (typeof value === "string")
    return 100;

  if (value <= 100) return value;

  if (value <= 1000)
    return value / 10;

  return 100;
};

/*
====================================
Stat Card
====================================
*/

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}) => {
  return (
    <div
      className="
      group
      relative
      overflow-hidden
      rounded-3xl
      glass-card
      p-6
      transition-all
      duration-300
      hover:-translate-y-1
      hover:border-brand-red/40
      hover:shadow-[0_0_20px_rgba(255,51,51,0.15)]
      "
    >
      {/* Glow */}

      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-brand-red/10 blur-3xl transition-all duration-300 group-hover:scale-125" />

      <div className="relative flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-400">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold">

            <AnimatedNumber
              value={value}
            />

          </h2>

        </div>

        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-red/10 border border-brand-red/20 text-brand-red shadow-[0_0_10px_rgba(255,51,51,0.15)]"
        >
          <Icon size={26} />
        </div>

      </div>

      {/* Progress */}

      <div className="mt-6">

        <div className="h-2 overflow-hidden rounded-full bg-slate-800">

          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-red to-brand-red/70 transition-all duration-700 shadow-[0_0_8px_rgba(255,51,51,0.4)]"
            style={{
              width: `${progressValue(
                Number(
                  String(value).replace(
                    /[^0-9]/g,
                    ""
                  )
                )
              )}%`,
            }}
          />

        </div>

      </div>

      {/* Trend */}

      <div className="mt-5 flex items-center justify-between">

        <span className="text-xs text-slate-500">
          Live Statistics
        </span>

        <div className="flex items-center gap-1 text-brand-red">

          <ArrowUpRight size={15} />

          <span className="text-xs font-semibold">
            Active
          </span>

        </div>

      </div>

    </div>
  );
};

/*
====================================
Main Component
====================================
*/

export default function StatsGrid({
  stats,
}) {

  const cards = [
        {
      title: "Total Users",
      value: stats.totalUsers ?? 0,
      icon: Users,
      color:
        "bg-blue-500/20 text-blue-400",
    },

    {
      title: "Riders",
      value: stats.totalRiders ?? 0,
      icon: User,
      color:
        "bg-cyan-500/20 text-cyan-400",
    },

    {
      title: "Drivers",
      value: stats.totalDrivers ?? 0,
      icon: Car,
      color:
        "bg-green-500/20 text-green-400",
    },

    {
      title: "Admins",
      value: stats.totalAdmins ?? 0,
      icon: ShieldCheck,
      color:
        "bg-purple-500/20 text-purple-400",
    },

    {
      title: "Online Users",
      value: stats.onlineUsers ?? 0,
      icon: Wifi,
      color:
        "bg-emerald-500/20 text-emerald-400",
    },

    {
      title: "Online Drivers",
      value:
        stats.onlineDrivers ?? 0,
      icon: Activity,
      color:
        "bg-lime-500/20 text-lime-400",
    },

    {
      title: "Busy Drivers",
      value:
        stats.busyDrivers ?? 0,
      icon: CircleDot,
      color:
        "bg-orange-500/20 text-orange-400",
    },

    {
      title: "Available Drivers",
      value:
        stats.availableDrivers ?? 0,
      icon: CheckCircle2,
      color:
        "bg-green-500/20 text-green-400",
    },

    {
      title: "Offline Drivers",
      value:
        stats.offlineDrivers ?? 0,
      icon: XCircle,
      color:
        "bg-red-500/20 text-red-400",
    },

    {
      title: "Total Rides",
      value:
        stats.totalRides ?? 0,
      icon: Route,
      color:
        "bg-indigo-500/20 text-indigo-400",
    },
        {
      title: "Completed Rides",
      value:
        stats.completedRides ?? 0,
      icon: CheckCircle2,
      color:
        "bg-green-500/20 text-green-400",
    },

    {
      title: "Cancelled Rides",
      value:
        stats.cancelledRides ?? 0,
      icon: XCircle,
      color:
        "bg-red-500/20 text-red-400",
    },

    {
      title: "Payments",
      value:
        stats.totalPayments ?? 0,
      icon: CreditCard,
      color:
        "bg-violet-500/20 text-violet-400",
    },

    {
      title: "Paid Payments",
      value:
        stats.paidPayments ?? 0,
      icon: Wallet,
      color:
        "bg-emerald-500/20 text-emerald-400",
    },

    {
      title: "Failed Payments",
      value:
        stats.failedPayments ?? 0,
      icon: TrendingDown,
      color:
        "bg-red-500/20 text-red-400",
    },

    {
      title: "Total Revenue",
      value:
        stats.totalRevenues ?? 0,
      icon: IndianRupee,
      color:
        "bg-green-600/20 text-green-500",
    },

    {
      title: "Today's Revenue",
      value:
        stats.todayRevenue ?? 0,
      icon: CalendarDays,
      color:
        "bg-sky-500/20 text-sky-400",
    },

    {
      title: "Weekly Revenue",
      value:
        stats.weeklyRevenue ?? 0,
      icon: TrendingUp,
      color:
        "bg-blue-500/20 text-blue-400",
    },

    {
      title: "Monthly Revenue",
      value:
        stats.monthlyRevenue ?? 0,
      icon: Wallet,
      color:
        "bg-yellow-500/20 text-yellow-400",
    },

    {
      title: "Payment Success",
      value:
        stats.paymentSuccessRate ?? 0,
      icon: CheckCircle2,
      color:
        "bg-emerald-500/20 text-emerald-400",
    },

  ];
    return (
    <div>

      {/* Summary */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-bold">
            Platform Analytics
          </h2>

          <p className="mt-2 text-slate-400">
            Live statistics of your Ride Booking Platform
          </p>

        </div>

        <div className="hidden rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 lg:block">

          <p className="text-xs text-slate-500">
            Last Updated
          </p>

          <p className="font-semibold">
            {new Date().toLocaleTimeString()}
          </p>

        </div>

      </div>

      {/* Cards */}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">

        {cards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}

      </div>

      {/* Bottom Summary */}

      <div className="mt-10 grid gap-6 md:grid-cols-3">

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <p className="text-sm text-slate-400">
            Completion Rate
          </p>

          <h3 className="mt-2 text-4xl font-bold text-green-400">
            {stats.completionRate ?? 0}%
          </h3>

        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <p className="text-sm text-slate-400">
            Cancellation Rate
          </p>

          <h3 className="mt-2 text-4xl font-bold text-red-400">
            {stats.cancellationRate ?? 0}%
          </h3>

        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <p className="text-sm text-slate-400">
            Payment Success
          </p>

          <h3 className="mt-2 text-4xl font-bold text-emerald-400">
            {stats.paymentSuccessRate ?? 0}%
          </h3>

        </div>

      </div>

    </div>
  );
}