import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeProvider";
import { LoadingAnimation } from "../components/LoadingAnimation";
import { apiClient } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { usePageLoading } from "../hooks/usePageLoading";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

export const RegisterPage: React.FC = () => {
  const { isPageLoading } = usePageLoading();
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isCompany,
    setIsCompany,
    companyName,
    setCompanyName,
    isLoading,
    error,
    setLoading,
    setFormError,
    resetForm,
  } = useRegisterForm();
  const { register } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create new company or individual account
      await register(name, email, password, isCompany, companyName);
      navigate("/");
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Registration failed");
    }
  };

  // Show loading animation while page is loading
  if (isPageLoading) {
    return (
      <div
        className={`min-h-screen flex items-start justify-center pt-40 transition-colors duration-200 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
            : "bg-gradient-to-br from-green-50 via-white to-emerald-50"
        }`}
      >
        <LoadingAnimation size="xl" showText={false} />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-start justify-center pt-20 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
          : "bg-gradient-to-br from-green-50 via-white to-emerald-50"
      }`}
    >
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg space-y-3 sm:space-y-4 lg:space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 sm:h-14 sm:w-14 lg:h-14 lg:w-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-3 sm:mb-4 lg:mb-4 shadow-lg">
            <svg
              className="h-6 w-6 sm:h-7 sm:w-7 lg:h-7 lg:w-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h2
            className={`text-xl sm:text-2xl lg:text-2xl font-bold mb-1 sm:mb-2 lg:mb-1 ${
              theme === "dark"
                ? "bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent"
            }`}
          >
            Join AmpFlux
          </h2>
          <p
            className={`text-sm sm:text-base lg:text-sm ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Create your account to get started
          </p>
        </div>

        {/* Loading Animation */}
        {isLoading && (
          <div className="fixed inset-0 flex items-start justify-center pt-32 z-50">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
            <div className="relative z-10">
              <LoadingAnimation size="xl" showText={false} />
            </div>
          </div>
        )}

        {/* Form */}
        {!isLoading && (
          <div
            className={`transition-all duration-200 rounded-lg sm:rounded-xl lg:rounded-xl shadow-lg sm:shadow-xl lg:shadow-xl p-4 sm:p-6 lg:p-6 border ${
              theme === "dark"
                ? "bg-gray-800/50 backdrop-blur-sm border-gray-700/50"
                : "bg-white/90 backdrop-blur-sm border-green-200/50"
            }`}
          >
            <form
              onSubmit={handleSubmit}
              className="space-y-3 sm:space-y-4 lg:space-y-4"
            >
              {error && (
                <div
                  className={`rounded-lg p-3 sm:p-4 lg:p-3 ${
                    theme === "dark"
                      ? "bg-red-900/50 border border-red-500/50"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <p
                    className={`text-xs sm:text-sm lg:text-xs ${
                      theme === "dark" ? "text-red-300" : "text-red-600"
                    }`}
                  >
                    {error}
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className={`block text-xs sm:text-sm lg:text-xs font-medium mb-1 sm:mb-2 lg:mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Full name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 lg:pl-3 flex items-center pointer-events-none">
                    <UserIcon
                      className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`block w-full pl-8 sm:pl-10 lg:pl-10 pr-3 py-2 sm:py-3 lg:py-2.5 text-sm rounded-lg transition-all duration-200 ${
                      theme === "dark"
                        ? "bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                        : "border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className={`block text-xs sm:text-sm lg:text-xs font-medium mb-1 sm:mb-2 lg:mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 lg:pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon
                      className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full pl-8 sm:pl-10 lg:pl-10 pr-3 py-2 sm:py-3 lg:py-2.5 text-sm rounded-lg transition-all duration-200 ${
                      theme === "dark"
                        ? "bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                        : "border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className={`block text-xs sm:text-sm lg:text-xs font-medium mb-1 sm:mb-2 lg:mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 lg:pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon
                      className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full pl-8 sm:pl-10 lg:pl-10 pr-8 sm:pr-10 lg:pr-10 py-2 sm:py-3 lg:py-2.5 text-sm rounded-lg transition-all duration-200 ${
                      theme === "dark"
                        ? "bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                        : "border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    }`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-2 sm:pr-3 lg:pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon
                        className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                    ) : (
                      <EyeIcon
                        className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* Company Registration Section */}
              <div className="space-y-2 sm:space-y-3 lg:space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isCompany"
                    checked={isCompany}
                    onChange={(e) => setIsCompany(e.target.checked)}
                    className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-3 lg:w-3 rounded border-gray-300 text-green-600 focus:ring-green-500 ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600"
                        : "bg-white border-gray-300"
                    }`}
                  />
                  <label
                    htmlFor="isCompany"
                    className={`ml-2 block text-xs sm:text-sm lg:text-xs font-medium ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Register as a company
                  </label>
                </div>

                {isCompany && (
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="companyName"
                        className={`block text-xs sm:text-sm lg:text-xs font-medium mb-1 sm:mb-2 lg:mb-1 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Company name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 lg:pl-3 flex items-center pointer-events-none">
                          <BuildingOfficeIcon
                            className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4 ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          />
                        </div>
                        <input
                          id="companyName"
                          name="companyName"
                          type="text"
                          autoComplete="organization"
                          required={isCompany}
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className={`block w-full pl-8 sm:pl-10 lg:pl-10 pr-3 py-2 sm:py-3 lg:py-2.5 text-sm rounded-lg transition-all duration-200 ${
                            theme === "dark"
                              ? "bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                              : "border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          }`}
                          placeholder="Enter your company name"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 sm:py-3 lg:py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl border border-green-500/20"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-2 sm:pl-3 lg:pl-3">
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4 text-green-300 group-hover:text-green-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </span>
                Create account
              </button>
            </form>
            <div className="mt-3 sm:mt-4 lg:mt-3 text-center">
              <p
                className={`text-xs sm:text-sm lg:text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  className={`font-medium hover:underline ${
                    theme === "dark"
                      ? "text-green-400 hover:text-green-300"
                      : "text-green-600 hover:text-green-700"
                  }`}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
