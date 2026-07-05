"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

import { useEffect, useState, useRef } from "react";

import {
  Car,
  MapPin,
  Wallet,
  Clock3,
  LogOut,
  Bell,
  Loader2,
} from "lucide-react";

import { socket, registerSocketUser, bindSocketEvents } from "@/lib/socket";
import dynamic from "next/dynamic";

const LiveRideMap = dynamic(() => import("@/components/LiveRideMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] flex items-center justify-center bg-slate-900 rounded-2xl">
      Loading Map...
    </div>
  ),
});

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Dashboard() {
  const { user, logout } = useAuth();

  const router = useRouter();

  const [rides, setRides] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");

  const [availableDrivers, setAvailableDrivers] = useState(0);

  const [currentRide, setCurrentRide] = useState(null);

  const [rideStatus, setRideStatus] = useState("");

  const [driverAssigned, setDriverAssigned] = useState(false);

  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalRides: 0,
    totalDistance: 0,
    totalSpent: 0,
    totalDuration: 0,
  });

  const [driverLocation, setDriverLocation] = useState(null);

  const [pickupLocation, setPickupLocation] = useState(null);

  const [destinationLocation, setDestinationLocation] = useState(null);

  const [route, setRoute] = useState([]);

  const lastUpdate = useRef(0);

  const activeRideRef = useRef(null);

  const [driverInfo, setDriverInfo] = useState(null);

  const [eta, setEta] = useState("--");

  const [distanceAway, setDistanceAway] = useState("--");

  const getToken = () => localStorage.getItem("token");

  const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [rideResponse, notificationResponse] = await Promise.all([
        fetch(`${API}/api/rides/my-rides`, {
          headers: authHeaders(),
        }),

        fetch(`${API}/api/notifications`, {
          headers: authHeaders(),
        }),
      ]);

      const rideData = await rideResponse.json();

      const notificationData = await notificationResponse.json();

      if (!rideResponse.ok) {
        throw new Error(rideData.message || "Unable to fetch rides.");
      }

      if (!notificationResponse.ok) {
        throw new Error(
          notificationData.message || "Unable to fetch notifications.",
        );
      }

      const myRides = rideData.rides || [];

      setRides(myRides);

      setNotifications(notificationData.notifications || []);

      setStats({
        totalRides: myRides.length,

        totalDistance: myRides.reduce(
          (sum, ride) => sum + (ride.distance || 0),
          0,
        ),

        totalSpent: myRides.reduce((sum, ride) => sum + (ride.fare || 0), 0),

        totalDuration: myRides.reduce(
          (sum, ride) => sum + (ride.duration || 0),
          0,
        ),
      });
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoute = async (start, end) => {
    try {
      if (!start || !end) return;

      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`,
      );

      const data = await response.json();

      if (!data.routes?.length) return;

      const routeData = data.routes[0];

      const points = routeData.geometry.coordinates.map(([lng, lat]) => [
        lat,
        lng,
      ]);

      setRoute(points);

      setEta(Math.round(routeData.duration / 60));

      setDistanceAway((routeData.distance / 1000).toFixed(1));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleDriverLocation = (data) => {
      console.log("📍 Driver Location:", data);

      if (!currentRide) return;

      const rideId = currentRide.rideId || currentRide._id;

      if (data.rideId !== rideId) return;

      setDriverLocation({
        lat: data.lat,
        lng: data.lng,
      });
    };

    socket.on("driver-location", handleDriverLocation);

    return () => {
      socket.off("driver-location", handleDriverLocation);
    };
  }, [currentRide]);

  useEffect(() => {
    if (!pickupLocation || !destinationLocation) return;

    Promise.resolve().then(() => {
      fetchRoute(pickupLocation, destinationLocation);
    });
  }, [pickupLocation, destinationLocation]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchDashboardData();
    });

    socket.connect();

    const unregister = registerSocketUser(localStorage.getItem("mongoUserId"));

    const cleanup = bindSocketEvents({
      "ride-accepted": (data) => {
        console.log("✅ Ride Accepted:", data);

        activeRideRef.current = data.rideId;

        socket.emit("join-ride", data.rideId);

        setRideStatus("Driver Coming");

        setDriverAssigned(true);

        setDriverInfo(data.driver || null);

        setCurrentRide((prev) => ({
          ...prev,
          ...data,
          status: "accepted",
        }));

        setPickupLocation(data.pickup);

        setDestinationLocation(data.destination);

        if (data.pickup && data.destination) {
          fetchRoute(data.pickup, data.destination);
        }
      },

      "ride-started": () => {
        console.log("🚖 Ride Started");

        setRideStatus("Ride Started");

        setCurrentRide((prev) => {
          if (!prev) return prev;

          const updated = {
            ...prev,
            status: "in_progress",
          };

          if (driverLocation && destinationLocation) {
            fetchRoute(driverLocation, destinationLocation);
          }

          return updated;
        });
      },

      "ride-completed": () => {
        console.log("✅ Ride Completed");

        setRideStatus("Ride Completed");

        setCurrentRide((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            status: "completed",
          };
        });

        // Leave ride room
        if (activeRideRef.current) {
          socket.emit("leave-ride", activeRideRef.current);
        }

        // Clear live tracking
        setTimeout(() => {
          setDriverAssigned(false);

          setDriverLocation(null);

          setPickupLocation(null);

          setDestinationLocation(null);

          setRoute([]);

          setDriverInfo(null);

          setEta("--");

          setDistanceAway("--");

          setRideStatus("");

          setCurrentRide(null);

          fetchDashboardData();

          activeRideRef.current = null;
        }, 2000);
      },

      "ride-cancelled": () => {
        console.log("❌ Ride Cancelled");

        if (activeRideRef.current) {
          socket.emit("leave-ride", activeRideRef.current);
          activeRideRef.current = null;
        }
        setDriverAssigned(false);

        setRideStatus("Ride Cancelled");

        setDriverLocation(null);

        setPickupLocation(null);

        setDestinationLocation(null);

        setRoute([]);

        setDriverInfo(null);

        setEta("--");

        setDistanceAway("--");

        setCurrentRide(null);

        fetchDashboardData();
      },
    });

    return () => {
      cleanup();

      unregister();

      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!driverLocation) return;

    const now = Date.now();

    if (now - lastUpdate.current < 2500) {
      return;
    }

    lastUpdate.current = now;
    Promise.resolve().then(() => {
      switch (currentRide?.status) {
        case "accepted":
        case "arriving":
          fetchRoute(driverLocation, pickupLocation);
          break;

        case "in_progress":
          fetchRoute(driverLocation, destinationLocation);
          break;

        default:
          break;
      }
    });
  }, [driverLocation, pickupLocation, destinationLocation, currentRide]);

  const bookRide = async () => {
    if (!pickup.trim() || !destination.trim()) {
      return setError("Pickup and Destination are required.");
    }

    try {
      setBookingLoading(true);
      setError("");

      const response = await fetch(`${API}/api/rides/request`, {
        method: "POST",

        headers: authHeaders(),

        body: JSON.stringify({
          pickup: {
            address: pickup,
            lat: 25.4484,
            lng: 78.5685,
          },

          destination: {
            address: destination,
            lat: 25.46,
            lng: 78.59,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setAvailableDrivers(data.nearbyDrivers?.length || 0);

      setCurrentRide(data.ride);
      activeRideRef.current = data.ride._id;

      socket.emit("join-ride", data.ride._id);
      setPickupLocation(data.ride.pickup);

      setDestinationLocation(data.ride.destination);

      await fetchDashboardData();
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to book ride.");
    } finally {
      setBookingLoading(false);
    }
  };

  const cancelRide = async () => {
    if (!currentRide) return;

    try {
      const response = await fetch(
        `${API}/api/rides/${currentRide._id}/cancel`,
        {
          method: "PUT",
          headers: authHeaders(),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      socket.emit("ride-cancelled", {
        rideId: currentRide._id,
      });

      setCurrentRide(null);
      setDriverAssigned(false);
      setDriverLocation(null);
      setPickupLocation(null);
      setDestinationLocation(null);
      setRoute([]);
      setDriverInfo(null);
      setEta("--");
      setDistanceAway("--");
      setRideStatus("");

      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const callDriver = () => {
    if (!driverInfo?.phone) {
      return alert("Driver phone number not available.");
    }

    window.location.href = `tel:${driverInfo.phone}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={45} className="animate-spin text-indigo-500" />

          <p className="text-slate-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#070708] text-white">
        {/* Animated Background */}

        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-0 h-[450px] w-[450px] rounded-full bg-brand-red/10 blur-[160px]" />

          <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-brand-red/5 blur-[160px]" />
        </div>

        {/* Navbar */}

        <nav className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-brand-red/10 border border-brand-red/30 flex items-center justify-center">
                <Car size={18} className="text-brand-red" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  RiderGo<span className="text-brand-red">.AI</span>
                </h1>
                <p className="text-[10px] text-slate-500">
                  Smart Ride Booking Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="relative cursor-pointer">
                <Bell size={22} className="text-slate-300" />

                {notifications.length > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-red px-1 text-xs font-bold shadow-[0_0_10px_rgba(255,51,51,0.3)]">
                    {notifications.length}
                  </span>
                )}
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-full bg-brand-red hover:bg-[#e62b1e] px-5 py-2 font-semibold transition-all hover:scale-105 shadow-[0_0_15px_rgba(255,51,51,0.25)] cursor-pointer"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-6 py-10">
          {/* Error */}

          {error && (
            <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              {error}
            </div>
          )}

          {/* Hero */}

          <div className="overflow-hidden rounded-3xl glass-card p-8 border border-brand-red/20 shadow-[0_0_30px_rgba(255,51,51,0.05)]">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div>
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-brand-red via-[#ff5555] to-white bg-clip-text text-transparent">Welcome Back 👋</h2>

                <p className="mt-4 text-xl font-bold text-white">
                  {user?.displayName || user?.email?.split("@")[0] || "Rider"}
                </p>

                <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
              </div>

              <div className="rounded-2xl bg-brand-red/10 border border-brand-red/20 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-wider text-brand-red font-semibold">
                  Active Ride
                </p>

                <h3 className="mt-2 text-2xl font-black text-white">
                  {currentRide ? currentRide.status : "No Active Ride"}
                </h3>
              </div>
            </div>
          </div>

          {/* Statistics */}

          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <div className="glass-card rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/30 hover:shadow-[0_0_20px_rgba(255,51,51,0.1)]">
              <Car className="mb-4 text-brand-red" size={30} />

              <p className="text-slate-400 text-sm font-medium">Total Rides</p>

              <h2 className="mt-3 text-4xl font-bold text-white">{stats.totalRides}</h2>
            </div>

            <div className="glass-card rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/30 hover:shadow-[0_0_20px_rgba(255,51,51,0.1)]">
              <MapPin className="mb-4 text-brand-red" size={30} />

              <p className="text-slate-400 text-sm font-medium">Distance Travelled</p>

              <h2 className="mt-3 text-4xl font-bold text-white">
                {stats.totalDistance} km
              </h2>
            </div>

            <div className="glass-card rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/30 hover:shadow-[0_0_20px_rgba(255,51,51,0.1)]">
              <Wallet className="mb-4 text-brand-red" size={30} />

              <p className="text-slate-400 text-sm font-medium">Total Spent</p>

              <h2 className="mt-3 text-4xl font-bold text-white">₹{stats.totalSpent}</h2>
            </div>

            <div className="glass-card rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/30 hover:shadow-[0_0_20px_rgba(255,51,51,0.1)]">
              <Clock3 className="mb-4 text-brand-red" size={30} />

              <p className="text-slate-400 text-sm font-medium">Ride Duration</p>

              <h2 className="mt-3 text-4xl font-bold text-white">
                {stats.totalDuration} min
              </h2>
            </div>
          </div>

          {/* Book Ride */}
          <div className="mt-10 rounded-3xl border border-white/10 glass-card p-8 hover:border-brand-red/20 transition-all">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Book A Ride</h2>

                <p className="mt-2 text-slate-400 text-sm">
                  Enter your pickup and destination.
                </p>
              </div>

              <div className="rounded-xl bg-brand-red/10 border border-brand-red/20 px-4 py-2 text-brand-red text-sm font-bold shadow-[0_0_10px_rgba(255,51,51,0.1)]">
                Nearby Drivers
                <span className="ml-2 text-xl font-black">
                  {availableDrivers}
                </span>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Pickup Location
                </label>

                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="Enter Pickup Location"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-5 py-4 outline-none transition focus:border-brand-red"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Destination
                </label>

                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter Destination"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-5 py-4 outline-none transition focus:border-brand-red"
                />
              </div>
            </div>

            <button
              onClick={bookRide}
              disabled={bookingLoading}
              className="mt-8 flex items-center justify-center gap-3 rounded-full bg-brand-red hover:bg-[#e62b1e] px-8 py-3.5 font-semibold transition-all shadow-[0_0_15px_rgba(255,51,51,0.25)] hover:shadow-[0_0_25px_rgba(255,51,51,0.45)] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {bookingLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Finding Driver...
                </>
              ) : (
                <>
                  <Car size={18} />
                  Book Ride
                </>
              )}
            </button>
          </div>

          {/* Driver Status */}

          <div className="mt-8 space-y-4">
            {driverAssigned && (
              <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />

                  <h3 className="font-semibold text-green-400">
                    Driver Assigned Successfully
                  </h3>
                </div>
              </div>
            )}

            {rideStatus && (
              <div className="rounded-2xl border border-brand-red/30 bg-brand-red/10 p-5">
                <h3 className="font-semibold text-brand-red">Ride Status</h3>

                <p className="mt-2 text-lg font-bold text-white">{rideStatus}</p>
              </div>
            )}
          </div>

          {/* Current Ride */}
          {/* ======================================
        LIVE RIDE TRACKING
====================================== */}
          {/* Current Ride */}
          {/* ======================================
              LIVE RIDE TRACKING
          ====================================== */}

          {currentRide && (
            <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 glass-card">
              {/* Header */}

              <div className="border-b border-white/10 bg-gradient-to-r from-brand-red to-brand-red/80 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Live Ride</h2>

                    <p className="mt-2 text-white/80">
                      {currentRide.status === "accepted" &&
                        "Driver is coming to your pickup location"}

                      {currentRide.status === "in_progress" &&
                        "Enjoy your ride 🚖"}

                      {currentRide.status === "completed" && "Ride Completed"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-5 py-2 text-sm font-bold capitalize ${
                      currentRide.status === "accepted"
                        ? "bg-blue-500 text-white"
                        : currentRide.status === "in_progress"
                          ? "bg-green-500 text-white"
                          : currentRide.status === "completed"
                            ? "bg-brand-red text-white"
                            : "bg-slate-700 text-white"
                    }`}
                  >
                    {currentRide.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* LIVE MAP */}

              <div className="h-[450px]">
                <LiveRideMap
                  pickupLocation={pickupLocation}
                  destinationLocation={destinationLocation}
                  driverLocation={driverLocation}
                  route={route}
                />
              </div>

              {/* Bottom Sheet */}

              <div className="bg-slate-950/65 p-6 border-t border-white/10">
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Left */}

                  <div>
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />

                      <h2 className="text-2xl font-bold text-white">
                        {rideStatus || "Driver Coming"}
                      </h2>
                    </div>

                    <p className="mt-3 text-slate-400 text-sm">
                      {eta} min away • {distanceAway} km
                    </p>

                    <div className="mt-8 space-y-5">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Pickup</p>

                        <p className="font-semibold text-slate-200">
                          {pickupLocation?.address}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Destination</p>

                        <p className="font-semibold text-slate-200">
                          {destinationLocation?.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right */}

                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
                    <h3 className="text-xl font-bold text-white">
                      {driverInfo?.name ?? "Driver"}
                    </h3>

                    <p className="mt-2 text-yellow-500 font-bold">
                      ⭐ {driverInfo?.rating ?? 4.8}
                    </p>

                    <p className="mt-5 text-sm text-slate-300">
                      {driverInfo?.vehicleType ?? "Mini Cab"}
                    </p>

                    <p className="text-xs text-slate-500">
                      {driverInfo?.vehicleNumber ?? "UP92 AB 1234"}
                    </p>

                    <div className="mt-8 flex gap-4">
                      <button
                        onClick={callDriver}
                        className="flex-1 rounded-full bg-green-600 hover:bg-green-700 py-3 font-semibold transition cursor-pointer"
                      >
                        📞 Call
                      </button>

                      <button
                        onClick={() => router.push(`/chat/${currentRide._id}`)}
                        className="flex-1 rounded-full bg-brand-red hover:bg-[#e62b1e] py-3 font-semibold shadow-[0_0_15px_rgba(255,51,51,0.25)] cursor-pointer"
                      >
                        💬 Message
                      </button>
                    </div>

                    <button
                      onClick={cancelRide}
                      className="mt-5 w-full rounded-full bg-red-600 hover:bg-red-700 py-3 font-semibold transition cursor-pointer"
                    >
                      Cancel Ride
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="mt-10 rounded-3xl border border-white/10 glass-card p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Notifications</h2>

              <Bell className="text-brand-red" />
            </div>

            {notifications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 py-10 text-center">
                <Bell className="mx-auto mb-4 text-slate-600" size={40} />

                <p className="text-slate-400 text-sm">No notifications available.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification._id}
                    className="rounded-2xl border border-slate-700 bg-slate-800/40 p-5 transition hover:border-brand-red/40"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-200">{notification.title}</h3>

                        <p className="mt-2 text-sm text-slate-400">
                          {notification.message}
                        </p>
                      </div>

                      <Bell className="text-brand-red" size={18} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Trips */}

          <div className="mt-10 rounded-3xl border border-white/10 glass-card p-8">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Recent Trips</h2>

              <span className="rounded-full bg-brand-red/10 border border-brand-red/20 px-4 py-2 text-brand-red text-sm font-bold shadow-[0_0_10px_rgba(255,51,51,0.1)]">
                {rides.length} Ride(s)
              </span>
            </div>

            {rides.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 py-12 text-center">
                <Car size={40} className="mx-auto mb-4 text-slate-600" />

                <p className="text-slate-400 text-sm">No rides yet.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {rides.map((ride) => (
                  <div
                    key={ride._id}
                    className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6 transition hover:border-brand-red/40 hover:bg-slate-750"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">
                            Pickup
                          </p>

                          <p className="mt-1 font-semibold text-slate-200">
                            {ride.pickup?.address || "Unknown Pickup"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">
                            Destination
                          </p>

                          <p className="mt-1 font-semibold text-slate-200">
                            {ride.destination?.address || "Unknown Destination"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">
                          ₹{ride.fare || 0}
                        </p>

                        <span
                          className={`mt-3 inline-block rounded-full px-4 py-1 text-sm font-semibold ${
                            ride.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : ride.status === "cancelled"
                                ? "bg-red-500/20 text-red-400"
                                : ride.status === "accepted"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : ride.status === "in_progress"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {ride.status}
                        </span>

                        {ride.distance > 0 && (
                          <p className="mt-3 text-sm text-slate-400">
                            {ride.distance} km
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
