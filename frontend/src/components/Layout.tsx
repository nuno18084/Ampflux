import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeProvider";
import {
  HomeIcon,
  FolderIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  BoltIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Projects", href: "/projects", icon: FolderIcon },
  ];

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get button position for portal positioning
  const getDropdownPosition = () => {
    if (!buttonRef.current) return { top: 0, right: 0 };
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + window.scrollY + 8,
      right: window.innerWidth - rect.right,
    };
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ease-out ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
          : "bg-gradient-to-br from-green-50 via-white to-emerald-50"
      }`}
    >
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 transition-all duration-500 ease-out z-[9999] ${
          theme === "dark"
            ? "bg-gray-800/80 backdrop-blur-md shadow-2xl border-b border-gray-700/50"
            : "bg-white/95 backdrop-blur-md shadow-xl border-b border-green-200/50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                to="/dashboard"
                className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity duration-300 ease-out"
              >
                <div
                  className={`p-2 rounded-lg transition-all duration-500 ease-out ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600"
                      : "bg-gradient-to-r from-green-500 to-emerald-600"
                  }`}
                >
                  <BoltIcon className="h-6 w-6 text-white" />
                </div>
                <span
                  className={`ml-3 text-xl font-bold transition-all duration-500 ease-out ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent"
                  }`}
                >
                  AmpFlux
                </span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-500 ease-out relative ${
                        isActive
                          ? theme === "dark"
                            ? "text-green-400"
                            : "text-green-700"
                          : theme === "dark"
                          ? "text-gray-300 hover:text-green-400"
                          : "text-gray-600 hover:text-green-600"
                      }`}
                    >
                      <item.icon className="h-5 w-5 mr-2" />
                      {item.name}
                      {/* Active indicator line */}
                      <div
                        className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ease-out ${
                          isActive
                            ? "w-full bg-green-500"
                            : "w-0 bg-transparent"
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="flex items-center">
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-500 ease-out ${
                    theme === "dark"
                      ? "text-gray-300 hover:text-white hover:bg-gray-700/50"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <UserCircleIcon className="h-8 w-8" />
                    <span className="text-sm font-medium">{user?.name}</span>
                  </div>
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform duration-300 ease-out ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu - Rendered as Portal */}
                {isDropdownOpen &&
                  createPortal(
                    <div
                      ref={dropdownRef}
                      className={`fixed w-64 rounded-xl shadow-2xl border transition-all duration-300 ease-out z-[99999] ${
                        theme === "dark"
                          ? "bg-gray-800/95 backdrop-blur-sm border-gray-700/50"
                          : "bg-white/95 backdrop-blur-sm border-gray-200"
                      }`}
                      style={{
                        top: getDropdownPosition().top,
                        right: getDropdownPosition().right,
                      }}
                    >
                      <div className="py-2">
                        {/* User Info Section */}
                        <div
                          className={`px-4 py-3 border-b ${
                            theme === "dark"
                              ? "border-gray-700/50"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <UserCircleIcon className="h-10 w-10 text-gray-400" />
                            <div>
                              <p
                                className={`text-sm font-medium ${
                                  theme === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {user?.name}
                              </p>
                              {user?.company && (
                                <p
                                  className={`text-xs ${
                                    theme === "dark"
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {user.company.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          {/* Profile Page */}
                          <Link
                            to="/profile"
                            className={`flex items-center px-4 py-2 text-sm transition-all duration-300 ease-out ${
                              theme === "dark"
                                ? "text-gray-300 hover:text-white hover:bg-gray-700/50"
                                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <UserIcon className="h-4 w-4 mr-3" />
                            Profile Settings
                          </Link>

                          {/* Theme Toggle */}
                          <button
                            onClick={() => {
                              toggleTheme();
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center px-4 py-2 text-sm transition-all duration-300 ease-out ${
                              theme === "dark"
                                ? "text-gray-300 hover:text-white hover:bg-gray-700/50"
                                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                          >
                            {theme === "dark" ? (
                              <SunIcon className="h-4 w-4 mr-3" />
                            ) : (
                              <MoonIcon className="h-4 w-4 mr-3" />
                            )}
                            {theme === "dark" ? "Light Mode" : "Dark Mode"}
                          </button>

                          {/* Logout */}
                          <button
                            onClick={handleLogout}
                            className={`w-full flex items-center px-4 py-2 text-sm transition-all duration-300 ease-out ${
                              theme === "dark"
                                ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                : "text-red-600 hover:text-red-700 hover:bg-red-50"
                            }`}
                          >
                            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>,
                    document.body
                  )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        {children}
      </main>
    </div>
  );
};
