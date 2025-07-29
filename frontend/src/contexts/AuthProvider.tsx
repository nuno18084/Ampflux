import React, { useEffect, useState, createContext } from "react";
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
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("Initializing auth...");
      if (apiClient.isAuthenticated()) {
        console.log("User has tokens, fetching current user...");
        try {
          const currentUser = await apiClient.getCurrentUser();
          console.log("Current user fetched:", currentUser);
          setUser(currentUser);
        } catch (error) {
          console.error("Failed to get current user:", error);
          // Clear invalid tokens
          apiClient.logout();
          // Clear React Query cache to prevent data leakage
          queryClient.clear();
        }
      } else {
        console.log("No tokens found");
      }
      setIsLoading(false);
    };

    // Add a small delay to ensure the app is fully loaded
    const timer = setTimeout(initializeAuth, 100);
    return () => clearTimeout(timer);
  }, [queryClient]);

  const login = async (email: string, password: string) => {
    try {
      const token = await apiClient.login({ email, password });
      apiClient.setTokens(token);
      const currentUser = await apiClient.getCurrentUser();
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
      const token = await apiClient.login({ email, password });
      apiClient.setTokens(token);
      const currentUser = await apiClient.getCurrentUser();
      setUser(currentUser);
      // Clear any existing cache when registering as a new user
      queryClient.clear();
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("Logging out...");
    apiClient.logout();
    setUser(null);
    // Clear React Query cache to prevent data leakage between users
    queryClient.clear();
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
