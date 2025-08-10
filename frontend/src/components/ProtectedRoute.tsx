import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoadingAnimation } from "./LoadingAnimation";
import { useTheme } from "../contexts/ThemeProvider";
import { createPortal } from "react-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return createPortal(
      <div
        className={`fixed inset-0 flex items-center justify-center z-[99999] transition-colors duration-200 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
            : "bg-gradient-to-br from-green-50 via-white to-emerald-50"
        }`}
      >
        <LoadingAnimation size="xl" showText={false} />
      </div>,
      document.body
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
