// Global Import
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ConfigProvider, theme as antdTheme } from "antd";

// Local Import
import Login from "@/pages/Login";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import { restoreAuthState } from "@/redux/slices/authSlice";
import { initializeAxiosInterceptors } from "@/services/axiosClient";
import SplashScreen from "../components/ui/SplashScreen";

function AppRoutes() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const initializing = useSelector((state) => state.auth.initializing);
  const themeMode = useSelector((state) => state.theme.mode);

  // Sync data-theme attribute with document element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  // On app load: wire up axios interceptors and restore auth state from localStorage.
  // We do NOT eagerly validate the access token here — if it's expired, the axios
  // interceptor will silently refresh it on the first API call using the refresh token.
  useEffect(() => {
    initializeAxiosInterceptors(dispatch);
    dispatch(restoreAuthState());
  }, [dispatch]);

  const routesNode = initializing ? (
    <SplashScreen tip="Initializing application..." />
  ) : (
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

  return (
    <ConfigProvider
      theme={{
        algorithm:
          themeMode === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: themeMode === "dark" ? "#14b8a6" : "#0d9488",
          borderRadius: 8,
        },
      }}
    >
      {routesNode}
    </ConfigProvider>
  );
}

export default AppRoutes;
