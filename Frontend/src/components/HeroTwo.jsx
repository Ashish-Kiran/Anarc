import React from 'react';

const DEFAULT_ITEMS = [
  { id: 1, label: 'sand-rover-v2', img: 'https://picsum.photos/seed/asimov1/480/480' },
  { id: 2, label: 'line-follower calibration', img: 'https://picsum.photos/seed/asimov2/480/480' },
  { id: 3, label: 'solder night', img: 'https://picsum.photos/seed/asimov3/480/480' },
  { id: 4, label: 'PCB fab', img: 'https://picsum.photos/seed/asimov4/480/480' },
  { id: 5, label: 'workshop 04', img: 'https://picsum.photos/seed/asimov5/480/480' },
  { id: 6, label: 'demo day', img: 'https://picsum.photos/seed/asimov6/480/480' },
];

export default function HeroTwo({
  eyebrow = 'ASIMOV',
  title = 'Builds worth staring at.',
  items = DEFAULT_ITEMS,
}) {
  // Duplicate the list so the marquee can loop seamlessly at -50%.
  const track = [...items, ...items];

  return (
    <div className="hero-two-outer">
      <style>{`
        .hero-two-outer {
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
          padding: clamp(48px, 7vw, 96px) 0;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          overflow: hidden;
        }

        .hero-two-header {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 0 20px;
          margin-bottom: clamp(40px, 6vw, 72px);
        }

        .hero-two-eyebrow {
          display: block;
          margin-bottom: 10px;
          font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", monospace;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8fd8dd;
        }

        .hero-two-title {
          margin: 0;
          font-size: clamp(26px, 4vw, 42px);
          font-weight: 700;
          letter-spacing: -0.02em;
          background: linear-gradient(90deg, #5eeaf0 0%, #f2b26a 60%, #e07b39 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-two-track-viewport {
          width: 100vw;
          margin-left: 50%;
          transform: translateX(-50%);
          overflow: hidden;
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            #000 8%,
            #000 92%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            #000 8%,
            #000 92%,
            transparent 100%
          );
        }

        .hero-two-track {
          display: flex;
          gap: 20px;
          width: max-content;
          animation: hero-two-scroll 28s linear infinite;
        }

        .hero-two-track:hover {
          animation-play-state: paused;
        }

        @keyframes hero-two-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .hero-two-card {
          position: relative;
          flex: 0 0 auto;
          width: clamp(180px, 20vw, 240px);
          aspect-ratio: 1;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(94, 234, 240, 0.25);
          background: #0b131a;
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.35);
          opacity: 0;
          transform: translateY(16px) scale(0.96);
          animation: hero-two-enter 600ms ease forwards;
          animation-delay: var(--enter-delay, 0ms);
          transition: transform 240ms ease, border-color 240ms ease, box-shadow 240ms ease;
        }

        @keyframes hero-two-enter {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .hero-two-card:hover {
          transform: translateY(-6px) scale(1.03);
          border-color: rgba(94, 234, 240, 0.75);
          box-shadow: 0 16px 34px rgba(0, 0, 0, 0.4), 0 0 22px rgba(94, 234, 240, 0.18);
        }

        .hero-two-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: saturate(0.85) brightness(0.85);
          transition: filter 240ms ease, transform 400ms ease;
        }

        .hero-two-card:hover img {
          filter: saturate(1.05) brightness(1);
          transform: scale(1.06);
        }

        .hero-two-card-caption {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 10px 12px;
          font-family: ui-monospace, "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.04em;
          color: #e9eef2;
          background: linear-gradient(to top, rgba(4, 8, 12, 0.92) 0%, transparent 100%);
          transform: translateY(100%);
          transition: transform 240ms ease;
        }

        .hero-two-card:hover .hero-two-card-caption {
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-two-track {
            animation: none;
          }
          .hero-two-card {
            opacity: 1;
            transform: none;
            animation: none;
          }
          .hero-two-card:hover {
            transform: none;
          }
        }
      `}</style>

      <div className="hero-two-header">
        <span className="hero-two-eyebrow">{eyebrow}</span>
        <h2 className="hero-two-title">{title}</h2>
      </div>

      <div className="hero-two-track-viewport">
        <div className="hero-two-track">
          {track.map((item, i) => (
            <div
              className="hero-two-card"
              key={`${item.id}-${i}`}
              style={{ '--enter-delay': `${(i % items.length) * 80}ms` }}
            >
              <img src={item.img} alt={item.label} loading="lazy" />
              <span className="hero-two-card-caption">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}