// NotificationButton.jsx
import { useState, useEffect, useRef } from "react";

export default function NotificationButton() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem("readNotifIds");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const panelRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:3000/announcements")
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
        setSelected(null);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;
  const hasUnread = unreadCount > 0;

  const markRead = (n) => {
    setSelected(n);
    setReadIds((prev) => {
      const updated = new Set([...prev, n.id]);
      localStorage.setItem("readNotifIds", JSON.stringify([...updated]));
      return updated;
    });
  };

  const markAll = () => {
    const all = new Set(notifications.map((n) => n.id));
    setReadIds(all);
    localStorage.setItem("readNotifIds", JSON.stringify([...all]));
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>
      {/* Keyframes — move these into your global CSS (index.css) once
          you're happy with them, so they're not redeclared per render */}
      <style>{`
        @keyframes robot-sway {
          0%, 100% { transform: rotate(-7deg); }
          50%      { transform: rotate(7deg); }
        }
        @keyframes beacon-pulse {
          0%, 100% { opacity: 1;    filter: drop-shadow(0 0 2px rgba(255,70,70,0.9)); }
          50%      { opacity: 0.55; filter: drop-shadow(0 0 7px rgba(255,70,70,1));   }
        }
      `}</style>

      {/* ── FAB ── */}
      <button
        onClick={() => {
          setOpen((o) => !o);
          setSelected(null);
        }}
        className={`w-14 h-14 rounded-[10px] flex items-center justify-center relative
          border bg-[rgba(8,15,22,0.8)] backdrop-blur-md text-[#4dd9e8]
          transition-all duration-300
          hover:border-[rgba(94,234,240,0.75)] hover:shadow-[0_0_28px_rgba(77,217,232,0.3)]
          ${
            hasUnread
              ? "border-[rgba(255,90,90,0.5)] shadow-[0_0_24px_rgba(255,70,70,0.25)]"
              : "border-[rgba(94,234,240,0.32)] shadow-[0_0_20px_rgba(77,217,232,0.15)]"
          }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            animation: "robot-sway 2.6s ease-in-out infinite",
            transformOrigin: "50% 95%",
          }}
        >
          {/* antenna stem */}
          <line x1="12" y1="5" x2="12" y2="2.6" />

          {/* antenna beacon ripple — only while unread */}
          {hasUnread && (
            <circle
              cx="12"
              cy="2"
              r="1.3"
              className="fill-red-500 animate-ping"
              stroke="none"
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
          )}

          {/* antenna beacon — cyan when clear, red + pulsing when unread */}
          <circle
            cx="12"
            cy="2"
            r="1.3"
            stroke="none"
            className={hasUnread ? "fill-red-500" : "fill-[#4dd9e8]"}
            style={
              hasUnread
                ? { animation: "beacon-pulse 1.3s ease-in-out infinite" }
                : {}
            }
          />

          {/* side sensor "ears" */}
          <rect x="3.3" y="9" width="1.6" height="3.4" rx="0.8" />
          <rect x="19.1" y="9" width="1.6" height="3.4" rx="0.8" />

          {/* head shell */}
          <rect x="5" y="5" width="14" height="12.5" rx="4" />

          {/* eyes */}
          <circle cx="9.3" cy="11" r="1.05" fill="currentColor" stroke="none" />
          <circle
            cx="14.7"
            cy="11"
            r="1.05"
            fill="currentColor"
            stroke="none"
          />

          {/* speaker grille */}
          <line x1="9.6" y1="15" x2="9.6" y2="16.2" />
          <line x1="12" y1="15" x2="12" y2="16.2" />
          <line x1="14.4" y1="15" x2="14.4" y2="16.2" />
        </svg>
      </button>

      {/* ── Panel ── */}
      {open && (
        <div
          className="absolute bottom-16 right-0 w-80
          bg-[rgba(8,15,22,0.85)] backdrop-blur-[20px]
          border border-[rgba(94,234,240,0.32)] rounded-[20px]
          shadow-[0_16px_50px_rgba(0,0,0,0.4),inset_0_1px_rgba(255,255,255,0.05),inset_0_0_35px_rgba(94,234,240,0.03)]
          overflow-hidden"
        >
          {selected ? (
            <div className="flex flex-col gap-3 p-5">
              <button
                onClick={() => setSelected(null)}
                className="flex items-center gap-1 text-[#4dd9e8] text-sm hover:underline w-fit"
              >
                ← Back
              </button>
              <h3 className="text-[#e9eef2] font-semibold text-base">
                {selected.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-[#55636d]">
                <span>{timeAgo(selected.createdAt)}</span>
                {selected.author?.name && (
                  <>
                    <span>·</span>
                    <span>By {selected.author.name}</span>
                  </>
                )}
              </div>
              {selected.imageUrl && (
                <img
                  src={selected.imageUrl}
                  alt={selected.title}
                  className="w-full rounded-xl object-cover border border-[rgba(94,234,240,0.15)]"
                />
              )}
              <p className="text-sm text-[#96a3ad] leading-relaxed">
                {selected.content}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(94,234,240,0.08)]">
                <h2 className="text-[#e9eef2] text-sm font-semibold tracking-wide">
                  Announcements
                </h2>
                {hasUnread && (
                  <button
                    onClick={markAll}
                    className="text-xs text-[#4dd9e8] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {loading && (
                <div className="py-10 text-center text-sm text-[#55636d]">
                  Loading...
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="py-10 text-center text-sm text-[#55636d]">
                  No announcements yet.
                </div>
              )}

              {!loading && (
                <div className="max-h-80 overflow-y-auto divide-y divide-[rgba(94,234,240,0.06)]">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n)}
                      className="flex gap-3 px-5 py-4 cursor-pointer relative
                        hover:bg-[rgba(94,234,240,0.04)] transition-colors duration-200"
                    >
                      {!readIds.has(n.id) && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#4dd9e8]" />
                      )}

                      {n.imageUrl ? (
                        <img
                          src={n.imageUrl}
                          alt={n.title}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-[rgba(94,234,240,0.15)]"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center
    bg-[rgba(77,217,232,0.08)] border border-[rgba(94,234,240,0.2)] text-[#4dd9e8] font-semibold text-sm"
                        >
                          {n.author?.name?.charAt(0).toUpperCase() ?? "A"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#e9eef2] truncate">
                          {n.title}
                        </p>
                        <p className="text-xs text-[#55636d] truncate mt-0.5">
                          {n.content}
                        </p>
                        <span className="text-[11px] text-[#55636d] mt-1 block">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
