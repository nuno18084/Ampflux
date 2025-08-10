import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeProvider";
import {
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  PlayCircleIcon,
  BoltIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

export const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const formRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState("hero");

  // Section refs
  const heroRef = useRef<HTMLDivElement>(null);
  const appScreenshotsRef = useRef<HTMLElement>(null);
  const productDemosRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  const faqsRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

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

  const scrollToSection = (sectionId: string) => {
    const sectionRefs: { [key: string]: React.RefObject<HTMLElement> } = {
      hero: heroRef,
      appScreenshots: appScreenshotsRef,
      productDemos: productDemosRef,
      pricing: pricingRef,
      faqs: faqsRef,
      contact: contactRef,
    };

    const ref = sectionRefs[sectionId];
    if (ref?.current) {
      if (sectionId === "hero") {
        // Scroll to the very top for home section
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        // Use negative offset for other sections
        const navbarHeight = -50;
        const elementTop = ref.current.offsetTop - navbarHeight;
        window.scrollTo({
          top: elementTop,
          behavior: "smooth",
        });
      }
    }
  };

  // Intersection Observer to track active section
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -20% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute("data-section");
          if (sectionId) {
            setActiveSection(sectionId);
          }
        }
      });
    }, observerOptions);

    const sections = [
      heroRef.current,
      appScreenshotsRef.current,
      productDemosRef.current,
      pricingRef.current,
      faqsRef.current,
      contactRef.current,
    ];

    sections.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      sections.forEach((section) => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, []);

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

      {/* Site Map */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
        <div className="flex flex-col items-center space-y-6">
          {[
            { id: "hero", label: "Home", icon: "home" },
            { id: "appScreenshots", label: "Features", icon: "⚡" },
            { id: "productDemos", label: "Demos", icon: "🎥" },
            { id: "pricing", label: "Pricing", icon: "💰" },
            { id: "faqs", label: "FAQ", icon: "❓" },
            { id: "contact", label: "Contact", icon: "📧" },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`group relative flex flex-col items-center transition-all duration-500 ease-out ${
                activeSection === section.id ? "scale-125" : "hover:scale-110"
              }`}
              title={section.label}
            >
              {/* Modern Dot with Ring or Icon */}
              {section.icon === "home" ? (
                // Home Icon instead of dot
                <div className="relative">
                  {/* Outer Ring */}
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-500 ease-out ${
                      activeSection === section.id
                        ? theme === "dark"
                          ? "bg-green-400/30 scale-150"
                          : "bg-green-600/30 scale-150"
                        : "bg-transparent scale-100"
                    }`}
                  />

                  {/* Inner Ring */}
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-500 ease-out ${
                      activeSection === section.id
                        ? theme === "dark"
                          ? "bg-green-400/20 scale-125"
                          : "bg-green-600/20 scale-125"
                        : "bg-transparent scale-100"
                    }`}
                  />

                  {/* Home Icon */}
                  <HomeIcon
                    className={`relative w-4 h-4 transition-all duration-500 ease-out ${
                      activeSection === section.id
                        ? theme === "dark"
                          ? "text-green-400 shadow-lg shadow-green-400/50"
                          : "text-green-600 shadow-lg shadow-green-600/50"
                        : theme === "dark"
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-500 hover:text-gray-600"
                    }`}
                  />
                </div>
              ) : (
                // Regular dot for other sections
                <div className="relative">
                  {/* Outer Ring */}
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-500 ease-out ${
                      activeSection === section.id
                        ? theme === "dark"
                          ? "bg-green-400/30 scale-150"
                          : "bg-green-600/30 scale-150"
                        : "bg-transparent scale-100"
                    }`}
                  />

                  {/* Inner Ring */}
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-500 ease-out ${
                      activeSection === section.id
                        ? theme === "dark"
                          ? "bg-green-400/20 scale-125"
                          : "bg-green-600/20 scale-125"
                        : "bg-transparent scale-100"
                    }`}
                  />

                  {/* Core Dot */}
                  <div
                    className={`relative w-2.5 h-2.5 rounded-full transition-all duration-500 ease-out ${
                      activeSection === section.id
                        ? theme === "dark"
                          ? "bg-green-400 shadow-lg shadow-green-400/50"
                          : "bg-green-600 shadow-lg shadow-green-600/50"
                        : theme === "dark"
                        ? "bg-gray-500 hover:bg-gray-400"
                        : "bg-gray-400 hover:bg-gray-500"
                    }`}
                  />
                </div>
              )}

              {/* Modern Label */}
              <div
                className={`absolute right-8 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 pointer-events-none backdrop-blur-sm ${
                  theme === "dark"
                    ? "bg-gray-900/90 text-white border border-gray-700/50 shadow-2xl"
                    : "bg-white/95 text-gray-900 border border-gray-200/50 shadow-2xl"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {section.icon === "home" ? (
                    <HomeIcon
                      className={`h-4 w-4 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    />
                  ) : (
                    <span className="text-base">{section.icon}</span>
                  )}
                  <span className="font-semibold">{section.label}</span>
                </div>
                {/* Modern Arrow */}
                <div
                  className={`absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent ${
                    theme === "dark"
                      ? "border-t-4 border-t-gray-900/90"
                      : "border-t-4 border-t-white/95"
                  }`}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

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

      {/* Wave background animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br from-transparent via-green-500/5 to-transparent animate-background-wave ${
            theme === "dark" ? "opacity-10" : "opacity-5"
          }`}
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(45deg, transparent 0%, rgba(34, 197, 94, 0.03) 25%, rgba(16, 185, 129, 0.02) 50%, rgba(34, 197, 94, 0.03) 75%, transparent 100%)"
                : "linear-gradient(45deg, transparent 0%, rgba(34, 197, 94, 0.02) 25%, rgba(16, 185, 129, 0.01) 50%, rgba(34, 197, 94, 0.02) 75%, transparent 100%)",
          }}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-tl from-transparent via-emerald-500/5 to-transparent animate-background-wave-2 ${
            theme === "dark" ? "opacity-8" : "opacity-4"
          }`}
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(-45deg, transparent 0%, rgba(16, 185, 129, 0.02) 25%, rgba(34, 197, 94, 0.03) 50%, rgba(16, 185, 129, 0.02) 75%, transparent 100%)"
                : "linear-gradient(-45deg, transparent 0%, rgba(16, 185, 129, 0.01) 25%, rgba(34, 197, 94, 0.02) 50%, rgba(16, 185, 129, 0.01) 75%, transparent 100%)",
          }}
        />
      </div>

      {/* Shooting Star Electrical Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Horizontal shooting stars - from edges only */}
        <div
          className={`absolute w-32 h-[1px] bg-gradient-to-r from-green-400/60 via-green-400/80 to-transparent animate-shooting-star-left`}
          style={{
            top: "15%",
            left: "0%",
            boxShadow:
              "0 0 8px rgba(74, 222, 128, 0.6), 0 0 16px rgba(74, 222, 128, 0.4), 0 0 24px rgba(74, 222, 128, 0.3)",
          }}
        ></div>
        <div
          className={`absolute w-24 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/80 to-emerald-400/60 animate-shooting-star-right`}
          style={{
            top: "28%",
            right: "0%",
            boxShadow:
              "0 0 8px rgba(52, 211, 153, 0.6), 0 0 16px rgba(52, 211, 153, 0.4), 0 0 24px rgba(52, 211, 153, 0.3)",
          }}
        ></div>
        <div
          className={`absolute w-40 h-[1px] bg-gradient-to-r from-green-500/60 via-green-500/80 to-transparent animate-shooting-star-left-delay-1`}
          style={{
            top: "42%",
            left: "0%",
            boxShadow:
              "0 0 8px rgba(34, 197, 94, 0.6), 0 0 16px rgba(34, 197, 94, 0.4), 0 0 24px rgba(34, 197, 94, 0.3)",
          }}
        ></div>
        <div
          className={`absolute w-28 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/80 to-emerald-500/60 animate-shooting-star-right-delay-1`}
          style={{
            top: "58%",
            right: "0%",
            boxShadow:
              "0 0 8px rgba(16, 185, 129, 0.6), 0 0 16px rgba(16, 185, 129, 0.4), 0 0 24px rgba(16, 185, 129, 0.3)",
          }}
        ></div>
        <div
          className={`absolute w-36 h-[1px] bg-gradient-to-r from-green-400/60 via-green-400/80 to-transparent animate-shooting-star-left-delay-2`}
          style={{
            top: "73%",
            left: "0%",
            boxShadow:
              "0 0 8px rgba(74, 222, 128, 0.6), 0 0 16px rgba(74, 222, 128, 0.4), 0 0 24px rgba(74, 222, 128, 0.3)",
          }}
        ></div>
        <div
          className={`absolute w-20 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/80 to-emerald-400/60 animate-shooting-star-right-delay-2`}
          style={{
            top: "87%",
            right: "0%",
            boxShadow:
              "0 0 8px rgba(52, 211, 153, 0.6), 0 0 16px rgba(52, 211, 153, 0.4), 0 0 24px rgba(52, 211, 153, 0.3)",
          }}
        ></div>
        <div
          className={`absolute w-44 h-[1px] bg-gradient-to-r from-green-500/60 via-green-500/80 to-transparent animate-shooting-star-left-delay-3`}
          style={{
            top: "18%",
            left: "0%",
            boxShadow:
              "0 0 8px rgba(34, 197, 94, 0.6), 0 0 16px rgba(34, 197, 94, 0.4), 0 0 24px rgba(34, 197, 94, 0.3)",
          }}
        ></div>
        <div
          className={`absolute w-32 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/80 to-emerald-500/60 animate-shooting-star-right-delay-3`}
          style={{
            top: "95%",
            right: "0%",
            boxShadow:
              "0 0 8px rgba(16, 185, 129, 0.6), 0 0 16px rgba(16, 185, 129, 0.4), 0 0 24px rgba(16, 185, 129, 0.3)",
          }}
        ></div>

        {/* Vertical shooting stars - from edges only */}
        <div
          className={`absolute w-[1px] h-16 bg-gradient-to-b from-green-400/60 via-green-400/80 to-transparent animate-shooting-star-vertical-1`}
          style={{
            top: "0%",
            left: "22%",
            boxShadow:
              "0 0 8px rgba(74, 222, 128, 0.6), 0 0 16px rgba(74, 222, 128, 0.4), 0 0 24px rgba(74, 222, 128, 0.3)",
          }}
        ></div>
        <div
          className={`absolute w-[1px] h-20 bg-gradient-to-b from-transparent via-emerald-400/80 to-emerald-400/60 animate-shooting-star-vertical-2`}
          style={{
            bottom: "0%",
            left: "67%",
            boxShadow:
              "0 0 8px rgba(52, 211, 153, 0.6), 0 0 16px rgba(52, 211, 153, 0.4), 0 0 24px rgba(52, 211, 153, 0.3)",
          }}
        ></div>
        <div
          className={`absolute w-[1px] h-24 bg-gradient-to-b from-green-500/60 via-green-500/80 to-transparent animate-shooting-star-vertical-3`}
          style={{
            top: "0%",
            left: "45%",
            boxShadow:
              "0 0 8px rgba(34, 197, 94, 0.6), 0 0 16px rgba(34, 197, 94, 0.4), 0 0 24px rgba(34, 197, 94, 0.3)",
          }}
        ></div>
        <div
          className={`absolute w-[1px] h-28 bg-gradient-to-b from-transparent via-emerald-500/80 to-emerald-500/60 animate-shooting-star-vertical-4`}
          style={{
            bottom: "0%",
            left: "83%",
            boxShadow:
              "0 0 8px rgba(16, 185, 129, 0.6), 0 0 16px rgba(16, 185, 129, 0.4), 0 0 24px rgba(16, 185, 129, 0.3)",
          }}
        ></div>

        {/* Circuit nodes (stationary glowing dots) */}
        <div
          className={`absolute top-[18%] left-[12%] w-2 h-2 bg-green-400/60 rounded-full animate-glow-ping-slow`}
          style={{
            boxShadow:
              "0 0 12px rgba(74, 222, 128, 0.8), 0 0 24px rgba(74, 222, 128, 0.6), 0 0 36px rgba(74, 222, 128, 0.4)",
          }}
        ></div>
        <div
          className={`absolute top-[28%] left-[62%] w-2 h-2 bg-emerald-400/50 rounded-full animate-glow-ping-slow-delay-1`}
          style={{
            boxShadow:
              "0 0 12px rgba(52, 211, 153, 0.8), 0 0 24px rgba(52, 211, 153, 0.6), 0 0 36px rgba(52, 211, 153, 0.4)",
          }}
        ></div>
        <div
          className={`absolute top-[38%] left-[22%] w-2 h-2 bg-green-500/55 rounded-full animate-glow-ping-slow-delay-2`}
          style={{
            boxShadow:
              "0 0 12px rgba(34, 197, 94, 0.8), 0 0 24px rgba(34, 197, 94, 0.6), 0 0 36px rgba(34, 197, 94, 0.4)",
          }}
        ></div>
        <div
          className={`absolute top-[48%] left-[72%] w-2 h-2 bg-emerald-500/45 rounded-full animate-glow-ping-slow-delay-3`}
          style={{
            boxShadow:
              "0 0 12px rgba(16, 185, 129, 0.8), 0 0 24px rgba(16, 185, 129, 0.6), 0 0 36px rgba(16, 185, 129, 0.4)",
          }}
        ></div>
        <div
          className={`absolute top-[58%] left-[17%] w-2 h-2 bg-green-400/50 rounded-full animate-glow-ping-slow-delay-4`}
          style={{
            boxShadow:
              "0 0 12px rgba(74, 222, 128, 0.8), 0 0 24px rgba(74, 222, 128, 0.6), 0 0 36px rgba(74, 222, 128, 0.4)",
          }}
        ></div>
        <div
          className={`absolute top-[68%] left-[52%] w-2 h-2 bg-emerald-400/45 rounded-full animate-glow-ping-slow-delay-5`}
          style={{
            boxShadow:
              "0 0 12px rgba(52, 211, 153, 0.8), 0 0 24px rgba(52, 211, 153, 0.6), 0 0 36px rgba(52, 211, 153, 0.4)",
          }}
        ></div>
        <div
          className={`absolute top-[78%] left-[27%] w-2 h-2 bg-green-500/40 rounded-full animate-glow-ping-slow-delay-6`}
          style={{
            boxShadow:
              "0 0 12px rgba(34, 197, 94, 0.8), 0 0 24px rgba(34, 197, 94, 0.6), 0 0 36px rgba(34, 197, 94, 0.4)",
          }}
        ></div>
        <div
          className={`absolute top-[88%] left-[67%] w-2 h-2 bg-emerald-500/50 rounded-full animate-glow-ping-slow-delay-7`}
          style={{
            boxShadow:
              "0 0 12px rgba(16, 185, 129, 0.8), 0 0 24px rgba(16, 185, 129, 0.6), 0 0 36px rgba(16, 185, 129, 0.4)",
          }}
        ></div>
      </div>
      {/* Hero / Introduction */}
      <header ref={heroRef} data-section="hero" className="relative">
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
      <section
        ref={appScreenshotsRef}
        data-section="appScreenshots"
        className="py-32 md:py-40"
      >
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
      <section
        ref={productDemosRef}
        data-section="productDemos"
        className="py-32 md:py-40"
      >
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
              Comprehensive overviews of AmpFlux's core capabilities and
              workflows
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {[
              {
                title: "Schematic Design & PCB Layout",
                desc: "Complete design workflow from initial concept to manufacturable PCB layout with real-time collaboration and version control",
                duration: "6:24",
                category: "Design Process",
                features: [
                  "Schematic capture",
                  "Component library",
                  "PCB routing",
                  "Design validation",
                ],
              },
              {
                title: "Advanced Circuit Simulation",
                desc: "Comprehensive analysis including thermal management, electromagnetic compatibility, and power distribution optimization",
                duration: "8:15",
                category: "Analysis Tools",
                features: [
                  "Thermal analysis",
                  "EMC testing",
                  "Power analysis",
                  "Signal integrity",
                ],
              },
            ].map((video, idx) => (
              <div
                key={idx}
                className={`group relative ${
                  theme === "dark"
                    ? "bg-gray-900/60 border border-gray-800"
                    : "bg-white border border-gray-200"
                } rounded-2xl shadow-lg overflow-hidden`}
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video">
                  {/* Background */}
                  <div
                    className={`absolute inset-0 ${
                      theme === "dark"
                        ? "bg-gradient-to-br from-gray-800 to-gray-900"
                        : "bg-gradient-to-br from-gray-100 to-gray-50"
                    }`}
                  />

                  {/* Professional Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
                        theme === "dark"
                          ? "bg-white/10 backdrop-blur-sm border border-white/20"
                          : "bg-black/10 backdrop-blur-sm border border-black/20"
                      }`}
                    >
                      <PlayCircleIcon
                        className={`h-10 w-10 ${
                          theme === "dark" ? "text-white" : "text-black"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div
                    className={`absolute bottom-4 right-4 px-3 py-1.5 rounded-lg text-sm font-medium ${
                      theme === "dark"
                        ? "bg-black/80 text-gray-200"
                        : "bg-white/95 text-gray-800"
                    } shadow-lg`}
                  >
                    {video.duration}
                  </div>

                  {/* Category Badge */}
                  <div
                    className={`absolute top-4 left-4 px-4 py-2 rounded-lg text-sm font-semibold ${
                      theme === "dark"
                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : "bg-green-100 text-green-800 border border-green-200"
                    }`}
                  >
                    {video.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3
                    className={`text-xl font-bold mb-4 ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {video.title}
                  </h3>
                  <p
                    className={`text-base leading-relaxed mb-6 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {video.desc}
                  </p>

                  {/* Features List */}
                  <div className="mb-6">
                    <h4
                      className={`text-sm font-semibold mb-3 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Key Features Covered:
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {video.features.map((feature, featureIdx) => (
                        <div
                          key={featureIdx}
                          className={`flex items-center gap-2 text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              theme === "dark" ? "bg-green-400" : "bg-green-600"
                            }`}
                          />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Watch Button */}
                  <button
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-green-600 text-white hover:bg-green-700 shadow-lg"
                        : "bg-green-600 text-white hover:bg-green-700 shadow-lg"
                    }`}
                  >
                    Watch Full Demo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        ref={pricingRef}
        data-section="pricing"
        className="py-32 md:py-40"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className={`text-3xl md:text-4xl font-bold ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}
            >
              Enterprise-Grade Pricing
            </h2>
            <p
              className={`text-lg mt-4 max-w-2xl mx-auto ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Scalable solutions designed for professional engineering teams and
              organizations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {[
              {
                name: "Professional",
                subtitle: "Individual Engineers",
                price: "$29",
                period: "per month",
                description:
                  "Perfect for individual engineers and small design teams",
                features: [
                  "Unlimited circuit designs",
                  "Advanced simulation engine",
                  "Component library (10,000+ parts)",
                  "Export to industry standards",
                  "Email support",
                  "Cloud storage (10GB)",
                ],
                cta: "Start Free Trial",
                highlight: false,
                popular: false,
              },
              {
                name: "Enterprise",
                subtitle: "Engineering Teams",
                price: "$99",
                period: "per month",
                description:
                  "Comprehensive solution for professional engineering teams",
                features: [
                  "Everything in Professional",
                  "Team collaboration tools",
                  "Role-based access control",
                  "Advanced analytics & reporting",
                  "Priority support (24/7)",
                  "Cloud storage (100GB)",
                  "API access",
                  "Custom integrations",
                ],
                cta: "Contact Sales",
                highlight: true,
                popular: true,
              },
              {
                name: "Custom",
                subtitle: "Large Organizations",
                price: "Custom",
                period: "enterprise",
                description:
                  "Tailored solutions for large organizations and OEMs",
                features: [
                  "Everything in Enterprise",
                  "On-premise deployment",
                  "Custom feature development",
                  "Dedicated account manager",
                  "Training & certification",
                  "SLA guarantees",
                  "White-label options",
                  "Enterprise security",
                ],
                cta: "Schedule Demo",
                highlight: false,
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col ${
                  plan.highlight
                    ? theme === "dark"
                      ? "bg-gray-900 border-2 border-green-500/50 lg:scale-110"
                      : "bg-white border-2 border-green-500/50 lg:scale-110"
                    : theme === "dark"
                    ? "bg-gray-900/60 border border-gray-800 lg:scale-95"
                    : "bg-white border border-gray-200 lg:scale-95"
                } rounded-xl p-5 shadow-lg`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-4">
                  <h3
                    className={`text-lg font-bold mb-1 ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-xs font-medium ${
                      theme === "dark" ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    {plan.subtitle}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Pricing */}
                <div className="text-center mb-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className={`text-2xl font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4 flex-grow">
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className={`flex items-start gap-2 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        <CheckCircleIcon
                          className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                            theme === "dark"
                              ? "text-green-400"
                              : "text-green-600"
                          }`}
                        />
                        <span className="text-xs leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  onClick={scrollToForm}
                  className={`w-full py-2 px-3 rounded-md font-medium text-sm transition-all duration-300 mt-auto ${
                    plan.highlight
                      ? "bg-green-600 text-white hover:bg-green-700 shadow-lg"
                      : theme === "dark"
                      ? "bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 hover:border-gray-600"
                      : "bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="text-center mt-16">
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              All plans include a 14-day free trial. No credit card required.
            </p>
            <p
              className={`text-sm mt-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Need a custom solution? Contact our enterprise team for a
              personalized quote.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section ref={faqsRef} data-section="faqs" className="py-32 md:py-40">
        <div className="max-w-4xl mx-auto px-6">
          <h2
            className={`text-2xl md:text-3xl font-bold text-center ${
              theme === "dark" ? "text-green-400" : "text-green-600"
            }`}
          >
            Frequently Asked Questions
          </h2>
          <p
            className={`text-center mt-2 mb-8 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Everything you need to know about AmpFlux
          </p>
          <div className="mt-8 space-y-4">
            {[
              {
                q: "What is AmpFlux and how does it work?",
                a: "AmpFlux is a comprehensive circuit design and simulation platform that allows engineers to create, test, and optimize electrical circuits in a collaborative environment. Our advanced simulation engine provides real-time analysis and helps identify potential issues before physical prototyping.",
              },
              {
                q: "Is AmpFlux suitable for beginners or only professionals?",
                a: "AmpFlux is designed to serve both beginners and professionals. We offer intuitive design tools for newcomers while providing advanced features like complex simulations, team collaboration, and enterprise integrations for experienced engineers.",
              },
              {
                q: "What types of circuits can I design with AmpFlux?",
                a: "AmpFlux supports a wide range of circuit types including analog, digital, mixed-signal, power electronics, and control systems. Our extensive component library includes over 10,000 parts from leading manufacturers.",
              },
              {
                q: "How does team collaboration work in AmpFlux?",
                a: "AmpFlux offers robust collaboration features including real-time project sharing, role-based access control, version history, and commenting. Team members can work simultaneously on the same project with automatic conflict resolution.",
              },
              {
                q: "What simulation capabilities does AmpFlux provide?",
                a: "Our simulation engine supports DC analysis, AC analysis, transient analysis, frequency response, and short-circuit analysis. We also offer advanced features like Monte Carlo analysis and sensitivity studies for professional applications.",
              },
              {
                q: "Can I export my designs to other software?",
                a: "Yes, AmpFlux supports export to industry-standard formats including SPICE netlists, Gerber files, PDF schematics, and common CAD formats. This ensures compatibility with your existing workflow and manufacturing processes.",
              },
              {
                q: "Is my data secure and backed up?",
                a: "Absolutely. We use enterprise-grade security with end-to-end encryption, regular automated backups, and secure cloud storage. Your intellectual property is protected with industry-standard security protocols.",
              },
              {
                q: "What kind of support do you provide?",
                a: "We offer comprehensive support including detailed documentation, video tutorials, community forums, email support, and priority phone support for enterprise customers. Our team is committed to helping you succeed.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`group rounded-xl border transition-all duration-300 ease-out hover:shadow-md ${
                  openFAQ === idx
                    ? theme === "dark"
                      ? "border-green-500/50 bg-gray-800/80 shadow-lg"
                      : "border-green-500/50 bg-white shadow-lg"
                    : theme === "dark"
                    ? "border-gray-700/60 bg-gray-800/40 hover:border-gray-600/60"
                    : "border-gray-200 bg-white/80 hover:border-gray-300"
                }`}
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-green-500/20 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-semibold text-lg flex items-center ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      <QuestionMarkCircleIcon
                        className={`h-6 w-6 mr-3 ${
                          theme === "dark" ? "text-green-400" : "text-green-600"
                        }`}
                      />
                      {item.q}
                    </span>
                    <span
                      className={`ml-4 transition-transform duration-300 ease-out ${
                        openFAQ === idx ? "rotate-180" : "rotate-0"
                      } ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-out ${
                      openFAQ === idx
                        ? "max-h-96 opacity-100 mt-4"
                        : "max-h-0 opacity-0 mt-0"
                    }`}
                  >
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p
                        className={`text-base leading-relaxed ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {item.a}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section
        ref={contactRef}
        data-section="contact"
        className="pt-32 pb-24 md:pt-40 md:pb-32"
      >
        <div ref={formRef}>
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2
                className={`text-2xl md:text-3xl font-bold mb-3 ${
                  theme === "dark" ? "text-green-400" : "text-green-600"
                }`}
              >
                Get in Touch
              </h2>
              <p
                className={`text-base ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Ready to transform your circuit design workflow? Let's talk.
              </p>
            </div>

            <div
              className={`rounded-xl p-6 shadow-xl ${
                theme === "dark"
                  ? "border border-gray-700/60 bg-gray-800/60 backdrop-blur"
                  : "border border-gray-200 bg-white"
              }`}
            >
              {submitted && (
                <div
                  className={`mb-6 rounded-lg border p-4 ${
                    theme === "dark"
                      ? "border-green-500/40 bg-green-500/10 text-green-300"
                      : "border-green-300 bg-green-50 text-green-700"
                  }`}
                >
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    <span className="font-medium">
                      Message sent successfully!
                    </span>
                  </div>
                  <p className="text-sm mt-1">We'll respond within 24 hours.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        theme === "dark" ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Name *
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Your name"
                      className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200 ${
                        theme === "dark"
                          ? "bg-gray-700/60 border border-gray-600 text-white placeholder-gray-400"
                          : "border border-gray-300 text-gray-900 placeholder-gray-500 bg-white"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        theme === "dark" ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                      className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200 ${
                        theme === "dark"
                          ? "bg-gray-700/60 border border-gray-600 text-white placeholder-gray-400"
                          : "border border-gray-300 text-gray-900 placeholder-gray-500 bg-white"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Message *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    placeholder="Tell us about your project or request a demo..."
                    className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200 resize-none ${
                      theme === "dark"
                        ? "bg-gray-700/60 border border-gray-600 text-white placeholder-gray-400"
                        : "border border-gray-300 text-gray-900 placeholder-gray-500 bg-white"
                    }`}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 ease-out shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Send Message
                  </button>
                  <a
                    href="mailto:contact@ampflux.com"
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-out border text-center ${
                      theme === "dark"
                        ? "border-gray-600 text-gray-200 hover:text-white hover:border-gray-500 bg-gray-700/60"
                        : "border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 bg-gray-50"
                    }`}
                  >
                    Email Directly
                  </a>
                </div>
              </form>
            </div>
          </div>
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
