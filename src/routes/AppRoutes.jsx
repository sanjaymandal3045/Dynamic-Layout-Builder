// Global Import
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ConfigProvider, theme as antdTheme } from "antd";

// Local Import
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import { restoreAuthState, logoutUser } from "@/redux/slices/authSlice";
import { initializeAxiosInterceptors, isTokenValid } from "@/utilities/axiosApiCall";
import SplashScreen from "../components/UI/SplashScreen";

function AppRoutes() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const initializing = useSelector((state) => state.auth.initializing);
  const themeMode = useSelector((state) => state.theme.mode);

  // Sync data-theme attribute with document element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  // Restore auth state from localStorage on app load
  useEffect(() => {
    console.log("AppRoutes mounted - initializing authentication");

    // Initialize axios interceptors with Redux dispatch
    // This ensures that 401 errors will properly dispatch logoutUser action
    initializeAxiosInterceptors(dispatch);

    const timer = setTimeout(() => {
      // First, restore auth state from localStorage
      dispatch(restoreAuthState());

      // Then validate the token
      const hasValidToken = isTokenValid();
      console.log("Token validation on app startup:", {
        hasToken: !!localStorage.getItem("accessToken"),
        isValid: hasValidToken,
      });

      // If localStorage has auth data but token is invalid, logout
      if (localStorage.getItem("accessToken") && !hasValidToken) {
        console.log("Token found but invalid - logging out");
        dispatch(logoutUser());
      }
    }, 100);

    return () => clearTimeout(timer);
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
          colorPrimary: "#0d9488",
          borderRadius: 8,
        },
      }}
    >
      {routesNode}
    </ConfigProvider>
  );
}

export default AppRoutes;
