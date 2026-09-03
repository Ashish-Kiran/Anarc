import React from 'react';
import { eventData } from './EventData.js';
const EventCard = ({ title, description, img }) => (
  <article className="group overflow-hidden bg-[rgba(7,12,18,0.5)] border border-[rgba(138,164,178,0.3)] rounded-[12px] shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition-all duration-[180ms] ease-in-out hover:transform hover:-translate-y-1 hover:border-[rgba(94,234,240,0.7)] hover:shadow-[0_14px_32px_rgba(0,0,0,0.32),0_0_18px_rgba(94,234,240,0.1)]">
    <img 
      className="block w-[min(175px,100%)] aspect-square h-auto mx-auto mt-4 object-cover border border-[rgba(217,154,91,0.38)] rounded-[8px]" 
      src={img} 
      alt={title} 
    />
    <div className="px-4 pb-4 pt-[14px] text-center">
      <h2 className="m-0 mb-2 text-[#d7f9fa] font-['Sora',ui-sans-serif] text-[1.05rem] font-[650] tracking-[-0.015em] leading-[1.3]">
        {title}
      </h2>
      <p className="m-0 text-[#aebbc4] text-[0.86rem] leading-[1.45] text-center line-clamp-3">
        {description}
      </p>
    </div>
  </article>
);

const EventsSection = () => (
  <main className="py-[clamp(28px,5vw,72px)] px-4 text-[#e9eef2] font-['Sora',ui-sans-serif,system-ui,-apple-system,sans-serif]">
    <section 
      className="w-[calc(100%-30px)] mx-auto my-[20px] mx-[15px] min-h-[75vh] p-[40px] flex flex-col justify-center bg-[rgba(8,15,22,0.5)] border border-[rgba(94,234,240,0.32)] rounded-[20px] shadow-[0_16px_50px_rgba(0,0,0,0.3),inset_0_1px_rgba(255,255,255,0.08),inset_0_0_35px_rgba(94,234,240,0.035)] backdrop-blur-[20px] overflow-visible text-center"
      aria-labelledby="events-title"
    >
      {/* Eyebrow */}
      <div className="flex items-center justify-center gap-[10px] mb-[10px] text-[#8fd8dd] font-['DM_Mono','SFMono-Regular',Consolas,monospace] text-[0.75rem] font-bold tracking-[0.16em]">
        <div className="w-[26px] h-px bg-[#d99a5b] shadow-[0_0_8px_rgba(217,154,91,0.8)]"></div>
        <span>ANARC · EVENTS</span>
      </div>

      {/* Title */}
      <h1 
        id="events-title"
        className="max-w-full m-0 font-['Sora',ui-sans-serif,system-ui,sans-serif] text-[clamp(1.7rem,2.7vw,2.8rem)] font-[600] leading-[1.16] tracking-[-0.045em]"
      >
        Student Orientation &amp; Registration Program (SOAR)
      </h1>

      {/* Intro */}
      <p className="max-w-[780px] mx-auto my-[14px] mb-6 text-[#b6c4cc] text-[clamp(0.88rem,1vw,1rem)] leading-[1.55] text-center">
        SOAR introduces freshers to our robotics club, its mentors, completed builds,
        and current projects. Explore our upcoming classes and workshops below.
      </p>

      {/* Events Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        {eventData.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </div>
    </section>

    {/* Responsive Styles */}
    <style>{`
      @media (max-width: 640px) {
        main {
          padding: clamp(28px, 5vw, 72px) 12px;
        }
        section {
          width: calc(100% - 30px);
          margin: 20px 15px;
          min-height: auto;
          padding: clamp(24px, 4vw, 32px);
        }
        .events-grid {
          grid-template-columns: 1fr;
        }
      }

      @supports (backdrop-filter: blur(1px)) {
        section {
          -webkit-backdrop-filter: blur(16px);
        }
      }
    `}</style>
  </main>
);

export default EventsSection;
