import React from "react";
import { Link } from "react-router-dom";

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-3xl mx-auto text-center px-6 py-16">
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg mb-6">
          <svg
            className="h-10 w-10 text-white"
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
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
          AmpFlux
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Powerful circuit design and short-circuit simulation.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/login"
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ease-out shadow-md hover:shadow-lg border border-green-500/20"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl font-medium transition-all duration-300 ease-out border border-green-300 text-green-700 hover:text-green-800 hover:border-green-400 bg-white"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
