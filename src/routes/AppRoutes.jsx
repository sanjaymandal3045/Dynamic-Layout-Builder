// Global Import
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Local Import
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import { restoreAuthState, logoutUser } from "@/redux/slices/authSlice";
import { initializeAxiosInterceptors, isTokenValid } from "@/utilities/axiosApiCall";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import SplashScreen from "../components/UI/SplashScreen";

function AppRoutes() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const initializing = useSelector((state) => state.auth.initializing);

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
