"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";

import { useAuth } from "@/context/authContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className="animate-spin text-indigo-500"
            size={42}
          />

          <p className="text-slate-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // User is not authenticated
  if (!user) {
    return null;
  }

  // User is authenticated
  return <>{children}</>;
}