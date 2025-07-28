import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeProvider";
import {
  UserIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ease-out ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
          : "bg-gradient-to-br from-green-50 via-white to-emerald-50"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div
          className={`transition-all duration-500 ease-out ${
            theme === "dark"
              ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-700/50"
              : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-green-200/50"
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1
                className={`text-3xl font-bold ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"
                    : "bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent"
                }`}
              >
                Profile Settings
              </h1>
              <p
                className={`mt-1 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Manage your account information and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div
          className={`transition-all duration-500 ease-out ${
            theme === "dark"
              ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-700/50"
              : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-green-200/50"
          }`}
        >
          <h2
            className={`text-xl font-bold mb-6 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Account Information
          </h2>

          <div className="space-y-6">
            {/* User Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className={`p-4 rounded-xl border transition-all duration-500 ease-out ${
                  theme === "dark"
                    ? "bg-gray-700/50 border-gray-600/50"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <UserIcon
                    className={`h-5 w-5 ${
                      theme === "dark" ? "text-green-400" : "text-green-600"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Full Name
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user?.name}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border transition-all duration-500 ease-out ${
                  theme === "dark"
                    ? "bg-gray-700/50 border-gray-600/50"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon
                    className={`h-5 w-5 ${
                      theme === "dark" ? "text-green-400" : "text-green-600"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Email Address
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {user?.company && (
                <div
                  className={`p-4 rounded-xl border transition-all duration-500 ease-out ${
                    theme === "dark"
                      ? "bg-gray-700/50 border-gray-600/50"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <BuildingOfficeIcon
                      className={`h-5 w-5 ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Company
                      </p>
                      <p
                        className={`text-lg font-semibold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {user.company.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div
                className={`p-4 rounded-xl border transition-all duration-500 ease-out ${
                  theme === "dark"
                    ? "bg-gray-700/50 border-gray-600/50"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CalendarIcon
                    className={`h-5 w-5 ${
                      theme === "dark" ? "text-green-400" : "text-green-600"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Account Status
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Active
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div
          className={`transition-all duration-500 ease-out ${
            theme === "dark"
              ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-700/50"
              : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-green-200/50"
          }`}
        >
          <h2
            className={`text-xl font-bold mb-6 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Preferences
          </h2>

          <div className="space-y-4">
            <div
              className={`p-4 rounded-xl border transition-all duration-500 ease-out ${
                theme === "dark"
                  ? "bg-gray-700/50 border-gray-600/50"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Theme
                  </p>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Choose your preferred appearance
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    theme === "dark"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-green-100 text-green-700 border border-green-200"
                  }`}
                >
                  {theme === "dark" ? "Dark Mode" : "Light Mode"}
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border transition-all duration-500 ease-out ${
                theme === "dark"
                  ? "bg-gray-700/50 border-gray-600/50"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Account Security
                  </p>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Manage your password and security settings
                  </p>
                </div>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out ${
                    theme === "dark"
                      ? "bg-gray-600/50 text-gray-300 hover:text-white border border-gray-500/50 hover:border-green-500/30"
                      : "bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-green-300"
                  }`}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
