"use client";

import { useEffect, useState } from "react";

import DashboardHeader from "@/components/admin/DashboardHeader";
import StatsGrid from "@/components/admin/StatsGrid";
import UsersTable from "@/components/admin/UsersTable";
import DriversTable from "@/components/admin/DriversTable";
import RidesTable from "@/components/admin/RidesTable";
import { Loader2 } from "lucide-react";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminPage() {
const [loading, setLoading] =
useState(true);

const [error, setError] =
useState("");

const [stats, setStats] =
useState({});

const [users, setUsers] =
useState([]);

const [drivers, setDrivers] =
useState([]);

const [rides, setRides] =
useState([]);

const fetchAdminData =
async () => {
try {
setLoading(true);


    const token =
      localStorage.getItem(
        "token"
      );

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const [
      statsRes,
      usersRes,
      driversRes,
      ridesRes,
    ] = await Promise.all([
      fetch(
        `${API}/api/admin/stats`,
        { headers }
      ),
      fetch(
        `${API}/api/admin/users`,
        { headers }
      ),
      fetch(
        `${API}/api/admin/drivers`,
        { headers }
      ),
      fetch(
        `${API}/api/admin/rides`,
        { headers }
      ),
    ]);

    const statsData =
      await statsRes.json();

    const usersData =
      await usersRes.json();

    const driversData =
      await driversRes.json();

    const ridesData =
      await ridesRes.json();

    setStats(statsData);

    setUsers(
      usersData.users || []
    );

    setDrivers(
      driversData.drivers || []
    );

    setRides(
      ridesData.rides || []
    );
  } catch (error) {
    console.log(error);

    setError(
      error.message
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
Promise.resolve().then(() => {
fetchAdminData();
});
}, []);


if (loading) {
return ( <div className="min-h-screen bg-[#070708] flex items-center justify-center"> <Loader2
       size={40}
       className="animate-spin text-brand-red"
     /> </div>
);
}

return (
  <div className="min-h-screen bg-[#070708] text-white relative">
    {/* Background Glowing Blobs */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-0 left-0 h-[450px] w-[450px] rounded-full bg-brand-red/10 blur-[160px]" />
      <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-brand-red/5 blur-[160px]" />
    </div>

    <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">

      <DashboardHeader
        onRefresh={fetchAdminData}
        loading={loading}
      />

      {error && (
        <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      <StatsGrid stats={stats} />

      <AnalyticsCharts stats={stats} />

      <UsersTable users={users} />

      <DriversTable drivers={drivers} />

      <RidesTable rides={rides} />

    </div>
  </div>
);
}