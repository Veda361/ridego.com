"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UserDetailsPage() {
  const { id } = useParams();

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [user, setUser] =
    useState(null);

  const [stats, setStats] =
    useState({});

  const [rides, setRides] =
    useState([]);

  const [payments, setPayments] =
    useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem("token");

        const res = await fetch(
          `${API}/api/admin/users/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!data.success) {
          throw new Error(
            data.message
          );
        }

        setUser(data.user);

        setStats(data.stats);

        setRides(
          data.recentRides || []
        );

        setPayments(
          data.payments || []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

    if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading User...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-7xl mx-auto p-10">

        <h1 className="text-4xl font-bold mb-8">
          User Details
        </h1>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">

          <h2 className="text-3xl font-bold">
            {user?.name}
          </h2>

          <p className="text-slate-400 mt-2">
            {user?.email}
          </p>

          <p className="mt-4">
            Phone :
            {" "}
            {user?.phone || "N/A"}
          </p>

          <p>
            Role :
            {" "}
            {user?.role}
          </p>

          <p>
            Online :
            {" "}
            {user?.isOnline
              ? "Yes"
              : "No"}
          </p>

        </div>

      </div>

    </div>
  );
}