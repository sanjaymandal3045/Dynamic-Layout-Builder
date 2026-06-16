import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spin } from "antd";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const loading = useSelector((state) => state.auth.loading);

  // Optionally show loading state while checking auth
  if (loading) {
    return <Spin tip="Checking authentication..." style={{ display: "block", margin: "100px auto" }} />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("ProtectedRoute: User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // If authenticated, show the protected component
  return children;
};

export default ProtectedRoute;