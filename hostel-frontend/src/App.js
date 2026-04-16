import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Gallery from "./pages/Gallery";
import StudentDashboard from "./pages/StudentDashboard";
import WardenDashboard from "./pages/WardenDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotHosteller from "./pages/NotHosteller";

function App() {
  const [user, setUser] = useState(null);

  return (
    <Routes>
      {/* ================= HOME (LANDING) ================= */}
      <Route path="/" element={<Home />} />

      {/* ================= LOGIN ================= */}
      <Route path="/login" element={<Login setUser={setUser} />} />

      {/* ================= GALLERY ================= */}
      <Route path="/gallery" element={<Gallery />} />

      {/* ================= STUDENT ================= */}
      <Route
        path="/student"
        element={
          user?.role === "STUDENT" ? (
            <StudentDashboard user={user} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* ================= WARDEN ================= */}
      <Route
        path="/warden"
        element={
          user?.role === "WARDEN" ? (
            <WardenDashboard user={user} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* ================= ADMIN ================= */}
      <Route
        path="/admin"
        element={
          user?.role === "ADMIN" ? (
            <AdminDashboard user={user} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* ================= NOT HOSTELLER ================= */}
      <Route path="/not-hosteller" element={<NotHosteller />} />

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
