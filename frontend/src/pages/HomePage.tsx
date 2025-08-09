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
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 md:pt-24 md:pb-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-2xl mb-6 ring-1 ring-white/10">
              <BoltIcon className="h-10 w-10 text-white drop-shadow" />
            </div>
            <h1
              className={`text-4xl md:text-6xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent ${
                theme === "dark"
                  ? "from-green-400 to-emerald-500"
                  : "from-green-600 to-emerald-700"
              }`}
            >
              AmpFlux
            </h1>
            <p
              className={`mt-4 text-lg md:text-xl max-w-3xl mx-auto ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              The modern platform for circuit design, collaboration, and
              short-circuit simulation — fast, intuitive, and built for teams.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={scrollToForm}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ease-out shadow-md hover:shadow-xl border border-green-500/30"
              >
                Ask for a Demo
              </button>
              <Link
                to="/dashboard"
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ease-out border ${
                  theme === "dark"
                    ? "border-gray-700 text-gray-200 hover:text-white hover:border-gray-600 bg-gray-800/60 backdrop-blur"
                    : "border-green-300 text-green-700 hover:text-green-800 hover:border-green-400 bg-white"
                }`}
              >
                Explore Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* App Pictures */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className={`text-2xl md:text-3xl font-bold text-center ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            See the App
          </h2>
          <p
            className={`text-center mt-2 mb-8 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Screenshots showcasing core workflows
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className={`aspect-video rounded-2xl flex items-center justify-center shadow-lg overflow-hidden transition-transform duration-500 hover:scale-[1.02] ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-gray-800/70 to-gray-900/70 border border-gray-700/60"
                    : "bg-gradient-to-br from-gray-100 to-white border border-green-200/50"
                }`}
              >
                <span className="text-sm text-gray-500">
                  App Screenshot Placeholder #{n}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Videos */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className={`text-2xl md:text-3xl font-bold text-center ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Videos
          </h2>
          <p
            className={`text-center mt-2 mb-8 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Short clips of AmpFlux in action
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["Editor Walkthrough", "Running a Simulation"].map(
              (title, idx) => (
                <div
                  key={idx}
                  className={`group relative aspect-video rounded-2xl overflow-hidden shadow-xl transition-transform duration-500 hover:scale-[1.02] ${
                    theme === "dark"
                      ? "border border-gray-700/60 bg-gray-800/70"
                      : "border border-green-200/60 bg-gray-100"
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircleIcon
                      className={`h-16 w-16 opacity-90 ${
                        theme === "dark" ? "text-emerald-400" : "text-green-600"
                      }`}
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white font-medium">{title}</p>
                    <p className="text-white/80 text-sm">Video placeholder</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className={`text-2xl md:text-3xl font-bold text-center ${
              theme === "dark" ? "text-white" : "text-gray-900"
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
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2
            className={`text-2xl md:text-3xl font-bold text-center ${
              theme === "dark" ? "text-white" : "text-gray-900"
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
      <section ref={formRef} className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2
            className={`text-2xl md:text-3xl font-bold text-center ${
              theme === "dark" ? "text-white" : "text-gray-900"
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
