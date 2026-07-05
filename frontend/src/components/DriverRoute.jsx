"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DriverRoute({
children,
}) {

const router = useRouter();

const [loading, setLoading] =
useState(true);

useEffect(() => {


const checkDriver =
  async () => {

    try {

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {

        router.push(
          "/login"
        );

        return;
      }

      const response =
        await fetch(
          `${API}/api/users/me`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {

        router.push(
          "/login"
        );

        return;
      }

      const user =
        await response.json();

      if (
        user.role !==
        "driver"
      ) {

        router.push(
          "/dashboard"
        );

        return;
      }

    } catch (error) {

      console.log(error);

      router.push(
        "/login"
      );

    } finally {

      setLoading(false);

    }

  };

checkDriver();


}, [router]);

if (loading) {


return (

  <div className="min-h-screen bg-slate-950 flex items-center justify-center">

    <div className="text-white text-xl">

      Loading Driver Dashboard...

    </div>

  </div>

);


}

return children;
}
