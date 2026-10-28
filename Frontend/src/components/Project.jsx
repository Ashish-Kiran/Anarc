import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL;

export default function Project() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API}/projects`);
        if (!res.ok) throw new Error("Something went wrong");
        setProjects(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <main className="py-[clamp(28px,5vw,900px)] px-[80px] text-[#e9eef2] font-['Sora',ui-sans-serif,system-ui,-apple-system,sans-serif]">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-center gap-[10px] mb-10 text-[#8fd8dd] font-['DM_Mono','SFMono-Regular',Consolas,monospace] text-[0.75rem] font-bold tracking-[0.16em]">
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-5 h-5 rounded-full border-2 border-[#4dd9e8] border-t-transparent animate-spin" />
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* ── Project Cards ── */}
      {!loading &&
        !error &&
        projects.map((project) => (
          <section
            key={project.id}
            /* ── Card: tweak px/py for inner spacing ── */
            className="mx-auto my-[20px] px-[80px] py-[56px] bg-[rgba(8,15,22,0.5)] border border-[rgba(94,234,240,0.32)] rounded-[20px] shadow-[0_16px_50px_rgba(0,0,0,0.3),inset_0_1px_rgba(255,255,255,0.08),inset_0_0_35px_rgba(94,234,240,0.035)] backdrop-blur-[20px] overflow-hidden"
          >
            {/* ── Title centered at top ── */}
            <h2 className="text-center text-[clamp(1.8rem,2.8vw,2.8rem)] font-[700] leading-[1.1] tracking-[-0.03em] text-[#e9eef2] mb-3">
              {project.title}
            </h2>

            {/* ── Divider — tweak w to change width ── */}
            <div className="mx-auto mb-[56px] w-[120px] h-px bg-[linear-gradient(to_right,transparent,rgba(77,217,232,0.8),white,rgba(77,217,232,0.8),transparent)]" />

            {/* ── Body row: image left, content right ── */}
            <div className="flex flex-col lg:flex-row items-center gap-[60px]">
              {/* ── Image — tweak w/h here ── */}
              <div className="flex-shrink-0">
                <div className="rounded-[16px] overflow-hidden border border-[rgba(94,234,240,0.2)] shadow-[0_0_30px_rgba(77,217,232,0.15)]">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    /* ── Image dimensions: w-[350px] h-[380px] ── */
                    className="w-[350px] h-[380px] object-cover"
                  />
                </div>
              </div>

              {/* ── Right content — vertically centered to image ── */}
              <div className="flex flex-col gap-5 max-w-[420px]">
                {/* ── Section heading — tweak font/color here ── */}
                <h3 className="text-[1.1rem] font-[600] text-[#e9eef2]">
                  About the Project
                </h3>

                {/* ── Description — tweak color/size here ── */}
                <p className="text-[#96a3ad] text-[0.95rem] leading-[1.65]">
                  {project.description}
                </p>

                {project.githubUrl && (
                  <div className="mt-2">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      /* ── Button: tweak px/py/border/color here ── */
                      className="inline-block px-6 py-2.5 text-sm font-medium text-[#4dd9e8] border border-[rgba(77,217,232,0.5)] rounded-[8px] hover:bg-[rgba(77,217,232,0.08)] transition-all duration-200"
                    >
                      Read Docs
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}

      {/* ── Empty State ── */}
      {!loading && !error && projects.length === 0 && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-[#55636d] text-sm">No projects yet.</p>
        </div>
      )}
    </main>
  );
}
