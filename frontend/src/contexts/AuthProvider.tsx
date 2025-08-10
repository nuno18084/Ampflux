import React, { useEffect, useState, createContext, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "../types";
import { apiClient } from "../lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    isCompany?: boolean,
    companyName?: string
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  const initializeAuth = useCallback(async () => {
    if (isInitialized) {
      console.log("Auth already initialized, skipping...");
      return;
    }

    console.log("Initializing auth...");
    setIsLoading(true);

    try {
      // Try to get current user - this will fail if not authenticated
      const currentUser = await apiClient.getCurrentUser();
      console.log("Current user fetched:", currentUser);
      setUser(currentUser);
    } catch (error) {
      console.log("No valid authentication found - user not logged in");
      setUser(null);
      // Don't redirect or clear anything - just set user to null
    } finally {
      console.log("Auth initialization complete");
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    // Only initialize once
    if (!isInitialized) {
      const timer = setTimeout(initializeAuth, 500); // Increased delay
      return () => clearTimeout(timer);
    }
  }, [initializeAuth, isInitialized]);

  const login = async (email: string, password: string) => {
    try {
      const currentUser = await apiClient.login({ email, password });
      setUser(currentUser);
      // Clear any existing cache when logging in as a new user
      queryClient.clear();
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    isCompany: boolean = false,
    companyName: string = ""
  ) => {
    try {
      // First register the user
      await apiClient.register({
        name,
        email,
        password,
        is_company: isCompany,
        company_name: companyName,
      });
      // Then automatically log in to get the tokens
      const currentUser = await apiClient.login({ email, password });
      setUser(currentUser);
      // Clear any existing cache when registering as a new user
      queryClient.clear();
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    console.log("Logging out...");
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      // Clear React Query cache to prevent data leakage between users
      queryClient.clear();
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
