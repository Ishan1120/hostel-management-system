import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../services/api";

export default function Login({ setUser }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 🔹 Get requested role from URL query param (default: STUDENT)
  const loginRole = (searchParams.get("role") || "STUDENT").toUpperCase();

  const roleLabels = {
    STUDENT: "Student",
    WARDEN: "Warden",
    ADMIN: "Admin",
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);

    try {
      // 🔹 Decode JWT payload manually (NO jwt-decode library)
      const token = credentialResponse.credential;
      const base64Payload = token.split(".")[1];
      const decodedPayload = JSON.parse(
        atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"))
      );

      const payload = {
        name: decodedPayload.name || null,
        email: decodedPayload.email,
        picture: decodedPayload.picture || null,
        requestedRole: loginRole,
      };

      // 🔹 Send Google profile + requested role to backend
      const res = await api.post("/auth/google", payload);

      const user = res.data.user;
      if (!user) throw new Error("User data missing");

      // 🔹 Save user globally (App.js)
      setUser(user);

      // 🔹 Role-based redirect
      if (user.role === "STUDENT") {
        navigate("/student");
      } else if (user.role === "WARDEN") {
        navigate("/warden");
      } else if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/not-hosteller");
      }
    } catch (err) {
      console.error("GOOGLE LOGIN ERROR:", err);
      setError(err.response?.data?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-80 text-center">
        <h2 className="text-xl font-bold mb-1">
          {roleLabels[loginRole] || "Student"} Login
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Hostel Management System
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}


        {/* ================= GOOGLE LOGIN BUTTON ================= */}
        <div className="flex justify-center mb-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed")}
          />
        </div>

        <p className="text-xs text-gray-500">
          {loginRole === "STUDENT"
            ? "Login using your college email ID (@mitsgwl.ac.in)"
            : "Login using your authorized email"}
        </p>

        {loading && (
          <p className="text-sm text-blue-600 mt-2">
            Logging in...
          </p>
        )}
      </div>
    </div>
  );
}
