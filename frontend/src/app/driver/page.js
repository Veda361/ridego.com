"use client";

import { useEffect, useState, useRef } from "react";

import DriverRoute from "@/components/DriverRoute";

import {
  Car,
  IndianRupee,
  Star,
  TrendingUp,
  Power,
  PowerOff,
  Loader2,
  MapPin,
  CheckCircle,
} from "lucide-react";

import { socket, registerSocketUser, bindSocketEvents } from "@/lib/socket";
// import DriverLiveMap from "@/components/DriverLiveMap";

import dynamic from "next/dynamic";

const DriverLiveMap = dynamic(() => import("@/components/DriverLiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] flex items-center justify-center bg-slate-900 rounded-2xl">
      Loading Map...
    </div>
  ),
});

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DriverDashboard() {
  const [stats, setStats] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [error, setError] = useState("");
  // const [incomingRide, setIncomingRide] = useState(null);
  // const watchIdRef = useRef(null);
  // const activeRideRef = useRef(null);
  const [incomingRide, setIncomingRide] = useState(null);

  /*
=================================
Driver Live GPS
=================================
*/

  const [driverLocation, setDriverLocation] = useState(null);

  const watchIdRef = useRef(null);
  const activeRideRef = useRef(null);

  const getToken = () => localStorage.getItem("token");

  const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    activeRideRef.current = null;

    setDriverLocation(null);

    console.log("🛑 GPS Tracking Stopped");
  };

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsResponse, ridesResponse] = await Promise.all([
        fetch(`${API}/api/drivers/stats`, {
          headers: authHeaders(),
        }),

        fetch(`${API}/api/rides/driver/my-rides`, {
          headers: authHeaders(),
        }),
      ]);

      const statsData = await statsResponse.json();
      const ridesData = await ridesResponse.json();

      if (!statsResponse.ok) {
        throw new Error(statsData.message || "Unable to fetch driver stats");
      }

      if (!ridesResponse.ok) {
        throw new Error(ridesData.message || "Unable to fetch rides");
      }

      setStats(statsData.stats);
      setRides(ridesData.rides || []);
    } catch (error) {
      console.error("Driver Dashboard Error:", error);

      setError(error.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchDriverData();
    });

    socket.connect();
    const mongoUserId =
      localStorage.getItem("mongoUserId") || localStorage.getItem("userId");

    console.log("mongoUserId =", mongoUserId);

    console.log("Socket Connected =", socket.connected);

    const unregister = registerSocketUser(mongoUserId);

    const cleanup = bindSocketEvents({
      "new-ride": (ride) => {
        console.log("New Ride:", ride);
        setIncomingRide(ride);
      },

      "ride-removed": ({ rideId }) => {
        setIncomingRide((prev) => {
          if (!prev) return null;

          if (prev.rideId === rideId || prev._id === rideId) {
            return null;
          }

          return prev;
        });
      },

      "ride-completed": ({ rideId }) => {
        if (rideId == activeRideRef.current) {
          stopTracking();
        }
        fetchDriverData();
      },

      "ride-cancelled": ({ rideId }) => {
        if (rideId == activeRideRef.current) {
          stopTracking();
        }
        fetchDriverData();
      },
    });

    return () => {
      cleanup();

      unregister();

      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      if (socket.connected) {
        socket.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goOnline = async () => {
    try {
      setOnlineLoading(true);

      const response = await fetch(`${API}/api/drivers/online`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          lat: 25.4484,
          lng: 78.5685,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      await fetchDriverData();
    } catch (error) {
      console.error(error);

      setError(error.message || "Failed to go online.");
    } finally {
      setOnlineLoading(false);
    }
  };

  const goOffline = async () => {
    try {
      setOnlineLoading(true);

      const response = await fetch(`${API}/api/drivers/offline`, {
        method: "POST",
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      await fetchDriverData();
      stopTracking();
    } catch (error) {
      console.error(error);

      setError(error.message || "Failed to go offline.");
    } finally {
      setOnlineLoading(false);
    }
  };

  const acceptRide = async (rideId) => {
    try {
      const response = await fetch(`${API}/api/rides/${rideId}/accept`, {
        method: "PUT",
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      console.log("✅ Ride Accepted");

      setIncomingRide(null);

      activeRideRef.current = rideId;

      // Join ride room
      socket.emit("join-ride", rideId);

      // Refresh dashboard
      await fetchDriverData();

      // Remove popup from all drivers
      socket.emit("ride-removed", rideId);

      /*
    ==================================
    Stop Previous GPS Tracking
    ==================================
    */

      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      /*
    ==================================
    Get Initial GPS Immediately
    ==================================
    */

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          console.log("📍 Initial Driver Location:", location);

          // Update Driver Map instantly
          setDriverLocation(location);

          // Send to backend
          socket.emit("driver-location", {
            rideId,
            ...location,
          });
        },
        (error) => {
          console.error("Initial GPS Error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );

      /*
    ==================================
    Start Live GPS Tracking
    ==================================
    */

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          console.log("📍 Live Driver Location:", location);

          // Update map immediately
          setDriverLocation(location);

          // Send live location to backend
          socket.emit("driver-location", {
            rideId,
            ...location,
          });
        },
        (error) => {
          console.error("GPS Watch Error:", error);

          switch (error.code) {
            case error.PERMISSION_DENIED:
              setError("Location permission denied.");
              break;

            case error.POSITION_UNAVAILABLE:
              setError("Unable to determine current location.");
              break;

            case error.TIMEOUT:
              setError("GPS request timed out.");
              break;

            default:
              setError("GPS tracking failed.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } catch (error) {
      console.error(error);

      setError(error.message || "Failed to accept ride.");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-brand-red" size={45} />
        <p className="text-slate-400 text-sm">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <DriverRoute>
      <div className="min-h-screen bg-[#070708] text-white relative">
        {/* Background Glowing Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-0 h-[450px] w-[450px] rounded-full bg-brand-red/10 blur-[160px]" />
          <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-brand-red/5 blur-[160px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
          {/* Header */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <div>
              <h1 className="text-4xl font-black">Driver Dashboard</h1>

              <p className="text-slate-400 mt-2 text-sm">
                Manage your rides, earnings and availability
              </p>
            </div>

            <div className="mt-5 md:mt-0">
              <span
                className={`px-5 py-2 rounded-full font-semibold ${
                  stats?.isOnline
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {stats?.isOnline ? "🟢 Online" : "🔴 Offline"}
              </span>
            </div>
          </div>

          {/* Error */}

          {error && (
            <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              {error}
            </div>
          )}

          {/* Statistics */}

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <div className="glass-card rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-red/30 hover:shadow-[0_0_20px_rgba(255,51,51,0.1)]">
              <Car className="text-brand-red mb-4" size={30} />

              <p className="text-slate-400 text-sm font-medium">Total Rides</p>

              <h2 className="mt-3 text-4xl font-bold text-white">
                {stats?.totalRides ?? 0}
              </h2>
            </div>

            <div className="glass-card rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-red/30 hover:shadow-[0_0_20px_rgba(255,51,51,0.1)]">
              <IndianRupee className="text-brand-red mb-4" size={30} />

              <p className="text-slate-400 text-sm font-medium">Total Earnings</p>

              <h2 className="mt-3 text-4xl font-bold text-white">
                ₹{stats?.totalEarnings ?? 0}
              </h2>
            </div>

            <div className="glass-card rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-red/30 hover:shadow-[0_0_20px_rgba(255,51,51,0.1)]">
              <Star className="text-brand-red mb-4" size={30} />

              <p className="text-slate-400 text-sm font-medium">Average Rating</p>

              <h2 className="mt-3 text-4xl font-bold text-white">
                ⭐ {stats?.averageRating ?? 0}
              </h2>
            </div>

            <div className="glass-card rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-red/30 hover:shadow-[0_0_20px_rgba(255,51,51,0.1)]">
              <TrendingUp className="text-brand-red mb-4" size={30} />

              <p className="text-slate-400 text-sm font-medium">Completion Rate</p>

              <h2 className="mt-3 text-4xl font-bold text-white">
                {stats?.completionRate ?? 0}%
              </h2>
            </div>
          </div>

          {/* Driver Controls */}

          <div className="mt-10 rounded-3xl border border-white/10 glass-card p-8">
            <h2 className="text-2xl font-bold mb-6 text-white">Driver Controls</h2>

            <div className="flex flex-wrap gap-5">
              <button
                disabled={onlineLoading || stats?.isOnline}
                onClick={goOnline}
                className="flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-700 px-6 py-3 font-semibold transition disabled:opacity-50 cursor-pointer text-white"
              >
                {onlineLoading && !stats?.isOnline ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Power size={18} />
                )}
                Go Online
              </button>

              <button
                disabled={onlineLoading || !stats?.isOnline}
                onClick={goOffline}
                className="flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 px-6 py-3 font-semibold transition disabled:opacity-50 cursor-pointer text-white"
              >
                {onlineLoading && stats?.isOnline ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <PowerOff size={18} />
                )}
                Go Offline
              </button>
            </div>
          </div>

          {/* Incoming Ride */}

          {incomingRide && (
            <div className="mt-10 rounded-3xl border border-green-500/30 bg-green-500/10 p-8 shadow-[0_0_25px_rgba(34,197,94,0.1)]">
              <h2 className="text-3xl font-extrabold text-green-400">
                🚖 New Ride Request
              </h2>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="text-green-400" size={18} />

                  <span className="text-slate-200">
                    <strong className="text-white">Pickup:</strong>{" "}
                    {incomingRide?.pickup?.address || "Unknown"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="text-red-400" size={18} />

                  <span className="text-slate-200">
                    <strong className="text-white">Destination:</strong>{" "}
                    {incomingRide?.destination?.address || "Unknown"}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  acceptRide(incomingRide.rideId || incomingRide._id)
                }
                className="mt-6 flex items-center gap-2 rounded-full bg-green-600 px-7 py-3 font-semibold hover:bg-green-700 transition cursor-pointer text-white"
              >
                <CheckCircle size={20} />
                Accept Ride
              </button>
            </div>
          )}

          {/* Driver Live GPS */}

          <div className="mt-10 rounded-3xl border border-white/10 glass-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">🚗 Live Driver Location</h2>

              {driverLocation && (
                <span className="rounded-full bg-green-500/20 px-4 py-2 text-green-400 text-sm font-bold border border-green-500/30">
                  Live GPS
                </span>
              )}
            </div>

            <div className="h-[450px] rounded-2xl overflow-hidden border border-white/10">
              <DriverLiveMap driverLocation={driverLocation} />
            </div>
          </div>

          {/* Ride History */}

          <div className="mt-10 rounded-3xl border border-white/10 glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Recent Driver Rides</h2>

              <span className="rounded-full bg-brand-red/10 border border-brand-red/20 px-4 py-2 text-brand-red text-sm font-bold shadow-[0_0_10px_rgba(255,51,51,0.1)]">
                {rides.length} Ride(s)
              </span>
            </div>

            {rides.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 p-12 text-center">
                <Car className="mx-auto text-slate-500 mb-4" size={40} />

                <p className="text-slate-400 text-sm">No rides completed yet.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {rides.map((ride) => (
                  <div
                    key={ride._id}
                    className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6 transition hover:border-brand-red/40 hover:bg-slate-750"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <MapPin size={18} className="text-brand-red" />

                          <span className="text-slate-200">
                            {ride.pickup?.address || "Unknown Pickup"}
                          </span>
                        </div>

                        <div className="mt-3 text-slate-400 text-sm ml-6">
                          → {ride.destination?.address || "Unknown Destination"}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">
                          ₹{ride.fare || 0}
                        </p>

                        <span
                          className={`inline-block mt-2 rounded-full px-4 py-1 text-sm ${
                            ride.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : ride.status === "cancelled"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {ride.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DriverRoute>
  );
}
