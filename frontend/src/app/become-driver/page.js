"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Car, Bike, Truck, Loader2, ArrowRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function BecomeDriver() {
  const router = useRouter();

  const [vehicleType, setVehicleType] = useState("Car");

  const [vehicleNumber, setVehicleNumber] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!vehicleType) {
      return setError("Please select a vehicle type.");
    }

    if (!vehicleNumber.trim()) {
      return setError("Vehicle Number is required.");
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login first.");
      }

      const response = await fetch(`${API}/api/drivers/register`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          vehicleType,
          vehicleNumber: vehicleNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Driver registration failed");
      }

      setSuccess("Driver account created successfully!");

      setTimeout(() => {
        router.push("/driver");
      }, 1500);
    } catch (err) {
      console.error(err);

      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#070708] text-white flex items-center justify-center px-6 relative">
      {/* Background Glowing Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 h-[420px] w-[420px] rounded-full bg-brand-red/10 blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-brand-red/5 blur-[160px]" />
      </div>

      <div className="relative w-full max-w-lg z-10">
        <div className="glass-card rounded-3xl p-8 shadow-2xl border-white/10 hover:border-brand-red/30 transition-all duration-500">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-red/10 border border-brand-red/30 text-brand-red shadow-[0_0_15px_rgba(255,51,51,0.15)]">
              <Car size={40} />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-center text-4xl font-black">Become a Driver</h1>

          <p className="mt-3 text-center text-slate-400 text-sm">
            Register your vehicle and start earning with RiderGo.AI
          </p>

          {/* Alerts */}
          {error && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Vehicle Type */}
            <div>
              <label className="mb-2 block text-sm text-slate-300 font-medium">
                Vehicle Type
              </label>

              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-white outline-none focus:border-brand-red transition-colors"
              >
                <option value="Bike">Bike</option>
                <option value="Car">Car</option>
                <option value="Auto">Auto Rickshaw</option>
                <option value="Mini Cab">Mini Cab</option>
                <option value="SUV">SUV</option>
              </select>
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="mb-2 block text-sm text-slate-300 font-medium">
                Vehicle Number
              </label>

              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder="UP93 AB 1234"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 p-4 uppercase text-white outline-none focus:border-brand-red transition-colors"
              />
            </div>

            {/* Vehicle Preview */}
            <div className="grid grid-cols-3 gap-4">
              <div
                className={`rounded-2xl border p-5 text-center transition duration-300 ${
                  vehicleType === "Bike"
                    ? "border-brand-red bg-brand-red/10 text-brand-red"
                    : "border-slate-700 bg-slate-800/40 text-slate-400"
                }`}
              >
                <Bike className="mx-auto" size={26} />
                <p className="mt-2 text-xs font-semibold">Bike</p>
              </div>

              <div
                className={`rounded-2xl border p-5 text-center transition duration-300 ${
                  vehicleType === "Car"
                    ? "border-brand-red bg-brand-red/10 text-brand-red"
                    : "border-slate-700 bg-slate-800/40 text-slate-400"
                }`}
              >
                <Car className="mx-auto" size={26} />
                <p className="mt-2 text-xs font-semibold">Car</p>
              </div>

              <div
                className={`rounded-2xl border p-5 text-center transition duration-300 ${
                  vehicleType !== "Bike" && vehicleType !== "Car"
                    ? "border-brand-red bg-brand-red/10 text-brand-red"
                    : "border-slate-700 bg-slate-800/40 text-slate-400"
                }`}
              >
                <Truck className="mx-auto" size={26} />
                <p className="mt-2 text-xs font-semibold">Cab</p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-brand-red hover:bg-[#e62b1e] text-white shadow-[0_0_15px_rgba(255,51,51,0.25)] hover:shadow-[0_0_25px_rgba(255,51,51,0.45)] hover:-translate-y-0.5 active:translate-y-0 py-4 font-semibold transition duration-300 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  Register Driver
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
