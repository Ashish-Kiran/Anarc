import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000";
const tabs = ["Announcements", "Events", "Projects", "Invite"];

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
              ANARC · MEMBER
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

// ── Announcements Tab ─────────────────────────────────────────────────────────
function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
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
      const res = await fetch(`${API}/my-announcements`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Something went wrong");
      setAnnouncements(await res.json());
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const closeModal = () => {
    setShowCreate(false);
    setFormTitle("");
    setFormImageUrl("");
    setFormContent("");
    setActionError("");
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      const body = new FormData();
      body.append("file", file);
      body.append("upload_preset", preset);
      body.append("folder", "Anarc/announcements");
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body },
      );
      const data = await res.json();
      if (!res.ok) throw new Error("Something went wrong");
      setFormImageUrl(data.secure_url);
    } catch {
      setActionError("Something went wrong");
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
      if (!res.ok) throw new Error("Something went wrong");
      closeModal();
      await fetchAnnouncements();
    } catch {
      setActionError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={fetchAnnouncements} />;

  return (
    <>
      {showCreate && (
        <Modal title="New Announcement" onClose={closeModal}>
          <div className="flex flex-col gap-4">
            <Field
              label="Title *"
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
              label="Content *"
              type="textarea"
              placeholder="Write your announcement..."
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
            />
            <FormError msg={actionError} />
            <div className="flex gap-3 justify-end">
              <ActionBtn onClick={closeModal} color="amber">
                Cancel
              </ActionBtn>
              <ActionBtn
                onClick={handleCreate}
                color="cyan"
                disabled={submitting || uploading}
              >
                {submitting ? "Submitting..." : "Submit"}
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
        <ActionBtn onClick={() => setShowCreate(true)} color="cyan">
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
                    {new Date(a.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-xs text-[#55636d]">·</span>
                  {/* Status badge — pending approval if inactive */}
                  <span
                    className={`text-[10px] font-bold tracking-[0.12em] px-2 py-0.5 rounded-lg border ${a.isActive ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"}`}
                  >
                    {a.isActive ? "ACTIVE" : "PENDING APPROVAL"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Events Tab ────────────────────────────────────────────────────────────────
function EventItemField({ item, index, onChange, onRemove, setUploading }) {
  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
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
      if (!res.ok) throw new Error("Something went wrong");
      onChange(index, "photo", data.secure_url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border border-[rgba(138,164,178,0.15)] bg-[rgba(7,12,18,0.4)]">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#55636d] font-['DM_Mono',monospace]">
          ITEM {index + 1}
        </span>
        <button
          onClick={() => onRemove(index)}
          className="text-red-400 text-xs hover:text-red-300 transition-colors"
        >
          Remove
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-[#55636d] font-['DM_Mono',monospace] tracking-[0.1em]">
          TITLE
        </label>
        <input
          type="text"
          placeholder="Item title..."
          value={item.title || ""}
          onChange={(e) => onChange(index, "title", e.target.value)}
          className="w-full rounded-lg border border-[rgba(138,164,178,0.15)] bg-[rgba(7,12,18,0.6)] px-3 py-2 text-sm text-[#e9eef2] placeholder-[#55636d] outline-none focus:border-[rgba(94,234,240,0.4)]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-[#55636d] font-['DM_Mono',monospace] tracking-[0.1em]">
          PHOTO
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          className="text-xs text-[#96a3ad] file:mr-3 file:py-1 file:px-3 file:rounded file:border file:border-[rgba(94,234,240,0.3)] file:bg-transparent file:text-[#5eeaf0] file:text-xs file:cursor-pointer"
        />
        {item.photo && (
          <img
            src={item.photo}
            alt="preview"
            className="w-20 h-20 object-cover rounded-lg mt-1 border border-[rgba(94,234,240,0.2)]"
          />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-[#55636d] font-['DM_Mono',monospace] tracking-[0.1em]">
          EXPLANATION
        </label>
        <textarea
          placeholder="Describe this item..."
          value={item.explanation}
          onChange={(e) => onChange(index, "explanation", e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-[rgba(138,164,178,0.15)] bg-[rgba(7,12,18,0.6)] px-3 py-2 text-sm text-[#e9eef2] placeholder-[#55636d] outline-none focus:border-[rgba(94,234,240,0.4)] resize-none"
        />
      </div>
    </div>
  );
}

function EventForm({ form, setForm, actionError }) {
  const [uploading, setUploading] = useState(false);
  const addItem = () =>
    setForm((f) => ({
      ...f,
      items: [...(f.items || []), { title: "", photo: "", explanation: "" }],
    }));
  const removeItem = (index) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));
  const updateItem = (index, key, value) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    }));

  return (
    <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
      <Field
        label="Event Name *"
        placeholder="e.g. SOAR, WORKSHOP"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <Field
        label="Title *"
        placeholder="Full event title"
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
      />
      <Field
        label="Description *"
        type="textarea"
        placeholder="Describe the event..."
        value={form.description}
        onChange={(e) =>
          setForm((f) => ({ ...f, description: e.target.value }))
        }
      />
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-[#55636d] font-['DM_Mono',monospace] tracking-[0.1em]">
          DATE & TIME <span className="text-[#55636d]">(optional)</span>
        </label>
        <input
          type="datetime-local"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          className="w-full rounded-lg border border-[rgba(138,164,178,0.15)] bg-[rgba(7,12,18,0.6)] px-4 py-3 text-sm text-[#e9eef2] outline-none focus:border-[rgba(94,234,240,0.4)]"
        />
      </div>
      <Field
        label="Venue (optional)"
        placeholder="e.g. SAC Building"
        value={form.venue || ""}
        onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
      />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-[#55636d] font-['DM_Mono',monospace] tracking-[0.1em]">
            ITEMS (PHOTO + EXPLANATION)
          </label>
          <button
            onClick={addItem}
            className="text-xs text-[#5eeaf0] border border-[rgba(94,234,240,0.3)] rounded px-2 py-1 hover:bg-[rgba(94,234,240,0.08)] transition-colors"
          >
            + Add Item
          </button>
        </div>
        {(form.items || []).length === 0 && (
          <p className="text-xs text-[#55636d] text-center py-2">
            No items yet — click "+ Add Item"
          </p>
        )}
        {(form.items || []).map((item, index) => (
          <EventItemField
            key={index}
            item={item}
            index={index}
            onChange={updateItem}
            onRemove={removeItem}
            setUploading={setUploading}
          />
        ))}
      </div>
      {uploading && (
        <p className="text-xs text-[#5eeaf0] font-['DM_Mono',monospace]">
          Uploading image...
        </p>
      )}
      <FormError msg={actionError} />
    </div>
  );
}

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
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/my-events`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Something went wrong");
      setEvents(await res.json());
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const closeModal = () => {
    setShowCreate(false);
    setForm(emptyForm);
    setActionError("");
  };

  const handleCreate = async () => {
    setSubmitting(true);
    setActionError("");
    try {
      const res = await fetch(`${API}/events`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ ...form, authorId: user.id }),
      });
      if (!res.ok) throw new Error("Something went wrong");
      closeModal();
      await fetchEvents();
    } catch {
      setActionError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={fetchEvents} />;

  return (
    <>
      {showCreate && (
        <Modal title="New Event" onClose={closeModal}>
          <div className="flex flex-col gap-4">
            <EventForm
              form={form}
              setForm={setForm}
              actionError={actionError}
            />
            <div className="flex gap-3 justify-end">
              <ActionBtn onClick={closeModal} color="amber">
                Cancel
              </ActionBtn>
              <ActionBtn
                onClick={handleCreate}
                color="cyan"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
              </ActionBtn>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[#e9eef2] font-semibold text-base">Events</h2>
          <p className="text-[#55636d] text-xs mt-0.5">{events.length} total</p>
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
            className="rounded-xl border border-[rgba(138,164,178,0.15)] bg-[rgba(7,12,18,0.4)] px-5 py-4 transition-all duration-200 hover:border-[rgba(94,234,240,0.2)]"
          >
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
                · {ev.items?.length || 0} items
              </span>
              <span className="text-xs text-[#55636d]">·</span>
              <span
                className={`text-[10px] font-bold tracking-[0.12em] px-2 py-0.5 rounded-lg border ${ev.isActive ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"}`}
              >
                {ev.isActive ? "ACTIVE" : "PENDING APPROVAL"}
              </span>
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
      if (!res.ok) throw new Error("Something went wrong");
      setForm((f) => ({ ...f, imageUrl: data.secure_url }));
    } catch {
      console.error("Upload failed");
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
      <FormError msg={actionError} />
    </div>
  );
}

function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    githubUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/my-projects`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Something went wrong");
      setProjects(await res.json());
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const closeModal = () => {
    setShowCreate(false);
    setForm({ title: "", description: "", imageUrl: "", githubUrl: "" });
    setActionError("");
  };

  const handleCreate = async () => {
    setSubmitting(true);
    setActionError("");
    try {
      const res = await fetch(`${API}/project`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ ...form, isActive: false }),
      });
      if (!res.ok) throw new Error("Something went wrong");
      closeModal();
      await fetchProjects();
    } catch {
      setActionError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={fetchProjects} />;

  return (
    <>
      {showCreate && (
        <Modal title="New Project" onClose={closeModal}>
          <div className="flex flex-col gap-4">
            <ProjectForm
              form={form}
              setForm={setForm}
              actionError={actionError}
            />
            <div className="flex gap-3 justify-end">
              <ActionBtn onClick={closeModal} color="amber">
                Cancel
              </ActionBtn>
              <ActionBtn
                onClick={handleCreate}
                color="cyan"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
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
            className="rounded-xl border border-[rgba(138,164,178,0.15)] bg-[rgba(7,12,18,0.4)] px-5 py-4 transition-all duration-200 hover:border-[rgba(94,234,240,0.2)]"
          >
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <p className="text-sm font-medium text-[#e9eef2]">{p.title}</p>
              <span
                className={`text-[10px] font-bold tracking-[0.12em] px-2 py-0.5 rounded-lg border ${p.isActive ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"}`}
              >
                {p.isActive ? "ACTIVE" : "PENDING APPROVAL"}
              </span>
            </div>
            <p className="text-xs text-[#96a3ad] line-clamp-2">
              {p.description}
            </p>
            {p.githubUrl && (
              <a
                href={p.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#4dd9e8] hover:underline mt-1 inline-block"
              >
                GitHub ↗
              </a>
            )}
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
      const res = await fetch(`${API}/member/invite`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Something went wrong");
      setSuccess(data.message);
      setName("");
      setEmail("");
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-[#e9eef2] font-semibold text-base mb-1">
        Invite Someone
      </h2>
      <p className="text-[#55636d] text-xs mb-6">
        We noticed your interest in our club — we'd love to have you with us!
        Send an invite and let them begin their journey with ANARC.
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
          placeholder="friend@example.com"
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

// ── Main Member Dashboard ─────────────────────────────────────────────────────
export default function MemberDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("Announcements");
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
      if (u.siteRole !== "MEMBER") {
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
            ANARC · Member Panel
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
              className={`px-5 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 -mb-px ${activeTab === tab ? "border-[#4dd9e8] text-[#4dd9e8]" : "border-transparent text-[#55636d] hover:text-[#96a3ad]"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6 sm:p-8">
          {activeTab === "Announcements" && <AnnouncementsTab />}
          {activeTab === "Events" && <EventsTab />}
          {activeTab === "Projects" && <ProjectsTab />}
          {activeTab === "Invite" && <InviteTab />}
        </div>
      </div>
    </div>
  );
}
