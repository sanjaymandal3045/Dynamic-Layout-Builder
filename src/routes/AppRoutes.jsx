// Global Import
import React from "react";
import { Routes, Route } from "react-router-dom";

// Local Import
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "../pages/Dashboard";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Login />} />

      {/* Protected route */}
      <Route
        path="/rbs"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Optional fallback */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
