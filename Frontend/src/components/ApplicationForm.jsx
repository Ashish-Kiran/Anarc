import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export default function ApplicationForm({ onClose }) {
      const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rollNumber: "",
    branch: "",
    year: "",
    batch: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Close with Escape + prevent background scrolling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:3000/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSuccess(
        "Application submitted successfully. We'll get back to you soon."
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        rollNumber: "",
        branch: "",
        year: "",
        batch: "",
        reason: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#080c10]/85 backdrop-blur-md" />

      {/* Cyan glow */}
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5eeaf0]/5 blur-[100px] pointer-events-none" />

      {/* Modal */}
      <div
        className="
          relative
          w-full
          max-w-[620px]
          max-h-[92vh]
          overflow-y-auto
          rounded-xl
          border border-[rgba(94,234,240,0.22)]
          bg-[#0d1319]
          shadow-[0_0_80px_rgba(94,234,240,0.08)]
        "
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Top glow line */}
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5eeaf0]/70 to-transparent" />

        {/* HEADER */}
        <div className="border-b border-white/[0.06] px-6 py-6 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase text-[#8fd8dd]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5eeaf0] shadow-[0_0_8px_#5eeaf0]" />

                APPLICATION PROTOCOL
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#e9eef2] sm:text-3xl">
                Join ASIMOV
              </h2>

              <p className="mt-2 max-w-[480px] text-sm leading-relaxed text-[#7f8b94]">
                Tell us a little about yourself and why you want to build with
                us.
              </p>
            </div>

            {/* Close button */}
            <button
                type="button"
  onClick={() => navigate("/")}
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-md
                border
                border-white/[0.08]
                bg-white/[0.02]
                text-[#7f8b94]
                transition
                duration-200
                hover:border-[rgba(94,234,240,0.35)]
                hover:bg-[rgba(94,234,240,0.05)]
                hover:text-[#5eeaf0]
              "
            >
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8 sm:py-7">

          {/* IDENTITY */}
          <div className="mb-6">
            <SectionLabel number="01" title="IDENTITY" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                label="Full Name"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <InputField
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <InputField
                label="Password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <InputField
                label="Roll Number"
                name="rollNumber"
                placeholder="Your roll number"
                value={formData.rollNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* ACADEMICS */}
          <div className="mb-6">
            <SectionLabel number="02" title="ACADEMICS" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                label="Branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                required
                options={[
                  ["CSE", "Computer Science & Engineering"],
                  ["ECE", "Electronics & Communication"],
                  ["EE", "Electrical Engineering"],
                  ["ME", "Mechanical Engineering"],
                  ["CE", "Civil Engineering"],
                ]}
              />

              <SelectField
                label="Year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                options={[
                  ["FIRST", "1st Year"],
                  ["SECOND", "2nd Year"],
                  ["THIRD", "3rd Year"],
                  ["FOURTH", "4th Year"],
                ]}
              />

              <div className="sm:col-span-2">
                <InputField
                  label="Batch"
                  name="batch"
                  placeholder="e.g. 2024-2028"
                  value={formData.batch}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* MISSION */}
          <div className="mb-6">
            <SectionLabel number="03" title="MISSION" />

            <label className="block">
              <span className="mb-2 block font-mono text-[10px] tracking-[0.12em] uppercase text-[#65737d]">
                Why do you want to join?
                <span className="ml-1 text-[#5eeaf0]">*</span>
              </span>

              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Tell us what interests you about robotics, what you want to learn, or what you'd like to build..."
                className="
                  w-full
                  resize-none
                  rounded-md
                  border
                  border-white/[0.09]
                  bg-white/[0.025]
                  px-4
                  py-3
                  text-sm
                  leading-relaxed
                  text-[#dce4e8]
                  placeholder:text-[#46525b]
                  outline-none
                  transition
                  duration-200
                  focus:border-[rgba(94,234,240,0.45)]
                  focus:bg-[rgba(94,234,240,0.025)]
                  focus:shadow-[0_0_0_3px_rgba(94,234,240,0.04)]
                "
              />
            </label>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-5 rounded-md border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
              <div className="flex items-start gap-2">
                <span className="font-mono text-red-400">!</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="mb-5 rounded-md border border-[#5eeaf0]/20 bg-[#5eeaf0]/[0.05] px-4 py-3 text-sm text-[#8fd8dd]">
              <div className="flex items-start gap-2">
                <span className="text-[#5eeaf0]">✓</span>
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="
              group
              relative
              w-full
              overflow-hidden
              rounded-md
              border
              border-[rgba(94,234,240,0.32)]
              bg-white/[0.03]
              px-5
              py-3.5
              text-sm
              font-semibold
              text-[#e9eef2]
              transition-all
              duration-200
              hover:border-[rgba(94,234,240,0.75)]
              hover:bg-[rgba(94,234,240,0.07)]
              hover:-translate-y-px
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#5eeaf0]/30 border-t-[#5eeaf0]" />
                  TRANSMITTING APPLICATION...
                </>
              ) : (
                <>
                  SUBMIT APPLICATION
                  <span className="text-[#5eeaf0]">→</span>
                </>
              )}
            </span>
          </button>

          <div className="mt-5 text-center">
            <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#46525b]">
              ASIMOV · NIT AGARTALA ROBOTICS CLUB
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}


/* =========================
   INPUT FIELD
========================= */

function InputField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] tracking-[0.12em] uppercase text-[#65737d]">
        {label}

        {required && (
          <span className="ml-1 text-[#5eeaf0]">*</span>
        )}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="
          w-full
          rounded-md
          border
          border-white/[0.09]
          bg-white/[0.025]
          px-4
          py-3
          text-sm
          text-[#dce4e8]
          placeholder:text-[#46525b]
          outline-none
          transition
          duration-200
          focus:border-[rgba(94,234,240,0.45)]
          focus:bg-[rgba(94,234,240,0.025)]
          focus:shadow-[0_0_0_3px_rgba(94,234,240,0.04)]
        "
      />
    </label>
  );
}


/* =========================
   SELECT FIELD
========================= */

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] tracking-[0.12em] uppercase text-[#65737d]">
        {label}

        {required && (
          <span className="ml-1 text-[#5eeaf0]">*</span>
        )}
      </span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="
          w-full
          rounded-md
          border
          border-white/[0.09]
          bg-[#111820]
          px-4
          py-3
          text-sm
          text-[#dce4e8]
          outline-none
          transition
          duration-200
          focus:border-[rgba(94,234,240,0.45)]
          focus:shadow-[0_0_0_3px_rgba(94,234,240,0.04)]
        "
      >
        <option value="">Select {label}</option>

        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}


/* =========================
   SECTION LABEL
========================= */

function SectionLabel({ number, title }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="font-mono text-[10px] tracking-[0.12em] text-[#5eeaf0]">
        {number}
      </span>

      <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#65737d]">
        {title}
      </span>

      <div className="h-px flex-1 bg-white/[0.06]" />
    </div>
  );
}