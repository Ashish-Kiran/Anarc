import React, { useState } from "react";

// ANARC Robotics Club — Signup Page
// Mirrors the Login page: same role toggle, glass card, cyan-glow focus
// states, and copper circuit-trace background, plus name/confirm-password
// fields and a terms checkbox.

export default function SignupPage() {
  const [role, setRole] = useState("member"); // "member" | "admin"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      console.log("Passwords do not match");
      return;
    }
    console.log("Sign up as", role, form);
    // TODO: wire up to auth endpoint (different endpoint per role if needed)
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0e14] flex items-center justify-center px-4 py-12">
      {/* Decorative circuit-trace background */}
      <CircuitBackground />

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] shadow-[0_0_60px_rgba(0,0,0,0.35)] p-8 sm:p-10"
        >
          {/* Logo / heading */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full border border-[#4dd9e8]/60 flex items-center justify-center mb-4">
              <UserPlusIcon className="w-6 h-6 text-[#4dd9e8]" />
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-wide">
              Create your account
            </h1>
            <p className="text-sm text-gray-400 mt-1 text-center">
              Join the ANARC Robotics Club portal
            </p>
          </div>

          {/* Role toggle */}
          <div className="mb-7">
            <div className="relative grid grid-cols-2 rounded-lg border border-white/10 bg-black/20 p-1">
              <button
                type="button"
                onClick={() => setRole("member")}
                className={`relative z-10 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-colors duration-300 ${
                  role === "member"
                    ? "text-[#0a0e14]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <UserIcon className="w-4 h-4" />
                Member
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`relative z-10 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-colors duration-300 ${
                  role === "admin"
                    ? "text-[#0a0e14]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <ShieldIcon className="w-4 h-4" />
                Admin
              </button>

              {/* Sliding highlight */}
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-[#4dd9e8] shadow-[0_0_16px_rgba(77,217,232,0.5)] transition-transform duration-300 ease-out ${
                  role === "admin" ? "translate-x-[calc(100%+8px)]" : "translate-x-1"
                }`}
              />
            </div>
          </div>

          {/* Name field */}
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block text-xs uppercase tracking-wider text-gray-400 mb-2"
            >
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-gray-600/50 bg-white/[0.04] pl-11 pr-4 py-3.5 text-sm text-white caret-[#4dd9e8] placeholder-gray-500 outline-none transition-all duration-300 focus:border-[#4dd9e8] focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(77,217,232,0.15),0_0_16px_rgba(77,217,232,0.35)]"
              />
            </div>
          </div>

          {/* Email field */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-wider text-gray-400 mb-2"
            >
              {role === "admin" ? "Admin Email" : "Email Address"}
            </label>
            <div className="relative">
              <MailIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email-id"
                className="w-full rounded-lg border border-gray-600/50 bg-white/[0.04] pl-11 pr-4 py-3.5 text-sm text-white caret-[#4dd9e8] placeholder-gray-500 outline-none transition-all duration-300 focus:border-[#4dd9e8] focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(77,217,232,0.15),0_0_16px_rgba(77,217,232,0.35)]"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="mb-5">
            <label
              htmlFor="password"
              className="block text-xs uppercase tracking-wider text-gray-400 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <LockIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full rounded-lg border border-gray-600/50 bg-white/[0.04] pl-11 pr-11 py-3.5 text-sm text-white caret-[#4dd9e8] placeholder-gray-500 outline-none transition-all duration-300 focus:border-[#4dd9e8] focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(77,217,232,0.15),0_0_16px_rgba(77,217,232,0.35)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#4dd9e8] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOffIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm password field */}
          <div className="mb-3">
            <label
              htmlFor="confirmPassword"
              className="block text-xs uppercase tracking-wider text-gray-400 mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <LockIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                required
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="w-full rounded-lg border border-gray-600/50 bg-white/[0.04] pl-11 pr-11 py-3.5 text-sm text-white caret-[#4dd9e8] placeholder-gray-500 outline-none transition-all duration-300 focus:border-[#4dd9e8] focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(77,217,232,0.15),0_0_16px_rgba(77,217,232,0.35)]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#4dd9e8] transition-colors"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOffIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="mt-2 text-xs text-red-400">Passwords do not match</p>
            )}
          </div>

          {/* Terms checkbox */}
          <div className="mb-8 mt-4">
            <label className="flex items-start gap-2 text-xs text-gray-400 cursor-pointer select-none">
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
                required
                className="mt-0.5 w-3.5 h-3.5 rounded border-gray-600 bg-transparent accent-[#4dd9e8]"
              />
              <span>
                I agree to the{" "}
                <a href="#" className="text-[#4dd9e8] hover:text-[#7ee4ef]">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#4dd9e8] hover:text-[#7ee4ef]">
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-lg border border-gray-600/70 bg-transparent py-3.5 text-sm font-semibold text-white tracking-wide transition-all duration-300 hover:border-[#4dd9e8] hover:text-[#4dd9e8] hover:shadow-[0_0_20px_rgba(77,217,232,0.25)]"
          >
            Sign Up as {role === "admin" ? "Admin" : "Member"}
          </button>

          {/* Footer */}
          <p className="mt-7 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <a href="#" className="text-[#4dd9e8] hover:text-[#7ee4ef] font-medium">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

// ---------- Decorative circuit background ----------
function CircuitBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="absolute top-0 left-0 w-full h-full opacity-40"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="#c9793a" strokeWidth="1.2" opacity="0.5">
          <path d="M0 120 H180 V220 H340" />
          <path d="M60 0 V60 H260" />
          <path d="M0 380 H120 V500" />
          <path d="M1440 140 H1260 V260 H1120" />
          <path d="M1380 0 V80 H1180" />
          <path d="M1440 420 H1320 V560" />
          <path d="M0 780 H160 V860" />
          <path d="M1440 760 H1300 V860" />
          <path d="M620 0 V40" />
          <path d="M820 900 V860" />
        </g>
        <g fill="#c9793a" opacity="0.7">
          <circle cx="180" cy="120" r="3" />
          <circle cx="340" cy="220" r="3" />
          <circle cx="60" cy="60" r="3" />
          <circle cx="260" cy="60" r="3" />
          <circle cx="120" cy="380" r="3" />
          <circle cx="120" cy="500" r="3" />
          <circle cx="1260" cy="140" r="3" />
          <circle cx="1120" cy="260" r="3" />
          <circle cx="1380" cy="80" r="3" />
          <circle cx="1180" cy="80" r="3" />
          <circle cx="1320" cy="420" r="3" />
          <circle cx="1320" cy="560" r="3" />
          <circle cx="160" cy="780" r="3" />
          <circle cx="160" cy="860" r="3" />
          <circle cx="1300" cy="760" r="3" />
          <circle cx="1300" cy="860" r="3" />
          <circle cx="620" cy="40" r="3" />
          <circle cx="820" cy="860" r="3" />
        </g>
      </svg>
      {/* Radial vignette to keep the card area clean */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0e14_75%)]" />
    </div>
  );
}

// ---------- Minimal inline icons (no external deps) ----------
function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}
function UserPlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="10" cy="8" r="3.5" />
      <path d="M2.5 20c1.3-3.6 4.5-5.5 7.5-5.5s6.2 1.9 7.5 5.5" />
      <path d="M18.5 4v6M15.5 7h6" />
    </svg>
  );
}
function ShieldIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9.5 12l2 2 3.5-4" />
    </svg>
  );
}
function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}
function EyeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4M6.6 6.6C4 8.3 2 12 2 12s4 7 10 7c1.5 0 2.9-.4 4.1-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}