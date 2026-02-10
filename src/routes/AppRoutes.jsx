// Global Import
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Local Import
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import { restoreAuthState } from "@/redux/slices/authSlice";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import SplashScreen from "../components/UI/SplashScreen";

function AppRoutes() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const initializing = useSelector((state) => state.auth.initializing);

  // Restore auth state from localStorage on app load
  useEffect(() => {
    console.log("AppRoutes mounted - restoring auth state from localStorage");

    const timer = setTimeout(() => {
      dispatch(restoreAuthState());
    }, 1000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  // Show splash screen while initializing
  if (initializing) {
    return (
      <SplashScreen tip="Initializing application..." />
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route
        path="/rbs"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/rbs" : "/login"} replace />}
      />
    </Routes>
  );
}

export default AppRoutes;
