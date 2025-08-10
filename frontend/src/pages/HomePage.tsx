import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeProvider";
import {
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  PlayCircleIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

export const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const formRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const scrollToForm = () => {
    if (formRef.current) {
      const navbarHeight = 80; // Approximate navbar height
      const elementTop = formRef.current.offsetTop - navbarHeight;
      window.scrollTo({
        top: elementTop,
        behavior: "smooth",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-colors duration-500 ease-out ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
          : "bg-gradient-to-br from-green-50 via-white to-emerald-50"
      }`}
    >
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/25 backdrop-blur-md border-b border-green-200/20 dark:bg-gray-900/25 dark:border-gray-800/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <BoltIcon className="h-5 w-5 text-white" />
            </div>
            <span
              className={`text-xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              AmpFlux
            </span>
          </div>

          {/* Sign In Button */}
          <Link
            to="/login"
            className={`px-6 py-2 rounded-xl font-medium text-sm transition-all duration-300 ease-out ${
              theme === "dark"
                ? "text-gray-200 hover:text-green-400"
                : "text-gray-700 hover:text-green-600"
            }`}
          >
            Sign in
          </Link>
        </div>
      </nav>
      {/* Decorative background accents */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 ${
          theme === "dark" ? "bg-green-500" : "bg-green-300"
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 ${
          theme === "dark" ? "bg-green-500" : "bg-green-300"
        }`}
      />
      {/* Hero / Introduction */}
      <header className="relative">
        <div className="max-w-7xl mx-auto px-6 pt-52 pb-16 md:pt-[12.5rem] md:pb-24 min-h-screen flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="text-left">
              <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-2xl mb-6 ring-1 ring-white/10">
                <BoltIcon className="h-12 w-12 text-white drop-shadow" />
              </div>
              <h1
                className={`text-4xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent leading-tight ${
                  theme === "dark"
                    ? "from-green-400 to-emerald-500"
                    : "from-green-600 to-emerald-700"
                }`}
              >
                AmpFlux
              </h1>
              <p
                className={`mt-6 text-lg md:text-xl lg:text-2xl max-w-2xl ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                The modern platform for circuit design, collaboration, and
                short-circuit simulation — fast, intuitive, and built for teams.
              </p>
              <div className="mt-10 flex items-center gap-6">
                <Link
                  to="/register"
                  className="relative overflow-hidden bg-gradient-to-r from-green-400 via-emerald-500 via-green-500 to-emerald-600 text-white px-10 py-4 rounded-xl font-medium transition-all duration-500 ease-out shadow-md hover:shadow-lg border border-green-500/30 text-lg animate-gradient-x min-w-[180px] hover:brightness-110"
                >
                  <span className="relative z-10">Get Started</span>
                </Link>
                <button
                  onClick={scrollToForm}
                  className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 ease-out border text-lg ${
                    theme === "dark"
                      ? "border-gray-700 text-gray-200 hover:text-white hover:border-gray-600 bg-gray-800/60 backdrop-blur"
                      : "border-green-300 text-green-700 hover:text-green-800 hover:border-green-400 bg-white"
                  }`}
                >
                  Ask for a Demo
                </button>
              </div>
            </div>

            {/* Right side - Modern Circuit Design Interface */}
            <div className="flex items-center justify-center">
              <div
                className={`relative w-full max-w-lg aspect-[4/3] rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm animate-gradient-x perspective-1000 transition-all duration-1000 ease-out hover:scale-105 hover:shadow-3xl ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 border border-gray-700/40"
                    : "bg-gradient-to-br from-white/90 via-gray-50/80 to-white/90 border border-green-200/30"
                }`}
                style={{
                  transform: "rotateY(5deg) rotateX(-2deg) rotateZ(-2deg)",
                  transformStyle: "preserve-3d",
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;

                  const rotateX = ((y - centerY) / centerY) * -3;
                  const rotateY = ((x - centerX) / centerX) * 3;

                  e.currentTarget.style.transform = `rotateY(${
                    5 + rotateY
                  }deg) rotateX(${-2 + rotateX}deg) rotateZ(-2deg) scale(1.02)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "rotateY(5deg) rotateX(-2deg) rotateZ(-2deg) scale(1)";
                }}
              >
                {/* Animated Background Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${
                    theme === "dark"
                      ? "from-emerald-500/5 via-transparent to-green-500/5"
                      : "from-green-400/10 via-transparent to-emerald-400/10"
                  } animate-pulse`}
                ></div>

                {/* Modern Grid Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="grid grid-cols-12 grid-rows-8 h-full">
                    {Array.from({ length: 96 }).map((_, i) => (
                      <div
                        key={i}
                        className={`border-r border-b ${
                          theme === "dark"
                            ? "border-emerald-400/20"
                            : "border-green-400/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Circuit Components */}
                <div className="absolute inset-0 p-8">
                  {/* Main Circuit Path with Glow */}
                  <div className="relative">
                    <div
                      className={`absolute h-1.5 rounded-full shadow-lg ${
                        theme === "dark"
                          ? "bg-gradient-to-r from-emerald-400 to-green-400 shadow-emerald-400/50"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/30"
                      }`}
                      style={{ top: "35%", left: "8%", width: "84%" }}
                    ></div>
                  </div>

                  {/* Animated Circuit Nodes */}
                  <div
                    className={`absolute w-4 h-4 rounded-full shadow-lg animate-pulse ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-emerald-400 to-green-400 shadow-emerald-400/50"
                        : "bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/30"
                    }`}
                    style={{ top: "33%", left: "20%" }}
                  ></div>
                  <div
                    className={`absolute w-4 h-4 rounded-full shadow-lg animate-pulse delay-300 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-emerald-400 to-green-400 shadow-emerald-400/50"
                        : "bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/30"
                    }`}
                    style={{ top: "33%", left: "50%" }}
                  ></div>
                  <div
                    className={`absolute w-4 h-4 rounded-full shadow-lg animate-pulse delay-700 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-emerald-400 to-green-400 shadow-emerald-400/50"
                        : "bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/30"
                    }`}
                    style={{ top: "33%", left: "80%" }}
                  ></div>

                  {/* Modern Component Cards */}
                  <div
                    className={`absolute w-20 h-10 rounded-xl border backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105 ${
                      theme === "dark"
                        ? "bg-gray-800/60 border-emerald-400/40 shadow-emerald-400/20"
                        : "bg-white/80 border-green-500/40 shadow-green-500/20"
                    }`}
                    style={{ top: "50%", left: "12%" }}
                  >
                    <div
                      className={`text-xs font-mono text-center mt-2 font-semibold ${
                        theme === "dark" ? "text-emerald-300" : "text-green-700"
                      }`}
                    >
                      R1
                    </div>
                  </div>

                  <div
                    className={`absolute w-20 h-10 rounded-xl border backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105 ${
                      theme === "dark"
                        ? "bg-gray-800/60 border-emerald-400/40 shadow-emerald-400/20"
                        : "bg-white/80 border-green-500/40 shadow-green-500/20"
                    }`}
                    style={{ top: "50%", left: "42%" }}
                  >
                    <div
                      className={`text-xs font-mono text-center mt-2 font-semibold ${
                        theme === "dark" ? "text-emerald-300" : "text-green-700"
                      }`}
                    >
                      C1
                    </div>
                  </div>

                  <div
                    className={`absolute w-20 h-10 rounded-xl border backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105 ${
                      theme === "dark"
                        ? "bg-gray-800/60 border-emerald-400/40 shadow-emerald-400/20"
                        : "bg-white/80 border-green-500/40 shadow-green-500/20"
                    }`}
                    style={{ top: "50%", left: "72%" }}
                  >
                    <div
                      className={`text-xs font-mono text-center mt-2 font-semibold ${
                        theme === "dark" ? "text-emerald-300" : "text-green-700"
                      }`}
                    >
                      L1
                    </div>
                  </div>

                  {/* Connection Lines with Glow */}
                  <div
                    className={`absolute h-10 w-1 rounded-full shadow-lg ${
                      theme === "dark"
                        ? "bg-gradient-to-b from-emerald-400/80 to-transparent shadow-emerald-400/30"
                        : "bg-gradient-to-b from-green-500/80 to-transparent shadow-green-500/20"
                    }`}
                    style={{ top: "37%", left: "24%" }}
                  ></div>
                  <div
                    className={`absolute h-10 w-1 rounded-full shadow-lg ${
                      theme === "dark"
                        ? "bg-gradient-to-b from-emerald-400/80 to-transparent shadow-emerald-400/30"
                        : "bg-gradient-to-b from-green-500/80 to-transparent shadow-green-500/20"
                    }`}
                    style={{ top: "37%", left: "54%" }}
                  ></div>
                  <div
                    className={`absolute h-10 w-1 rounded-full shadow-lg ${
                      theme === "dark"
                        ? "bg-gradient-to-b from-emerald-400/80 to-transparent shadow-emerald-400/30"
                        : "bg-gradient-to-b from-green-500/80 to-transparent shadow-green-500/20"
                    }`}
                    style={{ top: "37%", left: "84%" }}
                  ></div>

                  {/* Modern Voltage Indicators */}
                  <div
                    className={`absolute text-xs font-mono font-semibold px-2 py-1 rounded-lg backdrop-blur-sm ${
                      theme === "dark"
                        ? "text-emerald-300 bg-gray-800/40 border border-emerald-400/20"
                        : "text-green-700 bg-white/60 border border-green-500/20"
                    }`}
                    style={{ top: "12%", left: "22%" }}
                  >
                    5V
                  </div>
                  <div
                    className={`absolute text-xs font-mono font-semibold px-2 py-1 rounded-lg backdrop-blur-sm ${
                      theme === "dark"
                        ? "text-emerald-300 bg-gray-800/40 border border-emerald-400/20"
                        : "text-green-700 bg-white/60 border border-green-500/20"
                    }`}
                    style={{ top: "12%", left: "52%" }}
                  >
                    3.3V
                  </div>
                  <div
                    className={`absolute text-xs font-mono font-semibold px-2 py-1 rounded-lg backdrop-blur-sm ${
                      theme === "dark"
                        ? "text-emerald-300 bg-gray-800/40 border border-emerald-400/20"
                        : "text-green-700 bg-white/60 border border-green-500/20"
                    }`}
                    style={{ top: "12%", left: "82%" }}
                  >
                    GND
                  </div>
                </div>

                {/* Modern Overlay Text */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div
                    className={`p-4 rounded-2xl backdrop-blur-sm ${
                      theme === "dark"
                        ? "bg-gray-800/40 border border-gray-700/40"
                        : "bg-white/60 border border-green-200/30"
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        theme === "dark" ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      Circuit Design Interface
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Real-time simulation & analysis
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* App Screenshots */}
      <section className="py-32 md:py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className={`text-3xl md:text-4xl font-bold ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}
            >
              Professional Circuit Design
            </h2>
            <p
              className={`text-lg mt-4 max-w-2xl mx-auto ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Advanced tools for engineers and design teams
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {[
              {
                title: "Circuit Editor Interface",
                desc: "Professional-grade design environment with intuitive controls and real-time feedback",
                features: [
                  "Drag & Drop Components",
                  "Real-time Validation",
                  "Advanced Grid System",
                ],
              },
              {
                title: "Simulation Dashboard",
                desc: "Comprehensive analysis tools with detailed reporting and export capabilities",
                features: [
                  "Performance Metrics",
                  "Error Detection",
                  "Export Reports",
                ],
              },
            ].map((item, n) => (
              <div
                key={n}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-gray-800/50 border border-gray-700/50"
                    : "bg-white border border-gray-200"
                }`}
              >
                {/* Screenshot Placeholder */}
                <div
                  className={`aspect-[16/10] ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-gray-700 to-gray-800"
                      : "bg-gradient-to-br from-gray-100 to-gray-50"
                  } flex items-center justify-center relative overflow-hidden`}
                >
                  {n === 0 ? (
                    /* Simple Circuit Editor Mockup */
                    <div className="absolute inset-2 rounded-lg bg-gray-900 border border-gray-700">
                      {/* Simple Header */}
                      <div className="absolute top-0 left-0 right-0 h-8 bg-gray-800 border-b border-gray-700 flex items-center px-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                            <BoltIcon className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-white text-xs font-medium">
                            AmpFlux
                          </span>
                        </div>
                        <div className="ml-auto flex space-x-2">
                          <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                            Save
                          </button>
                          <button className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                            Simulate
                          </button>
                        </div>
                      </div>

                      {/* Simple Layout */}
                      <div className="absolute top-8 left-0 w-32 h-full bg-gray-800 border-r border-gray-700 p-2">
                        <div className="text-white text-xs font-medium mb-2">
                          Components
                        </div>
                        <div className="space-y-1">
                          {["Battery", "Resistor", "Capacitor"].map(
                            (comp, i) => (
                              <div
                                key={i}
                                className="p-2 bg-gray-700 rounded text-center"
                              >
                                <div className="text-xs text-gray-300">
                                  {comp}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Simple Canvas */}
                      <div className="absolute top-8 left-32 right-24 bottom-0 bg-blue-900/30 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-12 bg-gray-700 rounded mb-2 flex items-center justify-center">
                            <span className="text-white text-xs">Power</span>
                          </div>
                          <div className="w-16 h-12 bg-gray-700 rounded mb-2 flex items-center justify-center">
                            <span className="text-white text-xs">Ground</span>
                          </div>
                          <div className="w-16 h-12 bg-gray-700 rounded flex items-center justify-center">
                            <span className="text-white text-xs">Resistor</span>
                          </div>
                        </div>
                      </div>

                      {/* Simple Properties */}
                      <div className="absolute top-8 right-0 w-24 h-full bg-gray-800 border-l border-gray-700 p-2">
                        <div className="text-white text-xs font-medium mb-2">
                          Properties
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs text-gray-400 mb-1">
                              Name
                            </div>
                            <div className="w-full px-2 py-1 text-xs bg-gray-700 text-white rounded">
                              Power Supply
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 mb-1">
                              Voltage
                            </div>
                            <div className="w-full px-2 py-1 text-xs bg-gray-700 text-white rounded">
                              12V
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Simulation Dashboard Interface */
                    <div className="absolute inset-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                      {/* Header */}
                      <div className="absolute top-2 left-2 right-2 h-8 bg-white/20 rounded flex items-center px-3">
                        <div className="text-xs text-white/70 font-medium">
                          Simulation Dashboard
                        </div>
                      </div>

                      {/* Charts and Metrics */}
                      <div className="absolute top-12 left-2 right-2 bottom-2 grid grid-cols-2 gap-2">
                        {/* Chart 1 */}
                        <div className="bg-white/10 rounded p-2">
                          <div className="text-xs text-white/60 mb-2">
                            Performance
                          </div>
                          <div className="h-12 bg-gradient-to-r from-green-400/40 to-blue-400/40 rounded"></div>
                        </div>

                        {/* Chart 2 */}
                        <div className="bg-white/10 rounded p-2">
                          <div className="text-xs text-white/60 mb-2">
                            Errors
                          </div>
                          <div className="h-12 bg-gradient-to-r from-red-400/40 to-orange-400/40 rounded"></div>
                        </div>

                        {/* Metrics */}
                        <div className="bg-white/10 rounded p-2">
                          <div className="text-xs text-white/60 mb-1">
                            Voltage
                          </div>
                          <div className="text-lg text-white font-bold">
                            12.5V
                          </div>
                        </div>

                        <div className="bg-white/10 rounded p-2">
                          <div className="text-xs text-white/60 mb-1">
                            Current
                          </div>
                          <div className="text-lg text-white font-bold">
                            2.3A
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3
                    className={`text-xl font-semibold mb-3 ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-sm mb-4 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {item.desc}
                  </p>
                  <div className="space-y-2">
                    {item.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center">
                        <div
                          className={`w-1.5 h-1.5 rounded-full mr-3 ${
                            theme === "dark" ? "bg-emerald-400" : "bg-green-500"
                          }`}
                        ></div>
                        <span
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Demos */}
      <section className="py-32 md:py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className={`text-3xl md:text-4xl font-bold ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}
            >
              Product Demonstrations
            </h2>
            <p
              className={`text-lg mt-4 max-w-2xl mx-auto ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              See AmpFlux in action with detailed walkthroughs
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {[
              {
                title: "Circuit Design Workflow",
                desc: "Complete walkthrough of the design process from concept to simulation",
                duration: "3:45",
                category: "Tutorial",
              },
              {
                title: "Advanced Simulation Features",
                desc: "Deep dive into analysis tools and reporting capabilities",
                duration: "4:12",
                category: "Feature Demo",
              },
            ].map((video, idx) => (
              <div
                key={idx}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-gray-800/50 border border-gray-700/50"
                    : "bg-white border border-gray-200"
                }`}
              >
                {/* Video Thumbnail */}
                <div
                  className={`aspect-video ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-gray-700 to-gray-800"
                      : "bg-gradient-to-br from-gray-100 to-gray-50"
                  } flex items-center justify-center relative overflow-hidden`}
                >
                  {/* Video Preview */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>

                  {/* Mock Video Frame */}
                  <div className="absolute inset-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                    {/* Video Content */}
                    <div className="absolute inset-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded flex items-center justify-center">
                      <div className="text-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                            theme === "dark"
                              ? "bg-white/20 text-white"
                              : "bg-black/20 text-black"
                          }`}
                        >
                          <PlayCircleIcon className="h-6 w-6" />
                        </div>
                        <p
                          className={`text-xs ${
                            theme === "dark" ? "text-white/70" : "text-black/70"
                          }`}
                        >
                          {video.title}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div
                    className={`absolute top-4 right-4 px-2 py-1 rounded text-xs font-medium ${
                      theme === "dark"
                        ? "bg-black/60 text-gray-300"
                        : "bg-white/80 text-gray-700"
                    }`}
                  >
                    {video.duration}
                  </div>

                  {/* Category Badge */}
                  <div
                    className={`absolute top-4 left-4 px-2 py-1 rounded text-xs font-medium ${
                      theme === "dark"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-green-100 text-green-700 border border-green-200"
                    }`}
                  >
                    {video.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3
                    className={`text-xl font-semibold mb-3 ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {video.title}
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {video.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 md:py-40">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className={`text-2xl md:text-3xl font-bold text-center ${
              theme === "dark" ? "text-green-400" : "text-green-600"
            }`}
          >
            Pricing
          </h2>
          <p
            className={`text-center mt-2 mb-8 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Simple plans for individuals and teams
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: "$0",
                period: "/mo",
                cta: "Get Started",
                features: ["1 project", "Basic editor", "Community support"],
                highlight: false,
              },
              {
                name: "Pro",
                price: "$19",
                period: "/mo",
                cta: "Start Pro",
                features: [
                  "Unlimited projects",
                  "Simulation engine",
                  "Priority support",
                ],
                highlight: true,
              },
              {
                name: "Team",
                price: "$49",
                period: "/mo",
                cta: "Start Team",
                features: [
                  "Team collaboration",
                  "Role-based access",
                  "Project sharing",
                ],
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 shadow-xl backdrop-blur ${
                  theme === "dark"
                    ? "border border-gray-700/60 bg-gray-800/60"
                    : "border border-green-200/60 bg-white/80"
                } ${plan.highlight ? "ring-2 ring-emerald-500/50" : ""}`}
              >
                <h3
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-end gap-1">
                  <span
                    className={`text-3xl font-extrabold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-center ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <CheckCircleIcon
                        className={`h-5 w-5 mr-2 ${
                          theme === "dark"
                            ? "text-emerald-400"
                            : "text-green-600"
                        }`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={scrollToForm}
                  className={`mt-6 w-full px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-out ${
                    plan.highlight
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg"
                      : theme === "dark"
                      ? "border border-gray-700 text-gray-200 hover:text-white hover:border-gray-600 bg-gray-800/60"
                      : "border border-green-300 text-green-700 hover:text-green-800 hover:border-green-400 bg-white"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-32 md:py-40">
        <div className="max-w-4xl mx-auto px-6">
          <h2
            className={`text-2xl md:text-3xl font-bold text-center ${
              theme === "dark" ? "text-green-400" : "text-green-600"
            }`}
          >
            FAQs
          </h2>
          <div className="mt-8 space-y-3">
            {[
              {
                q: "What is AmpFlux?",
                a: "AmpFlux is a platform for circuit design and short-circuit simulation, built for teams and professionals.",
              },
              {
                q: "Can I collaborate with my team?",
                a: "Yes. AmpFlux supports project sharing and role-based access for smooth collaboration.",
              },
              {
                q: "Do I need to install anything?",
                a: "No, AmpFlux runs in the browser. For advanced simulations you can use our cloud backend.",
              },
            ].map((item, idx) => (
              <details
                key={idx}
                className={`group rounded-2xl p-4 open:shadow-lg transition-all ${
                  theme === "dark"
                    ? "border border-gray-700/60 bg-gray-800/60 backdrop-blur"
                    : "border border-green-200/60 bg-white"
                }`}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between">
                  <span
                    className={`font-medium flex items-center ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <QuestionMarkCircleIcon
                      className={`h-5 w-5 mr-2 ${
                        theme === "dark" ? "text-emerald-400" : "text-green-600"
                      }`}
                    />
                    {item.q}
                  </span>
                  <span
                    className={`ml-4 group-open:rotate-180 transition-transform ${
                      theme === "dark" ? "text-emerald-400" : "text-green-600"
                    }`}
                  >
                    ⌄
                  </span>
                </summary>
                <p
                  className={`mt-3 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Ask Questions / Demo Form */}
      <section ref={formRef} className="pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="max-w-3xl mx-auto px-6">
          <h2
            className={`text-2xl md:text-3xl font-bold text-center ${
              theme === "dark" ? "text-green-400" : "text-green-600"
            }`}
          >
            Ask a Question / Request a Demo
          </h2>
          <p
            className={`text-center mt-2 mb-8 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            We’ll get back to you shortly
          </p>
          <form
            onSubmit={handleSubmit}
            className={`rounded-2xl p-6 shadow-xl backdrop-blur ${
              theme === "dark"
                ? "border border-gray-700/60 bg-gray-800/60"
                : "border border-green-200/60 bg-white/80"
            }`}
          >
            {submitted && (
              <div
                className={`mb-4 rounded-lg border p-3 ${
                  theme === "dark"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-green-300 bg-green-50 text-green-700"
                }`}
              >
                Thanks! We received your message.
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your name"
                  className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    theme === "dark"
                      ? "bg-gray-800/60 border border-gray-700 text-white placeholder-gray-400"
                      : "border border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    theme === "dark"
                      ? "bg-gray-800/60 border border-gray-700 text-white placeholder-gray-400"
                      : "border border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>
            <div className="mt-4">
              <label
                className={`block text-sm font-medium mb-1 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                placeholder="Tell us what you need or request a demo time"
                className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  theme === "dark"
                    ? "bg-gray-800/60 border border-gray-700 text-white placeholder-gray-400"
                    : "border border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ease-out shadow-md hover:shadow-xl border border-green-500/30"
              >
                Send Message
              </button>
              <a
                href="mailto:contact@ampflux.example"
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ease-out border ${
                  theme === "dark"
                    ? "border-gray-700 text-gray-200 hover:text-white hover:border-gray-600 bg-gray-800/60"
                    : "border border-green-300 text-green-700 hover:text-green-800 hover:border-green-400 bg-white"
                }`}
              >
                Email Us
              </a>
            </div>
          </form>
        </div>
      </section>

      {/* Policies */}
      <footer className="py-10 relative">
        <div
          className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${
            theme === "dark"
              ? "from-gray-800 via-gray-700 to-transparent"
              : "from-green-200/60 via-green-200/40 to-transparent"
          }`}
        ></div>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            © {new Date().getFullYear()} AmpFlux. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link
              to="#"
              className={`${
                theme === "dark"
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-700 hover:text-green-700"
              }`}
            >
              Privacy Policy
            </Link>
            <Link
              to="#"
              className={`${
                theme === "dark"
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-700 hover:text-green-700"
              }`}
            >
              Terms of Service
            </Link>
            <Link
              to="#"
              className={`${
                theme === "dark"
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-700 hover:text-green-700"
              }`}
            >
              Cookies
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
