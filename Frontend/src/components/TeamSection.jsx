import React from 'react';

const ICONS = {
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.9 8.65 22 11 22 14.35V21h-4v-5.9c0-1.4-.03-3.2-1.95-3.2-1.95 0-2.25 1.53-2.25 3.1V21H9z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.58 2 12.2c0 4.5 2.87 8.31 6.84 9.66.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.9-2.78.51-3.5-.7-3.72-1.34-.13-.34-.68-1.34-1.16-1.62-.4-.22-.97-.76-.01-.77.9-.02 1.55.85 1.76 1.2 1.03 1.76 2.68 1.27 3.34.96.1-.76.4-1.27.72-1.56-2.5-.29-5.13-1.28-5.13-5.68 0-1.26.44-2.29 1.16-3.1-.12-.29-.5-1.47.11-3.06 0 0 .95-.31 3.12 1.18a10.6 10.6 0 0 1 5.68 0c2.17-1.5 3.12-1.18 3.12-1.18.61 1.59.23 2.77.11 3.06.72.81 1.16 1.83 1.16 3.1 0 4.41-2.64 5.39-5.15 5.67.41.36.77 1.07.77 2.17 0 1.57-.01 2.83-.01 3.22 0 .27.18.6.69.49A10.21 10.21 0 0 0 22 12.2C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
};

function SocialLink({ href, kind }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={kind}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-300 transition-colors hover:border-cyan-400/60 hover:text-cyan-300"
    >
      {ICONS[kind]}
    </a>
  );
}

/** Single team member card — glass panel with a ringed avatar. */
export function TeamCard({ member }) {
  const { name, role, image, socials = {} } = member;

  return (
    <div className="flex w-full max-w-[300px] min-h-[420px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.015] p-8 text-center backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:border-cyan-400/40 hover:bg-white/[0.03]">
      <div className="rounded-full bg-gradient-to-br from-cyan-300 via-cyan-500 to-blue-600 p-[3px] shadow-[0_0_25px_rgba(94,234,240,0.35)]">
        <div className="h-24 w-24 overflow-hidden rounded-full ring-2 ring-black/40">
          <img src={image} alt={name} className="h-full w-full object-cover" />
        </div>
      </div>

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-100">{name}</h3>

      <p className="mt-2 border-b border-white/10 pb-3 text-xs uppercase tracking-wide text-slate-400">
        {role}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <SocialLink href={socials.linkedin} kind="linkedin" />
        <SocialLink href={socials.github} kind="github" />
        <SocialLink href={socials.instagram} kind="instagram" />
      </div>
    </div>
  );
}

/** Full team grid — the `featured` member (if any) sits centered on its own row above the rest. */
export default function TeamSection({ members }) {
  const featured = members.find((member) => member.featured);
  const rest = members.filter((member) => !member.featured);

  return (
    <section className="px-6 py-16 sm:px-10">
      {featured && (
        <div className="mb-12 flex justify-center">
          <TeamCard member={featured} />
        </div>
      )}

      <div className="mx-auto grid max-w-6xl grid-cols-1 place-items-center gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((member) => (
          <TeamCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}
