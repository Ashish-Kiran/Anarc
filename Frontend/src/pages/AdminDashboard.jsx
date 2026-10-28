import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000";
const tabs = ["Applications", "Invite", "Announcements", "Events", "Projects"];

function getToken() {
  return localStorage.getItem("token");
}
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const colors = {
    PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    ACCEPTED: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/30",
    EXAM_PASSED: "bg-green-500/10 text-green-400 border-green-500/30",
    EXAM_FAILED: "bg-red-500/10 text-red-400 border-red-500/30",
    INTERVIEW_SCHEDULED:
      "bg-purple-500/10 text-purple-400 border-purple-500/30",
    INTERVIEW_PASSED: "bg-green-500/10 text-green-400 border-green-500/30",
    INTERVIEW_FAILED: "bg-red-500/10 text-red-400 border-red-500/30",
    CONVERTED:
      "bg-[rgba(77,217,232,0.1)] text-[#4dd9e8] border-[rgba(77,217,232,0.3)]",
  };
  return (
    <span
      className={`text-[10px] font-bold tracking-[0.15em] px-2.5 py-0.5 rounded-lg border ${colors[status] || "bg-white/10 text-white/60 border-white/20"}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md bg-[rgba(8,15,22,0.95)] border border-[rgba(94,234,240,0.32)] rounded-[20px] shadow-[0_16px_50px_rgba(0,0,0,0.3),inset_0_1px_rgba(255,255,255,0.08),inset_0_0_35px_rgba(94,234,240,0.035)] backdrop-blur-[20px] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[#8fd8dd] font-mono text-[0.65rem] tracking-[0.16em] uppercase mb-1">
              ANARC · ADMIN
            </p>
            <h3 className="text-[#e9eef2] font-semibold text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, type, ...props }) {
  const inputClass =
    "w-full rounded-xl border border-[rgba(138,164,178,0.2)] bg-[rgba(7,12,18,0.5)] px-4 py-3.5 text-sm text-[#e9eef2] caret-[#4dd9e8] placeholder-[#55636d] outline-none transition-all duration-300 focus:border-[rgba(94,234,240,0.5)] focus:shadow-[0_0_0_2px_rgba(77,217,232,0.08),0_0_12px_rgba(77,217,232,0.15)]";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea {...props} rows={3} className={inputClass + " resize-none"} />
      ) : (
        <input type={type || "text"} {...props} className={inputClass} />
      )}
    </div>
  );
}

function ActionBtn({ onClick, color = "cyan", children, disabled }) {
  const colors = {
    cyan: "border-[rgba(94,234,240,0.32)] text-[#4dd9e8] hover:bg-[rgba(94,234,240,0.10)] hover:border-[rgba(94,234,240,0.75)] hover:shadow-[0_0_16px_rgba(77,217,232,0.2)]",
    green:
      "border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/60",
    red: "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60",
    amber:
      "border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/60",
    purple:
      "border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/60",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-xs px-3 py-1.5 rounded-xl border font-semibold tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${colors[color]}`}
    >
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20 gap-3">
      <div className="w-4 h-4 rounded-full border-2 border-[#4dd9e8] border-t-transparent animate-spin" />
      <p className="text-[#55636d] text-sm">Loading...</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p className="text-red-400 text-sm">{message}</p>
      <ActionBtn onClick={onRetry} color="cyan">
        Retry
      </ActionBtn>
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-10 h-10 rounded-xl border border-[rgba(94,234,240,0.2)] bg-[rgba(77,217,232,0.04)] flex items-center justify-center">
        <svg
          className="w-5 h-5 text-[#4dd9e8]/40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <p className="text-[#55636d] text-sm">No {label} yet</p>
    </div>
  );
}

function FormError({ msg }) {
  if (!msg) return null;
  return (
    <p className="text-xs text-red-400 flex items-center gap-1.5">
      <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
      {msg}
    </p>
  );
}

// ── Applications Tab ──────────────────────────────────────────────────────────
const STATUS_FILTERS = [
  "All",
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "EXAM_PASSED",
  "EXAM_FAILED",
  "INTERVIEW_SCHEDULED",
  "INTERVIEW_PASSED",
  "INTERVIEW_FAILED",
  "CONVERTED",
];

function ApplicationsTab() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(null); // { type, app }
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const url =
        filter === "All"
          ? `${API}/applications`
          : `${API}/applications?status=${filter}`;
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch applications");
      setApplications(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const closeModal = () => {
    setModal(null);
    setForm({});
    setActionError("");
  };

  const doAction = async (path, method = "POST", body = null) => {
    setSubmitting(true);
    setActionError("");
    try {
      const res = await fetch(`${API}${path}`, {
        method,
        headers: authHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      closeModal();
      await fetchApplications();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={fetchApplications} />;

  return (
    <>
      {/* Admit Card Modal */}
      {modal?.type === "admitCard" && (
        <Modal title="Issue Admit Card" onClose={closeModal}>
          <div className="flex flex-col gap-4">
            <Field
              label="Exam Date & Time"
              type="datetime-local"
              value={form.examDate || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, examDate: e.target.value }))
              }
            />
            <Field
              label="Venue"
              placeholder="e.g. SAC Building, Room 101"
              value={form.venue || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, venue: e.target.value }))
              }
            />
            <FormError msg={actionError} />
            <div className="flex gap-3 justify-end">
              <ActionBtn onClick={closeModal} color="amber">
                Cancel
              </ActionBtn>
              <ActionBtn
                color="cyan"
                disabled={submitting}
                onClick={() =>
                  doAction(`/application/${modal.app.id}/admit-card`, "POST", {
                    examDate: form.examDate,
                    venue: form.venue,
                  })
                }
              >
                {submitting ? "Issuing..." : "Issue Admit Card"}
              </ActionBtn>
            </div>
          </div>
        </Modal>
      )}

      {/* Exam Result Modal */}
      {modal?.type === "examResult" && (
        <Modal title="Submit Exam Result" onClose={closeModal}>
          <div className="flex flex-col gap-4">
            <Field
              label="Exam Score"
              type="number"
              placeholder="e.g. 75"
              value={form.examScore || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, examScore: Number(e.target.value) }))
              }
            />
            <Field
              label="Max Score"
              type="number"
              placeholder="e.g. 100"
              value={form.maxScore || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, maxScore: Number(e.target.value) }))
              }
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                Result
              </label>
              <div className="flex gap-3">
                <ActionBtn
                  color="green"
                  onClick={() => setForm((f) => ({ ...f, isPassed: true }))}
                  disabled={false}
                >
                  {form.isPassed === true ? "✓ Passed" : "Passed"}
                </ActionBtn>
                <ActionBtn
                  color="red"
                  onClick={() => setForm((f) => ({ ...f, isPassed: false }))}
                >
                  {form.isPassed === false ? "✓ Failed" : "Failed"}
                </ActionBtn>
              </div>
            </div>
            <FormError msg={actionError} />
            <div className="flex gap-3 justify-end">
              <ActionBtn onClick={closeModal} color="amber">
                Cancel
              </ActionBtn>
              <ActionBtn
                color="cyan"
                disabled={submitting || form.isPassed === undefined}
                onClick={() =>
                  doAction(`/application/${modal.app.id}/exam-result`, "POST", {
                    examScore: form.examScore,
                    maxScore: form.maxScore,
                    isPassed: form.isPassed,
                  })
                }
              >
                {submitting ? "Submitting..." : "Submit Result"}
              </ActionBtn>
            </div>
          </div>
        </Modal>
      )}

      {/* Interview Invite Modal */}
      {modal?.type === "interviewInvite" && (
        <Modal title="Send Interview Invite" onClose={closeModal}>
          <div className="flex flex-col gap-4">
            <Field
              label="Interview Date & Time"
              type="datetime-local"
              value={form.date || ""}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
            <Field
              label="Venue"
              placeholder="e.g. Director's Conference Room"
              value={form.venue || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, venue: e.target.value }))
              }
            />
            <FormError msg={actionError} />
            <div className="flex gap-3 justify-end">
              <ActionBtn onClick={closeModal} color="amber">
                Cancel
              </ActionBtn>
              <ActionBtn
                color="cyan"
                disabled={submitting}
                onClick={() =>
                  doAction(
                    `/application/${modal.app.id}/interview-invite`,
                    "POST",
                    { date: form.date, venue: form.venue },
                  )
                }
              >
                {submitting ? "Sending..." : "Send Invite"}
              </ActionBtn>
            </div>
          </div>
        </Modal>
      )}

      {/* Interview Result Modal */}
      {modal?.type === "interviewResult" && (
        <Modal title="Submit Interview Result" onClose={closeModal}>
          <div className="flex flex-col gap-4">
            <Field
              label="Interview Score"
              type="number"
              placeholder="e.g. 40"
              value={form.interviewScore || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  interviewScore: Number(e.target.value),
                }))
              }
            />
            <Field
              label="Max Score"
              type="number"
              placeholder="e.g. 50"
              value={form.maxScore || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, maxScore: Number(e.target.value) }))
              }
            />
            <Field
              label="Feedback (optional)"
              type="textarea"
              placeholder="Write feedback for the candidate..."
              value={form.feedback || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, feedback: e.target.value }))
              }
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                Result
              </label>
              <div className="flex gap-3">
                <ActionBtn
                  color="green"
                  onClick={() => setForm((f) => ({ ...f, isPassed: true }))}
                >
                  {form.isPassed === true ? "✓ Passed" : "Passed"}
                </ActionBtn>
                <ActionBtn
                  color="red"
                  onClick={() => setForm((f) => ({ ...f, isPassed: false }))}
                >
                  {form.isPassed === false ? "✓ Failed" : "Failed"}
                </ActionBtn>
              </div>
            </div>
            <FormError msg={actionError} />
            <div className="flex gap-3 justify-end">
              <ActionBtn onClick={closeModal} color="amber">
                Cancel
              </ActionBtn>
              <ActionBtn
                color="cyan"
                disabled={submitting || form.isPassed === undefined}
                onClick={() =>
                  doAction(
                    `/application/${modal.app.id}/interview-result`,
                    "POST",
                    {
                      interviewScore: form.interviewScore,
                      maxScore: form.maxScore,
                      isPassed: form.isPassed,
                      feedback: form.feedback,
                    },
                  )
                }
              >
                {submitting ? "Submitting..." : "Submit Result"}
              </ActionBtn>
            </div>
          </div>
        </Modal>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[#e9eef2] font-semibold text-base">
            Applications
          </h2>
          <p className="text-[#55636d] text-xs mt-0.5">
            {applications.length} shown
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-xl border font-semibold tracking-wide transition-all duration-200 ${
              filter === s
                ? "border-[#4dd9e8] bg-[rgba(77,217,232,0.1)] text-[#4dd9e8]"
                : "border-[rgba(138,164,178,0.15)] text-[#55636d] hover:text-[#96a3ad] hover:border-[rgba(138,164,178,0.3)]"
            }`}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {applications.length === 0 && <EmptyState label="applications" />}

      <div className="flex flex-col gap-3">
        {applications.map((app) => (
          <div
            key={app.id}
            className="rounded-xl border border-[rgba(138,164,178,0.15)] bg-[rgba(7,12,18,0.4)] px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 transition-all duration-200 hover:border-[rgba(94,234,240,0.2)]"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <p className="text-sm font-medium text-[#e9eef2]">{app.name}</p>
                <StatusBadge status={app.status} />
              </div>
              <p className="text-xs text-[#55636d]">
                {app.email} · {app.rollNumber} · {app.branch} · {app.year}
              </p>
              {app.reason && (
                <p className="text-xs text-[#96a3ad] mt-1.5 line-clamp-2">
                  {app.reason}
                </p>
              )}
              <p className="text-xs text-[#55636d] mt-1">
                Applied{" "}
                {new Date(app.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Context-sensitive actions */}
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              {app.status === "PENDING" && (
                <>
                  <ActionBtn
                    color="green"
                    onClick={() => doAction(`/application/${app.id}/accept`)}
                  >
                    Accept
                  </ActionBtn>
                  <ActionBtn
                    color="red"
                    onClick={() => doAction(`/application/${app.id}/reject`)}
                  >
                    Reject
                  </ActionBtn>
                </>
              )}
              {app.status === "ACCEPTED" && !app.admitCard && (
                <ActionBtn
                  color="cyan"
                  onClick={() => {
                    setModal({ type: "admitCard", app });
                    setActionError("");
                  }}
                >
                  Issue Admit Card
                </ActionBtn>
              )}
              {app.status === "ACCEPTED" &&
                app.admitCard &&
                !app.admitCard.examScore && (
                  <ActionBtn
                    color="purple"
                    onClick={() => {
                      setModal({ type: "examResult", app });
                      setActionError("");
                    }}
                  >
                    Submit Exam Result
                  </ActionBtn>
                )}
              {app.status === "EXAM_PASSED" && !app.interviewInvite && (
                <ActionBtn
                  color="cyan"
                  onClick={() => {
                    setModal({ type: "interviewInvite", app });
                    setActionError("");
                  }}
                >
                  Send Interview Invite
                </ActionBtn>
              )}
              {app.status === "INTERVIEW_SCHEDULED" && (
                <ActionBtn
                  color="purple"
                  onClick={() => {
                    setModal({ type: "interviewResult", app });
                    setActionError("");
                  }}
                >
                  Submit Interview Result
                </ActionBtn>
              )}
              {app.status === "INTERVIEW_PASSED" && (
                <ActionBtn
                  color="green"
                  onClick={() => doAction(`/application/${app.id}/convert`)}
                >
                  Convert to Member
                </ActionBtn>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Invite Tab ────────────────────────────────────────────────────────────────
function InviteTab() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleInvite = async () => {
    if (!email.trim() || !name.trim()) return;
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API}/admin/invite`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invite");
      setSuccess(data.message);
      setName("");
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-[#e9eef2] font-semibold text-base mb-1">
        Invite a Member
      </h2>
      <p className="text-[#55636d] text-xs mb-6">
        Send an invite link via email. The link expires in 48 hours and can only
        be used once.
      </p>
      <div className="flex flex-col gap-4">
        <Field
          label="Name"
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
            setSuccess("");
          }}
        />
        <Field
          label="Email Address"
          type="email"
          placeholder="member@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
            setSuccess("");
          }}
        />
        {error && <FormError msg={error} />}
        {success && (
          <p className="text-xs text-green-400 flex items-center gap-1.5">
            <span className="inline-block w-1 h-1 rounded-full bg-green-400" />
            {success}
          </p>
        )}
        <ActionBtn
          color="cyan"
          onClick={handleInvite}
          disabled={submitting || !email.trim() || !name.trim()}
        >
          {submitting ? "Sending..." : "Send Invite"}
        </ActionBtn>
      </div>
    </div>
  );
}
// ── Announcements Tab ─────────────────────────────────────────────────────────

function AnnouncementForm({
  formTitle,
  setFormTitle,
  formImageUrl,
  setFormImageUrl,
  formContent,
  setFormContent,
  uploading,
  submitting,
  actionError,
  onSubmit,
  submitLabel,
  submittingLabel,
  onClose,
  onImageUpload,
}) {
  return (
    <div className="flex flex-col gap-4">
      <Field
        label="Title"
        type="text"
        placeholder="Announcement title"
        value={formTitle}
        onChange={(e) => setFormTitle(e.target.value)}
      />

      <div>
        <label className="text-[11px] tracking-[0.12em] text-[#4dd9e8] uppercase font-semibold mb-1.5 block">
          Image
        </label>
        <div className="flex items-center gap-3">
          {formImageUrl && (
            <img
              src={formImageUrl}
              alt="preview"
              className="w-14 h-14 rounded-lg object-cover border border-[rgba(94,234,240,0.2)]"
            />
          )}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => onImageUpload(e.target.files?.[0])}
            className="text-xs text-[#96a3ad] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[rgba(77,217,232,0.3)] file:bg-[rgba(77,217,232,0.05)] file:text-[#4dd9e8] file:text-xs file:cursor-pointer hover:file:bg-[rgba(77,217,232,0.1)] transition-all"
          />
          {uploading && (
            <span className="text-xs text-[#55636d] animate-pulse">
              Uploading...
            </span>
          )}
        </div>
      </div>

      <Field
        label="Content"
        type="textarea"
        placeholder="Write your announcement..."
        value={formContent}
        onChange={(e) => setFormContent(e.target.value)}
      />
      <FormError msg={actionError} />
      <div className="flex gap-3 justify-end">
        <ActionBtn onClick={onClose} color="amber">
          Cancel
        </ActionBtn>
        <ActionBtn
          onClick={onSubmit}
          color="cyan"
          disabled={submitting || uploading}
        >
          {submitting ? submittingLabel : submitLabel}
        </ActionBtn>
      </div>
    </div>
  );
}

// ── AnnouncementsTab ──────────────────────────────────────────────────────────
function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formContent, setFormContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/admin/announcements`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch");
      setAnnouncements(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const closeModals = () => {
    setShowCreate(false);
    setEditTarget(null);
    setDeleteTarget(null);
    setFormTitle("");
    setFormImageUrl("");
    setFormContent("");
    setActionError("");
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setActionError("");
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      const body = new FormData();
      body.append("file", file);
      body.append("upload_preset", preset);
      body.append("folder", "Anarc/announcements"); // ← subfolder

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body,
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Image upload failed");
      setFormImageUrl(data.secure_url);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    setSubmitting(true);
    setActionError("");
    try {
      const res = await fetch(`${API}/announcement`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: formTitle,
          imageUrl: formImageUrl,
          content: formContent,
          isActive: false,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      closeModals();
      await fetchAnnouncements();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    setSubmitting(true);
    setActionError("");
    try {
      const res = await fetch(`${API}/announcement/${editTarget.id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          title: formTitle,
          imageUrl: formImageUrl,
          content: formContent,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      closeModals();
      await fetchAnnouncements();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await fetch(`${API}/announcement/${id}/toggle`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      await fetchAnnouncements();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    setActionError("");
    try {
      const res = await fetch(`${API}/announcement/${deleteTarget.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      closeModals();
      await fetchAnnouncements();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={fetchAnnouncements} />;

  const sharedFormProps = {
    formTitle,
    setFormTitle,
    formImageUrl,
    setFormImageUrl,
    formContent,
    setFormContent,
    uploading,
    submitting,
    actionError,
    onClose: closeModals,
    onImageUpload: handleImageUpload,
  };

  return (
    <>
      {showCreate && (
        <Modal title="New Announcement" onClose={closeModals}>
          <AnnouncementForm
            {...sharedFormProps}
            onSubmit={handleCreate}
            submitLabel="Create"
            submittingLabel="Creating..."
          />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Edit Announcement" onClose={closeModals}>
          <AnnouncementForm
            {...sharedFormProps}
            onSubmit={handleEdit}
            submitLabel="Save Changes"
            submittingLabel="Saving..."
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Announcement" onClose={closeModals}>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#96a3ad]">This cannot be undone.</p>
            <div className="rounded-xl border border-[rgba(138,164,178,0.15)] bg-[rgba(7,12,18,0.5)] px-4 py-3 text-sm text-[#55636d] italic">
              "{deleteTarget.title}"
            </div>
            <FormError msg={actionError} />
            <div className="flex gap-3 justify-end">
              <ActionBtn onClick={closeModals} color="cyan">
                Cancel
              </ActionBtn>
              <ActionBtn
                onClick={handleDelete}
                color="red"
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Delete"}
              </ActionBtn>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[#e9eef2] font-semibold text-base">
            Announcements
          </h2>
          <p className="text-[#55636d] text-xs mt-0.5">
            {announcements.length} total ·{" "}
            {announcements.filter((a) => a.isActive).length} active
          </p>
        </div>
        <ActionBtn
          onClick={() => {
            setShowCreate(true);
            setFormTitle("");
            setFormImageUrl("");
            setFormContent("");
            setActionError("");
          }}
          color="cyan"
        >
          + New Announcement
        </ActionBtn>
      </div>

      {announcements.length === 0 && <EmptyState label="announcements" />}

      <div className="flex flex-col gap-3">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="rounded-xl border border-[rgba(138,164,178,0.15)] bg-[rgba(7,12,18,0.4)] px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 transition-all duration-200 hover:border-[rgba(94,234,240,0.2)]"
          >
            <div className="flex gap-3 flex-1 min-w-0">
              {a.imageUrl && (
                <img
                  src={a.imageUrl}
                  alt={a.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-[rgba(94,234,240,0.15)]"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#e9eef2]">{a.title}</p>
                <p className="text-sm text-[#96a3ad] leading-relaxed mt-0.5">
                  {a.content}
                </p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-xs text-[#55636d]">
                    by {a.author?.name}
                  </span>
                  <span className="text-xs text-[#55636d]">·</span>
                  <span className="text-xs text-[#55636d]">
                    {new Date(a.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-xs text-[#55636d]">·</span>
                  <span
                    className={`text-[10px] font-bold tracking-[0.12em] px-2 py-0.5 rounded-lg border ${a.isActive ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-white/5 text-[#55636d] border-white/10"}`}
                  >
                    {a.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <ActionBtn
                onClick={() => handleToggle(a.id)}
                color={a.isActive ? "amber" : "green"}
              >
                {a.isActive ? "Deactivate" : "Activate"}
              </ActionBtn>
              <ActionBtn
                onClick={() => {
                  setEditTarget(a);
                  setFormTitle(a.title);
                  setFormImageUrl(a.imageUrl || "");
                  setFormContent(a.content);
                  setActionError("");
                }}
                color="cyan"
              >
                Edit
              </ActionBtn>
              <ActionBtn
                onClick={() => {
                  setDeleteTarget(a);
                  setActionError("");
                }}
                color="red"
              >
                Delete
              </ActionBtn>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
// ── Events Tab ────────────────────────────────────────────────────────────────

// ── EventForm ─────────────────────────────────────────────────────────────────
function EventForm({ form, setForm, actionError, uploading, onImageUpload }) {
  const updateItem = (index, field, value) => {
    const updated = [...form.items];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, items: updated });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { title: "", photo: "", explanation: "" }],
    });
  };

  const removeItem = (index) => {
    const updated = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: updated });
  };

  return (
    <div className="flex flex-col gap-4">
      <Field
        label="Name"
        type="text"
        placeholder="Event name (e.g. ANARC 2025)"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <Field
        label="Title"
        type="text"
        placeholder="Event title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <Field
        label="Description"
        type="textarea"
        placeholder="Describe the event..."
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <Field
        label="Date & Time"
        type="datetime-local"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
      />

      <Field
        label="Venue"
        type="text"
        placeholder="Event venue (optional)"
        value={form.venue}
        onChange={(e) => setForm({ ...form, venue: e.target.value })}
      />

      {/* ── Event Items ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] tracking-[0.12em] text-[#4dd9e8] uppercase font-semibold">
            Event Items
          </label>
          <ActionBtn onClick={addItem} color="cyan">
            + Add Item
          </ActionBtn>
        </div>

        {form.items.length === 0 && (
          <p className="text-xs text-[#55636d] text-center py-3 rounded-xl border border-dashed border-[rgba(94,234,240,0.15)]">
            No items yet — click "+ Add Item" to add one
          </p>
        )}

        <div className="flex flex-col gap-3">
          {form.items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-[rgba(138,164,178,0.15)] bg-[rgba(7,12,18,0.4)] p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-[0.12em] text-[#55636d] uppercase font-semibold">
                  Item {index + 1}
                </span>
                <ActionBtn onClick={() => removeItem(index)} color="red">
                  Remove
                </ActionBtn>
              </div>

              <Field
                label="Title"
                type="text"
                placeholder="Item title"
                value={item.title}
                onChange={(e) => updateItem(index, "title", e.target.value)}
              />

              {/* ── Image Upload ── */}
              <div>
                <label className="text-[11px] tracking-[0.12em] text-[#4dd9e8] uppercase font-semibold mb-1.5 block">
                  Image
                </label>
                <div className="flex items-center gap-3">
                  {item.photo && (
                    <img
                      src={item.photo}
                      alt="preview"
                      className="w-14 h-14 rounded-lg object-cover border border-[rgba(94,234,240,0.2)]"
                    />
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading[index]}
                    onChange={(e) => onImageUpload(index, e.target.files?.[0])}
                    className="text-xs text-[#96a3ad] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[rgba(77,217,232,0.3)] file:bg-[rgba(77,217,232,0.05)] file:text-[#4dd9e8] file:text-xs file:cursor-pointer hover:file:bg-[rgba(77,217,232,0.1)] transition-all"
                  />
                  {uploading[index] && (
                    <span className="text-xs text-[#55636d]">Uploading...</span>
                  )}
                </div>
              </div>

              <Field
                label="Explanation"
                type="textarea"
                placeholder="Describe this item..."
                value={item.explanation}
                onChange={(e) =>
                  updateItem(index, "explanation", e.target.value)
                }
              />
            </div>
          ))}
        </div>
      </div>

      <FormError msg={actionError} />
    </div>
  );
}

// ── EventsTab ─────────────────────────────────────────────────────────────────
function EventsTab() {
  const emptyForm = {
    name: "",
    title: "",
    description: "",
    date: "",
    venue: "",
    items: [],
  };

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  const jsonHeaders = () => ({
    ...authHeaders(),
    "Content-Type": "application/json",
  });

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/events`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch events");
      setEvents(await res.json());
    } catch (err) {
      console.error("Fetch events error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const closeModals = () => {
    setShowCreate(false);
    setEditTarget(null);
    setDeleteTarget(null);
    setForm(emptyForm);
    setUploading({});
    setActionError("");
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [index]: true }));
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      const body = new FormData();
      body.append("file", file);
      body.append("upload_preset", preset);
      body.append("folder", "Anarc/events");
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload failed");
      setForm((prev) => {
        const updated = [...prev.items];
        updated[index] = { ...updated[index], photo: data.secure_url };
        return { ...prev, items: updated };
      });
    } catch (err) {
      console.error("Image upload error:", err);
      setActionError("Image upload failed");
    } finally {
      setUploading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleCreate = async () => {
    setSubmitting(true);
    setActionError("");
    try {
      const res = await fetch(`${API}/events`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({
          ...form,
          authorId: JSON.parse(localStorage.getItem("user")).id,
        }),
      });
      if (!res.ok) throw new Error("Failed to create event");
      closeModals();
      await fetchEvents();
    } catch (err) {
      console.error("Create event error:", err);
      setActionError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    setSubmitting(true);
    setActionError("");
    try {
      const res = await fetch(`${API}/events/${editTarget.id}`, {
        method: "PUT",
        headers: jsonHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update event");
      closeModals();
      await fetchEvents();
    } catch (err) {
      console.error("Edit event error:", err);
      setActionError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await fetch(`${API}/events/${id}/toggle`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to toggle event");
      await fetchEvents();
    } catch (err) {
      console.error("Toggle event error:", err);
      setError("Something went wrong");
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    setActionError("");
    try {
      const res = await fetch(`${API}/events/${deleteTarget.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete event");
      closeModals();
      await fetchEvents();
    } catch (err) {
      console.error("Delete event error:", err);
      setActionError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={fetchEvents} />;

  const sharedFormProps = {
    form,
    setForm,
    actionError,
    uploading,
    onImageUpload: handleImageUpload,
  };

  return (
    <>
      {showCreate && (
        <Modal title="New Event" onClose={closeModals}>
          <div className="flex flex-col gap-4">
            <EventForm {...sharedFormProps} />
            <div className="flex gap-3 justify-end">
              <ActionBtn onClick={closeModals} color="amber">
                Cancel
              </ActionBtn>
              <ActionBtn
                onClick={handleCreate}
                color="cyan"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Event"}
              </ActionBtn>
            </div>
          </div>
        </Modal>
      )}

      {editTarget && (
        <Modal title="Edit Event" onClose={closeModals}>
          <div className="flex flex-col gap-4">
            <EventForm {...sharedFormProps} />
            <div className="flex gap-3 justify-end">
              <ActionBtn onClick={closeModals} color="amber">
                Cancel
              </ActionBtn>
              <ActionBtn
                onClick={handleEdit}
                color="cyan"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </ActionBtn>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Event" onClose={closeModals}>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#96a3ad]">
              Delete "
              <span className="text-[#e9eef2]">{deleteTarget.title}</span>"?
              This cannot be undone.
            </p>
            <FormError msg={actionError} />
            <div className="flex gap-3 justify-end">
              <ActionBtn onClick={closeModals} color="cyan">
                Cancel
              </ActionBtn>
              <ActionBtn
                onClick={handleDelete}
                color="red"
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Delete"}
              </ActionBtn>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[#e9eef2] font-semibold text-base">Events</h2>
          <p className="text-[#55636d] text-xs mt-0.5">
            {events.length} total · {events.filter((e) => e.isActive).length}{" "}
            active
          </p>
        </div>
        <ActionBtn
          onClick={() => {
            setShowCreate(true);
            setForm(emptyForm);
            setActionError("");
          }}
          color="cyan"
        >
          + New Event
        </ActionBtn>
      </div>

      {events.length === 0 && <EmptyState label="events" />}

      <div className="flex flex-col gap-3">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="rounded-xl border border-[rgba(138,164,178,0.15)] bg-[rgba(7,12,18,0.4)] px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 transition-all duration-200 hover:border-[rgba(94,234,240,0.2)]"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#4dd9e8] font-['DM_Mono',monospace] tracking-[0.1em] mb-1">
                ANARC · {ev.name}
              </p>
              <p className="text-sm font-medium text-[#e9eef2] mb-1">
                {ev.title}
              </p>
              <p className="text-xs text-[#96a3ad] line-clamp-2">
                {ev.description}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {ev.date && (
                  <span className="text-xs text-[#4dd9e8]">
                    {new Date(ev.date).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                )}
                <span className="text-xs text-[#55636d]">
                  · by {ev.author?.name}
                </span>
                <span className="text-xs text-[#55636d]">
                  · {ev.items?.length || 0} items
                </span>
                <span
                  className={`text-[10px] font-bold tracking-[0.12em] px-2 py-0.5 rounded-lg border ${ev.isActive ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-white/5 text-[#55636d] border-white/10"}`}
                >
                  {ev.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <ActionBtn
                onClick={() => handleToggle(ev.id)}
                color={ev.isActive ? "amber" : "green"}
              >
                {ev.isActive ? "Deactivate" : "Activate"}
              </ActionBtn>
              <ActionBtn
                onClick={() => {
                  setEditTarget(ev);
                  setForm({
                    name: ev.name,
                    title: ev.title,
                    description: ev.description,
                    date: ev.date
                      ? new Date(ev.date).toISOString().slice(0, 16)
                      : "",
                    venue: ev.venue || "",
                    items: ev.items || [],
                  });
                  setUploading({});
                  setActionError("");
                }}
                color="cyan"
              >
                Edit
              </ActionBtn>
              <ActionBtn
                onClick={() => {
                  setDeleteTarget(ev);
                  setActionError("");
                }}
                color="red"
              >
                Delete
              </ActionBtn>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
// ── Projects Tab ──────────────────────────────────────────────────────────────

function ProjectForm({ form, setForm, actionError }) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      const body = new FormData();
      body.append("file", file);
      body.append("upload_preset", preset);
      body.append("folder", "Anarc/projects");
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Something went wrong");
      setForm((f) => ({ ...f, imageUrl: data.secure_url }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Field
        label="Title *"
        placeholder="Project title"
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
      />
      <Field
        label="Description *"
        type="textarea"
        placeholder="Describe the project..."
        value={form.description}
        onChange={(e) =>
          setForm((f) => ({ ...f, description: e.target.value }))
        }
      />

      {/* Cloudinary Image Upload */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
          Image *
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="text-xs text-[#96a3ad] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[rgba(77,217,232,0.3)] file:bg-[rgba(77,217,232,0.05)] file:text-[#4dd9e8] file:text-xs file:cursor-pointer hover:file:bg-[rgba(77,217,232,0.1)] transition-all"
        />

        {uploading && (
          <p className="text-xs text-[#4dd9e8] animate-pulse">Uploading...</p>
        )}
        {form.imageUrl && !uploading && (
          <img
            src={form.imageUrl}
            alt="Preview"
            className="mt-1 h-24 w-full object-cover rounded-lg border border-[rgba(138,164,178,0.15)]"
          />
        )}
      </div>

      <Field
        label="GitHub URL"
        placeholder="https://github.com/..."
        value={form.githubUrl}
        onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))}
      />
      <div className="flex items-center gap-3">
        <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
          Active
        </label>
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
          className={`w-10 h-5 rounded-full border transition-all duration-300 relative ${form.isActive ? "bg-[rgba(77,217,232,0.2)] border-[#4dd9e8]" : "bg-white/5 border-white/10"}`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 ${form.isActive ? "left-5 bg-[#4dd9e8]" : "left-0.5 bg-white/30"}`}
          />
        </button>
        <span className="text-xs text-[#55636d]">
          {form.isActive ? "Visible on site" : "Hidden"}
        </span>
      </div>
      <FormError msg={actionError} />
    </div>
  );
}

function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    githubUrl: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/admin/projects`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch projects");
      setProjects(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const closeModals = () => {
    setShowCreate(false);
    setEditTarget(null);
    setDeleteTarget(null);
    setForm({
      title: "",
      description: "",
      imageUrl: "",
      githubUrl: "",
      isActive: true,
    });
    setActionError("");
  };

  const handleCreate = async () => {
    setSubmitting(true);
    setActionError("");
    try {
      const res = await fetch(`${API}/project`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      closeModals();
      await fetchProjects();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    setSubmitting(true);
    setActionError("");
    try {
      const res = await fetch(`${API}/project/${editTarget.id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      closeModals();
      await fetchProjects();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (p) => {
    try {
      await fetch(`${API}/project/${p.id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      await fetchProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    setActionError("");
    try {
      const res = await fetch(`${API}/project/${deleteTarget.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      closeModals();
      await fetchProjects();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={fetchProjects} />;

  return (
    <>
      {showCreate && (
        <Modal title="New Project" onClose={closeModals}>
          <div className="flex flex-col gap-4">
            <ProjectForm
              form={form}
              setForm={setForm}
              actionError={actionError}
            />
            <div className="flex gap-3 justify-end">
              <ActionBtn onClick={closeModals} color="amber">
                Cancel
              </ActionBtn>
              <ActionBtn
                onClick={handleCreate}
                color="cyan"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Project"}
              </ActionBtn>
            </div>
          </div>
        </Modal>
      )}

      {editTarget && (
        <Modal title="Edit Project" onClose={closeModals}>
          <div className="flex flex-col gap-4">
            <ProjectForm
              form={form}
              setForm={setForm}
              actionError={actionError}
            />
            <div className="flex gap-3 justify-end">
              <ActionBtn onClick={closeModals} color="amber">
                Cancel
              </ActionBtn>
              <ActionBtn
                onClick={handleEdit}
                color="cyan"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </ActionBtn>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Project" onClose={closeModals}>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#96a3ad]">
              Delete "
              <span className="text-[#e9eef2]">{deleteTarget.title}</span>"?
              This cannot be undone.
            </p>
            <FormError msg={actionError} />
            <div className="flex gap-3 justify-end">
              <ActionBtn onClick={closeModals} color="cyan">
                Cancel
              </ActionBtn>
              <ActionBtn
                onClick={handleDelete}
                color="red"
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Delete"}
              </ActionBtn>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[#e9eef2] font-semibold text-base">Projects</h2>
          <p className="text-[#55636d] text-xs mt-0.5">
            {projects.length} total ·{" "}
            {projects.filter((p) => p.isActive).length} active
          </p>
        </div>
        <ActionBtn
          onClick={() => {
            setShowCreate(true);
            setForm({
              title: "",
              description: "",
              imageUrl: "",
              githubUrl: "",
              isActive: true,
            });
            setActionError("");
          }}
          color="cyan"
        >
          + New Project
        </ActionBtn>
      </div>

      {projects.length === 0 && <EmptyState label="projects" />}

      <div className="flex flex-col gap-3">
        {projects.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-[rgba(138,164,178,0.15)] bg-[rgba(7,12,18,0.4)] px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 transition-all duration-200 hover:border-[rgba(94,234,240,0.2)]"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <p className="text-sm font-medium text-[#e9eef2]">{p.title}</p>
                <span
                  className={`text-[10px] font-bold tracking-[0.12em] px-2 py-0.5 rounded-lg border ${p.isActive ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-white/5 text-[#55636d] border-white/10"}`}
                >
                  {p.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <p className="text-xs text-[#96a3ad] line-clamp-2">
                {p.description}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {p.githubUrl && (
                  <a
                    href={p.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#4dd9e8] hover:underline"
                  >
                    GitHub ↗
                  </a>
                )}
                <span className="text-xs text-[#55636d]">
                  by {p.author?.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <ActionBtn
                onClick={() => handleToggle(p)}
                color={p.isActive ? "amber" : "green"}
              >
                {p.isActive ? "Deactivate" : "Activate"}
              </ActionBtn>
              <ActionBtn
                onClick={() => {
                  setEditTarget(p);
                  setForm({
                    title: p.title,
                    description: p.description,
                    imageUrl: p.imageUrl || "",
                    githubUrl: p.githubUrl || "",
                    isActive: p.isActive,
                  });
                  setActionError("");
                }}
                color="cyan"
              >
                Edit
              </ActionBtn>
              <ActionBtn
                onClick={() => {
                  setDeleteTarget(p);
                  setActionError("");
                }}
                color="red"
              >
                Delete
              </ActionBtn>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("Applications");
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (!token || !storedUser) {
        navigate("/login");
        return;
      }
      const u = JSON.parse(storedUser);
      if (u.siteRole !== "ADMIN") {
        navigate("/");
        return;
      }
      setUser(u);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen w-full px-4 sm:px-8 py-16 max-w-7xl mx-auto">
      <div className="w-full min-h-[80vh] relative bg-[rgba(8,15,22,0.5)] border border-[rgba(94,234,240,0.32)] rounded-[20px] shadow-[0_16px_50px_rgba(0,0,0,0.3),inset_0_1px_rgba(255,255,255,0.08),inset_0_0_35px_rgba(94,234,240,0.035)] backdrop-blur-[20px] overflow-visible">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-[rgba(94,234,240,0.1)]">
          <p className="text-[#8fd8dd] font-mono text-[0.7rem] font-bold tracking-[0.16em] uppercase mb-2">
            ANARC · Admin Panel
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#e9eef2] tracking-tight">
            Dashboard
          </h1>
          <p className="text-[#55636d] text-sm mt-1">
            Logged in as <span className="text-[#96a3ad]">{user?.name}</span>
          </p>
          <button
            onClick={() => navigate("/")}
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all duration-200"
          >
            ✕
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0 border-b border-[rgba(94,234,240,0.1)] overflow-x-auto px-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[#4dd9e8] text-[#4dd9e8]"
                  : "border-transparent text-[#55636d] hover:text-[#96a3ad]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6 sm:p-8">
          {activeTab === "Applications" && <ApplicationsTab />}
          {activeTab === "Invite" && <InviteTab />}
          {activeTab === "Announcements" && <AnnouncementsTab />}
          {activeTab === "Events" && <EventsTab />}
          {activeTab === "Projects" && <ProjectsTab />}
        </div>
      </div>
    </div>
  );
}
