"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

import { Mail, Lock, ArrowRight, Car } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;

      const token = await user.getIdToken(true);
      console.log("Firebase UID:", user.uid);
      console.log("Token:", token.substring(0, 50));``

      localStorage.setItem("token", token);

      // Get Current User From Backend
      const response = await fetch(`${API}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const currentUser = await response.json();

      console.log("Current User:", currentUser);

      // Save MongoDB User Details
      localStorage.setItem("mongoUserId", currentUser._id);

      localStorage.setItem("userId", currentUser._id);

      localStorage.setItem("role", currentUser.role);

      console.log("Mongo User Saved:", currentUser._id);

      // Role Based Redirect
      if (currentUser.role === "admin") {
        router.push("/admin");
      } else if (currentUser.role === "driver") {
        router.push("/driver");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.log(err);
      console.log(err.code);
      console.log(err.message);

      setError(err.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] flex items-center justify-center px-6 relative">
      {/* Background Glowing Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 h-72 w-72 bg-brand-red/10 rounded-full blur-[120px] opacity-35"></div>
        <div className="absolute bottom-20 right-20 h-72 w-72 bg-brand-red/5 rounded-full blur-[120px] opacity-35"></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="glass-card rounded-3xl p-8 shadow-2xl border-white/10 hover:border-brand-red/30 transition-all duration-500">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red shadow-[0_0_15px_rgba(255,51,51,0.15)]">
              <Car size={32} />
            </div>
          </div>

          <h1 className="text-3xl font-black text-center text-white">
            Welcome Back
          </h1>

          <p className="text-slate-400 text-center mt-2 text-sm">
            Sign in to continue your journey
          </p>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="text-slate-300 text-sm font-medium">Email</label>

              <div className="mt-2 relative">
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

              <div className="mt-2 relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-4 text-slate-500"
                />

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full bg-slate-855/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-brand-red transition-colors"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-brand-red hover:bg-[#e62b1e] text-white shadow-[0_0_15px_rgba(255,51,51,0.25)] hover:shadow-[0_0_25px_rgba(255,51,51,0.45)] hover:-translate-y-0.5 active:translate-y-0 py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition duration-300 cursor-pointer"
            >
              {loading ? "Signing In..." : "Sign In"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6 text-sm">
            New Rider?
            <a
              href="/register"
              className="text-brand-red ml-2 hover:text-[#ff5555] font-medium transition-colors"
            >
              Create Account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
