import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import ANARC from "./../assets/AnarcLogo.png";

const API = "http://localhost:3000";

const inputClass =
  "w-full rounded-xl border border-[rgba(138,164,178,0.2)] bg-[rgba(7,12,18,0.5)] px-4 py-3.5 text-sm text-[#e9eef2] caret-[#4dd9e8] placeholder-[#55636d] outline-none transition-all duration-300 focus:border-[rgba(94,234,240,0.5)] focus:shadow-[0_0_0_2px_rgba(77,217,232,0.08),0_0_12px_rgba(77,217,232,0.15)]";

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
        {label}
      </label>
      {children}
    </div>
  );
}

function EyeIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4M6.6 6.6C4 8.3 2 12 2 12s4 7 10 7c1.5 0 2.9-.4 4.1-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_STEPS = [
  {
    key: "PENDING",
    label: "Applied",
    desc: "Your application has been received.",
  },
  {
    key: "ACCEPTED",
    label: "Shortlisted",
    desc: "You've been shortlisted for the written exam.",
  },
  {
    key: "EXAM_PASSED",
    label: "Exam Passed",
    desc: "You cleared the written exam.",
  },
  {
    key: "INTERVIEW_SCHEDULED",
    label: "Interview Scheduled",
    desc: "Your interview has been scheduled.",
  },
  {
    key: "INTERVIEW_PASSED",
    label: "Interview Passed",
    desc: "You passed the interview.",
  },
  {
    key: "CONVERTED",
    label: "Member",
    desc: "Welcome to ANARC! You are now an official member.",
  },
];

const TERMINAL_FAIL = ["REJECTED", "EXAM_FAILED", "INTERVIEW_FAILED"];

function currentStepIndex(status) {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

// ── Application Status Dashboard ──────────────────────────────────────────────
function StatusDashboard({ application, onLogout }) {
  const {
    status,
    name,
    email,
    rollNumber,
    branch,
    year,
    batch,
    admitCard,
    interviewInvite,
  } = application;
  const isFailed = TERMINAL_FAIL.includes(status);
  const stepIndex = currentStepIndex(status);

  const failMessages = {
    REJECTED:
      "After careful review, we're unable to move forward with your application this time. We'd love to see you try again in the future!",
    EXAM_FAILED:
      "Unfortunately you didn't clear the written exam this time. Keep building and we hope to see you again!",
    INTERVIEW_FAILED:
      "Thank you for interviewing with us. We won't be moving forward this time, but we appreciate your enthusiasm.",
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="relative bg-[rgba(8,15,22,0.5)] border border-[rgba(94,234,240,0.32)] rounded-[20px] shadow-[0_16px_50px_rgba(0,0,0,0.3),inset_0_1px_rgba(255,255,255,0.08),inset_0_0_35px_rgba(94,234,240,0.035)] backdrop-blur-[20px] p-8 sm:p-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img
                src={ANARC}
                alt="ANARC"
                className="w-10 h-10 object-contain"
              />
              <div>
                <div className="text-[#8fd8dd] font-mono text-[0.65rem] tracking-[0.16em] uppercase">
                  ANARC · Application
                </div>
                <h2 className="text-[#e9eef2] font-semibold text-base">
                  {name}
                </h2>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-xs text-[#55636d] hover:text-[#4dd9e8] transition-colors border border-[rgba(138,164,178,0.15)] rounded-lg px-3 py-1.5"
            >
              Sign out
            </button>
          </div>

          {/* Info row */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { label: "Email", value: email },
              { label: "Roll Number", value: rollNumber },
              { label: "Branch", value: branch },
              { label: "Year", value: year },
              batch && { label: "Batch", value: batch },
            ]
              .filter(Boolean)
              .map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-[rgba(138,164,178,0.1)] bg-[rgba(7,12,18,0.4)] px-4 py-3"
                >
                  <p className="text-[10px] uppercase tracking-wider text-[#55636d] mb-0.5">
                    {label}
                  </p>
                  <p className="text-sm text-[#e9eef2] truncate">{value}</p>
                </div>
              ))}
          </div>

          {/* Failed state */}
          {isFailed ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-[#96a3ad] leading-relaxed">
              <p className="text-red-400 font-semibold text-xs uppercase tracking-wider mb-2">
                Application Closed
              </p>
              {failMessages[status]}
            </div>
          ) : (
            <>
              {/* Progress stepper */}
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-wider text-[#55636d] mb-4">
                  Progress
                </p>
                <div className="flex flex-col gap-0">
                  {STATUS_STEPS.map((step, i) => {
                    const done =
                      i < stepIndex ||
                      (stepIndex === -1 ? false : i <= stepIndex);
                    const current = i === stepIndex;
                    const future = i > stepIndex;
                    return (
                      <div key={step.key} className="flex gap-4 items-start">
                        {/* Line + dot */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 transition-all duration-300
                            ${
                              current
                                ? "bg-[#4dd9e8] shadow-[0_0_10px_rgba(77,217,232,0.6)]"
                                : done
                                  ? "bg-[#4dd9e8]"
                                  : "bg-[rgba(138,164,178,0.15)] border border-[rgba(138,164,178,0.2)]"
                            }`}
                          />
                          {i < STATUS_STEPS.length - 1 && (
                            <div
                              className={`w-px flex-1 min-h-[24px] mt-1
                              ${i < stepIndex ? "bg-[#4dd9e8]" : "bg-[rgba(138,164,178,0.12)]"}`}
                            />
                          )}
                        </div>
                        {/* Text */}
                        <div className="pb-5">
                          <p
                            className={`text-sm font-medium ${current ? "text-[#4dd9e8]" : done ? "text-[#e9eef2]" : "text-[#55636d]"}`}
                          >
                            {step.label}
                            {current && (
                              <span className="ml-2 text-[10px] font-bold tracking-widest text-[#4dd9e8] uppercase">
                                ← Current
                              </span>
                            )}
                          </p>
                          {(current || done) && (
                            <p className="text-xs text-[#55636d] mt-0.5">
                              {step.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Exam details */}
              {admitCard && (
                <div className="rounded-xl border border-[rgba(94,234,240,0.15)] bg-[rgba(94,234,240,0.03)] px-5 py-4 mb-4">
                  <p className="text-[10px] uppercase tracking-wider text-[#4dd9e8] mb-3 font-semibold">
                    Exam Details
                  </p>
                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#55636d]">Date & Time</span>
                      <span className="text-[#e9eef2]">
                        {new Date(admitCard.examDate).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#55636d]">Venue</span>
                      <span className="text-[#e9eef2]">
                        {admitCard.venue || "To be announced"}
                      </span>
                    </div>
                    {admitCard.examScore !== null &&
                      admitCard.examScore !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-[#55636d]">Score</span>
                          <span
                            className={
                              admitCard.isPassed
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {admitCard.examScore} / {admitCard.maxScore}
                          </span>
                        </div>
                      )}
                  </div>
                  {/* Download admit card button — only before exam result */}

                  {admitCard.examScore === null && (
                    <a
                      href={`${API}/application/admit-card/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-block w-full text-center rounded-xl border border-[rgba(94,234,240,0.32)] bg-[rgba(94,234,240,0.05)] py-2.5 text-xs font-semibold text-[#4dd9e8] tracking-wide hover:bg-[rgba(94,234,240,0.10)] hover:border-[rgba(94,234,240,0.75)] transition-all duration-300"
                    >
                      Download Admit Card
                    </a>
                  )}
                </div>
              )}

              {/* Interview details */}
              {interviewInvite && (
                <div className="rounded-xl border border-[rgba(94,234,240,0.15)] bg-[rgba(94,234,240,0.03)] px-5 py-4">
                  <p className="text-[10px] uppercase tracking-wider text-[#4dd9e8] mb-3 font-semibold">
                    Interview Details
                  </p>
                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#55636d]">Date & Time</span>
                      <span className="text-[#e9eef2]">
                        {new Date(interviewInvite.date).toLocaleString(
                          "en-IN",
                          { dateStyle: "medium", timeStyle: "short" },
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#55636d]">Venue</span>
                      <span className="text-[#e9eef2]">
                        {interviewInvite.venue || "To be announced"}
                      </span>
                    </div>
                    {interviewInvite.interviewScore !== null &&
                      interviewInvite.interviewScore !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-[#55636d]">Score</span>
                          <span
                            className={
                              interviewInvite.isPassed
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {interviewInvite.interviewScore} /{" "}
                            {interviewInvite.maxScore}
                          </span>
                        </div>
                      )}
                    {interviewInvite.feedback && (
                      <div className="mt-2 text-xs text-[#55636d] italic border-t border-[rgba(138,164,178,0.1)] pt-2">
                        "{interviewInvite.feedback}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Track Status Modal ────────────────────────────────────────────────────────
function TrackStatusModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/applicant/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("applicant_token", data.token);
      localStorage.setItem("applicant_user", JSON.stringify(data.application));
      onSuccess(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm bg-[rgba(8,15,22,0.95)] border border-[rgba(94,234,240,0.32)] rounded-[20px] shadow-[0_16px_50px_rgba(0,0,0,0.3),inset_0_1px_rgba(255,255,255,0.08),inset_0_0_35px_rgba(94,234,240,0.035)] backdrop-blur-[20px] p-8">
        <div className="flex flex-col items-center mb-6">
          <img
            src={ANARC}
            alt="ANARC Logo"
            className="w-16 h-16 object-contain"
          />
        </div>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1 text-[#8fd8dd] font-mono text-[0.7rem] tracking-[0.16em] uppercase">
              <div className="w-[18px] h-px bg-[#d99a5b] shadow-[0_0_8px_rgba(217,154,91,0.8)]" />
              ANARC · STATUS
            </div>
            <h3 className="text-[#e9eef2] font-semibold text-base">
              Track Application
            </h3>
            <p className="text-[#96a3ad] text-xs mt-0.5">
              Sign in with your applicant credentials
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors text-2xl leading-none mt-1"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Email Address">
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => {
                setForm((f) => ({ ...f, email: e.target.value }));
                setError("");
              }}
              placeholder="john@example.com"
              className={inputClass}
            />
          </Field>
          <Field label="Password">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => {
                  setForm((f) => ({ ...f, password: e.target.value }));
                  setError("");
                }}
                placeholder="Your application password"
                className={inputClass + " pr-11"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#55636d] hover:text-[#4dd9e8] transition-colors"
              >
                {showPassword ? (
                  <EyeOffIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </Field>

          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border border-[rgba(94,234,240,0.32)] bg-[rgba(94,234,240,0.05)] py-3 text-sm font-semibold text-[#4dd9e8] tracking-wide transition-all duration-300 hover:bg-[rgba(94,234,240,0.10)] hover:border-[rgba(94,234,240,0.75)] hover:shadow-[0_0_20px_rgba(77,217,232,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "View My Status"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}

// ── Main Apply Page ───────────────────────────────────────────────────────────
export default function ApplyPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rollNumber: "",
    branch: "",
    year: "",
    batch: "",
    reason: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);

  // Status dashboard state
  const [applicantToken, setApplicantToken] = useState(() =>
    localStorage.getItem("applicant_token"),
  );
  const [application, setApplication] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");

  // Fetch status whenever we have a token
  useEffect(() => {
    if (!applicantToken) return;
    setStatusLoading(true);
    setStatusError("");
    fetch(`${API}/application/status`, {
      headers: { Authorization: `Bearer ${applicantToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setApplication(data);
      })
      .catch((err) => {
        setStatusError(err.message);
        // token probably expired — clear it
        localStorage.removeItem("applicant_token");
        localStorage.removeItem("applicant_user");
        setApplicantToken(null);
      })
      .finally(() => setStatusLoading(false));
  }, [applicantToken]);

  const handleLogout = () => {
    localStorage.removeItem("applicant_token");
    localStorage.removeItem("applicant_user");
    setApplicantToken(null);
    setApplication(null);
  };

  // Show dashboard if logged in
  if (applicantToken) {
    if (statusLoading)
      return (
        <div className="min-h-screen flex items-center justify-center text-[#55636d] text-sm">
          Loading your status...
        </div>
      );
    if (statusError)
      return (
        <div className="min-h-screen flex items-center justify-center text-red-400 text-sm">
          {statusError}
        </div>
      );
    if (application)
      return (
        <StatusDashboard application={application} onLogout={handleLogout} />
      );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          rollNumber: form.rollNumber,
          branch: form.branch,
          year: form.year,
          batch: form.batch,
          reason: form.reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSuccess(
        "Application submitted! Use your email and password to track your status.",
      );
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
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
    <>
      {showTrackModal && (
        <TrackStatusModal
          onClose={() => setShowTrackModal(false)}
          onSuccess={(token) => {
            setApplicantToken(token);
            setShowTrackModal(false);
          }}
        />
      )}

      <div className="min-h-screen w-full flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="relative bg-[rgba(8,15,22,0.5)] border border-[rgba(94,234,240,0.32)] rounded-[20px] shadow-[0_16px_50px_rgba(0,0,0,0.3),inset_0_1px_rgba(255,255,255,0.08),inset_0_0_35px_rgba(94,234,240,0.035)] backdrop-blur-[20px] p-8 sm:p-10">
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors text-2xl leading-none"
            >
              ×
            </button>

            <div className="flex flex-col items-center mb-6">
              <img
                src={ANARC}
                alt="ANARC Logo"
                className="w-16 h-16 object-contain"
              />
            </div>

            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-[10px] mb-3 text-[#8fd8dd] font-mono text-[0.75rem] font-bold tracking-[0.16em]">
                <div className="w-[26px] h-px bg-[#d99a5b] shadow-[0_0_8px_rgba(217,154,91,0.8)]" />
                <span>ANARC · ROBOTICS CLUB</span>
                <div className="w-[26px] h-px bg-[#d99a5b] shadow-[0_0_8px_rgba(217,154,91,0.8)]" />
              </div>
              <h1 className="text-2xl font-semibold text-[#e9eef2] tracking-tight">
                Apply to Join
              </h1>
              <p className="text-[#96a3ad] text-sm mt-1">
                Fill in the form below to submit your application.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Field label="Full Name">
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={inputClass}
                />
              </Field>
              <Field label="Email Address">
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className={inputClass}
                />
              </Field>
              <Field label="Roll Number">
                <input
                  name="rollNumber"
                  type="text"
                  required
                  value={form.rollNumber}
                  onChange={handleChange}
                  placeholder="21CSE1234"
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Branch">
                  <input
                    name="branch"
                    type="text"
                    required
                    value={form.branch}
                    onChange={handleChange}
                    placeholder="CSE"
                    className={inputClass}
                  />
                </Field>
                <Field label="Year">
                  <select
                    name="year"
                    required
                    value={form.year}
                    onChange={handleChange}
                    className={inputClass + " appearance-none"}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="FIRST">1st Year</option>
                    <option value="SECOND">2nd Year</option>
                    <option value="THIRD">3rd Year</option>
                    <option value="FOURTH">4th Year</option>
                  </select>
                </Field>
              </div>

              {/* batch — optional, no placeholder */}
              {/* <Field label="Batch (optional)">
                <input
                  name="batch"
                  type="text"
                  value={form.batch}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field> */}

              <Field label="Create Password">
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Used to track your application"
                    className={inputClass + " pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#55636d] hover:text-[#4dd9e8] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </Field>

              <Field label="Confirm Password">
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className={inputClass + " pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#55636d] hover:text-[#4dd9e8] transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOffIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </Field>

              <Field label="Why do you want to join?">
                <textarea
                  name="reason"
                  required
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="Tell us why you want to be part of ANARC..."
                  rows={4}
                  className={inputClass + " resize-none"}
                />
              </Field>

              {error && (
                <p className="text-xs text-red-400 flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                  {error}
                </p>
              )}
              {success && (
                <p className="text-xs text-green-400 flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 rounded-full bg-green-400" />
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl border border-[rgba(94,234,240,0.32)] bg-[rgba(94,234,240,0.05)] py-3.5 text-sm font-semibold text-[#4dd9e8] tracking-wide transition-all duration-300 hover:bg-[rgba(94,234,240,0.10)] hover:border-[rgba(94,234,240,0.75)] hover:shadow-[0_0_20px_rgba(77,217,232,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[#55636d] text-xs">already applied?</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <button
                type="button"
                onClick={() => setShowTrackModal(true)}
                className="w-full rounded-xl border border-[rgba(138,164,178,0.2)] bg-transparent py-3.5 text-sm font-medium text-[#96a3ad] tracking-wide transition-all duration-300 hover:border-[rgba(94,234,240,0.32)] hover:text-[#e9eef2]"
              >
                Track My Application Status
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
