"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { auth } from "@/lib/firebase";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(null);

  const [mongoUser, setMongoUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchMongoUser = async (idToken) => {
    try {
      const response = await fetch(`${API}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) return;

      const data = await response.json();

      const userData = data.user || data;

      setMongoUser(userData);
      // Save Mongo User
      setMongoUser(userData);

      // Save in localStorage
      localStorage.setItem("mongoUserId", userData._id);
      localStorage.setItem("userId", userData._id); // keep for backward compatibility
      localStorage.setItem("role", userData.role);

      console.log("Mongo User Saved:", userData);
      console.log("mongoUserId:", localStorage.getItem("mongoUserId"));
    } catch (error) {
      console.log("Mongo User Error:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const idToken = await currentUser.getIdToken(true);

          setUser(currentUser);

          setToken(idToken);

          localStorage.setItem("token", idToken);

          await fetchMongoUser(idToken);
        } else {
          setUser(null);

          setToken(null);

          setMongoUser(null);

          localStorage.removeItem("token");
          localStorage.removeItem("mongoUserId");
          localStorage.removeItem("userId");

          localStorage.removeItem("role");
        }
      } catch (error) {
        console.error("Auth state error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);

    const idToken = await result.user.getIdToken();

    setUser(result.user);

    setToken(idToken);

    localStorage.setItem("token", idToken);

    await fetchMongoUser(idToken);

    return result.user;
  };

  const register = async (email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    return result.user;
  };

  const logout = async () => {
    await signOut(auth);

    setUser(null);

    setToken(null);

    setMongoUser(null);

    localStorage.removeItem("token");

    localStorage.removeItem("userId");

    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        mongoUser,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
