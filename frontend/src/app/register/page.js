"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createUserWithEmailAndPassword } from "firebase/auth";

import { auth } from "@/lib/firebase";

import { User, Mail, Lock, Car, ArrowRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [role, setRole] = useState("rider");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);
      setError("");

      console.log("STEP 1 - Firebase Register");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      console.log("STEP 2 - Firebase Success");

      const user = userCredential.user;

      const token = await user.getIdToken();

      console.log("STEP 3 - Token Received");

      localStorage.setItem("token", token);

      const response = await fetch(`${API}/api/users/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          role,
        }),
      });

      console.log("STEP 4 - Backend Hit");

      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      if (role === "driver") {
        router.push("/become-driver");
      } else {
        router.push("/dashboard");
      }
      
    } catch (err) {
      console.error("REGISTER ERROR:", err);

      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] flex items-center justify-center px-6 relative">
      {/* Background Glowing Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 h-72 w-72 bg-brand-red/10 rounded-full blur-[120px] opacity-35" />
        <div className="absolute bottom-20 right-20 h-72 w-72 bg-brand-red/5 rounded-full blur-[120px] opacity-35" />
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="glass-card rounded-3xl p-8 shadow-2xl border-white/10 hover:border-brand-red/30 transition-all duration-500">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red shadow-[0_0_15px_rgba(255,51,51,0.15)]">
              <Car size={32} />
            </div>
          </div>

          <h1 className="text-3xl font-black text-center text-white">
            Create Account
          </h1>

          <p className="text-center text-slate-400 mt-2 text-sm">
            Start your journey today
          </p>

          {error && (
            <div className="mt-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5 mt-8">
            <div>
              <label className="text-slate-300 text-sm font-medium">Full Name</label>

              <div className="relative mt-2">
                <User
                  size={18}
                  className="absolute left-4 top-4 text-slate-500"
                />

                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Full Name"
                  className="w-full bg-slate-850/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-brand-red transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium">Select Role</label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none focus:border-brand-red transition-colors"
              >
                <option value="rider">Rider</option>

                <option value="driver">Driver</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium">Email</label>

              <div className="relative mt-2">
                <Mail
                  size={18}
                  className="absolute left-4 top-4 text-slate-500"
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  className="w-full bg-slate-850/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-brand-red transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium">Password</label>

              <div className="relative mt-2">
                <Lock
                  size={18}
                  className="absolute left-4 top-4 text-slate-500"
                />

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create Password"
                  className="w-full bg-slate-850/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-brand-red transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium">Confirm Password</label>

              <div className="relative mt-2">
                <Lock
                  size={18}
                  className="absolute left-4 top-4 text-slate-500"
                />

                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full bg-slate-850/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-brand-red transition-colors"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-brand-red hover:bg-[#e62b1e] text-white shadow-[0_0_15px_rgba(255,51,51,0.25)] hover:shadow-[0_0_25px_rgba(255,51,51,0.45)] hover:-translate-y-0.5 active:translate-y-0 py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition duration-300 cursor-pointer"
            >
              {loading ? "Creating Account..." : "Create Account"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6 text-sm">
            Already have an account?
            <a
              href="/login"
              className="ml-2 text-brand-red hover:text-[#ff5555] font-medium transition-colors"
            >
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
