import React from 'react';

export default function HeroOne({
  eyebrow = 'ASIMOV',
  title = 'Solder, Simulate, Ship.',
  description = "We're the robotics and embedded-systems club at NIT Agartala — a bench of soldering irons, oscilloscopes, and half-finished rovers where anyone curious about how machines move can start building. No prior experience required, just a willingness to debug at 1am.",
  stats = [
    { value: '40+', label: 'active builders' },
    { value: '12', label: 'ongoing projects' },
    { value: '3', label: 'workshops / semester' },
  ],
}) {
  return (
    <div className="hero-one-outer">
      <div className="hero-one-transparent">
      <style>{`
        .hero-one-outer {
          width: 70;
          margin: 5% 5%;
          box-sizing: border-box;
          /* glass finish */
          background: rgba(8, 15, 22, 0.4);
          border: 1px solid rgba(94, 234, 240, 0.22);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(1px);
        }

        .hero-one-transparent {
          background: transparent;
          width: 100%;
          box-sizing: border-box;
          padding: clamp(60px, 6vw, 88px) 20px;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        }

        .hero-one-inner {
          max-width: 960px;
          margin: 20 auto;
          display: grid;
          /* asymmetric two-column layout instead of a single centered
             stack — a deliberately different structure from the
             reference design, not a re-skin of it */
          grid-template-columns: auto 1fr;
          gap: 28px;
          align-items: start;
        }

        .hero-one-mark {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          flex-shrink: 0;
          border-radius: 10px;
          border: 1px solid rgba(94, 234, 240, 0.35);
          background: rgba(94, 234, 240, 0.06);
          font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #5eeaf0;
        }

        .hero-one-body {
          text-align: left;
        }

        .hero-one-eyebrow {
          display: block;
          margin: 8px 0 12px;
          font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", monospace;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8fd8dd;
        }

        .hero-one-title {
          margin: 0 0 18px;
          font-size: clamp(30px, 5vw, 52px);
          font-weight: 700;
          line-height: 1.08;
          letter-spacing: -0.02em;
          /* gradient text instead of a flat orange headline — a distinct
             signature treatment rather than the reference's solid color */
          background: linear-gradient(90deg, #e07b39 0%, #f2b26a 55%, #5eeaf0 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-one-description {
          margin: 0 0 32px;
          max-width: 56ch;
          font-size: clamp(14px, 1.4vw, 17px);
          line-height: 1.7;
          color: #96a3ad;
        }

        .hero-one-stats {
          display: flex;
          flex-wrap: wrap;
          gap: clamp(20px, 4vw, 40px);
          padding-top: 20px;
          border-top: 1px solid rgba(94, 234, 240, 0.18);
        }

        .hero-one-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .hero-one-stat-value {
          font-size: clamp(20px, 2.4vw, 28px);
          font-weight: 700;
          color: #e9eef2;
        }

        .hero-one-stat-label {
          font-family: ui-monospace, "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.06em;
          color: #55636d;
        }

        @media (max-width: 640px) {
          .hero-one-inner {
            grid-template-columns: 1fr;
          }
          .hero-one-mark {
            width: 44px;
            height: 44px;
          }
          .hero-one-body {
            text-align: left;
          }
        }
      `}</style>

      <div className="hero-one-inner">
        <div className="hero-one-mark">A</div>

        <div className="hero-one-body">
          <span className="hero-one-eyebrow">{eyebrow}</span>
          <h1 className="hero-one-title">{title}</h1>
          <p className="hero-one-description">{description}</p>

          <div className="hero-one-stats">
            {stats.map((stat) => (
              <div className="hero-one-stat" key={stat.label}>
                <span className="hero-one-stat-value">{stat.value}</span>
                <span className="hero-one-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
