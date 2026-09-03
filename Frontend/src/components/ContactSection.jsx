import React, { useState } from 'react';

const CONTACT_DETAILS = [
  {
    key: 'address',
    title: 'ANARC Robotics Club',
    text: 'National Institute Of Technology Agartala - 799046',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: 'phone',
    title: '+91 9771825050',
    text: 'Plz Call Us During office hours',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    key: 'email',
    title: 'anarc.nita.robotics@gmail.com',
    text: 'You can mail us 24/7',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

const MAP_EMBED_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1024.4440904434346!2d91.42035271248133!3d23.84079162641604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3753ed4cdc2e301d%3A0x27b6a301edf4249!2sSAC%20Building-%20NIT%20Agartala.!5e0!3m2!1sen!2sin!4v1783620932249!5m2!1sen!2sin';

export default function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      await response.json();
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const inputClasses =
    'w-full box-border rounded-xl border border-white/[0.12] bg-white/[0.03] px-[18px] py-[14px] text-sm text-white placeholder-gray-500 outline-none transition-[border-color,box-shadow] duration-200 ease-out focus:border-cyan-400/70 focus:shadow-[0_0_10px_rgba(94,234,240,0.25)]';

  return (
    <>
      <div className="relative flex w-full flex-wrap overflow-hidden pt-20">
        <div className="h-[600px] min-w-[30px] flex-[10_10_50%] px-[75px] py-5">
          <iframe
            title="ANARC Robotics Club location — NIT Agartala"
            src={MAP_EMBED_SRC}
            className="block h-full w-full rounded-[20px] border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>

      <div className="mx-auto my-[50px] flex max-w-[1300px] justify-between gap-[50px] rounded-2xl border border-slate-500/30 bg-transparent p-[45px] font-sans max-[768px]:mx-[15px] max-[768px]:my-[30px] max-[768px]:flex-col max-[768px]:gap-10 max-[768px]:p-[25px] bg-[rgba(8,15,22,0.5)] border border-[rgba(94,234,240,0.32)] rounded-[20px] shadow-[0_16px_50px_rgba(0,0,0,0.3),inset_0_1px_rgba(255,255,255,0.08),inset_0_0_35px_rgba(94,234,240,0.035)] backdrop-blur-[20px] overflow-visible text-center'> ">
        <div className="flex flex-1 flex-col gap-[35px]">
          {CONTACT_DETAILS.map(({ key, title, text, icon }) => (
            <div key={key} className="flex items-start gap-5">
              <div className="mt-1 h-6 w-6 flex-shrink-0 text-cyan-400">{icon}</div>
              <div>
                <h3 className="m-0 mb-[5px] text-base font-medium text-white">{title}</h3>
                <p className="m-0 text-sm text-gray-400">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5">
          <div>
            <input
              type="text"
              id="name"
              placeholder="Enter Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClasses}
            />
          </div>

          <div>
            <input
              type="email"
              id="email"
              placeholder="Enter Your Email-Id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClasses}
            />
          </div>

          <div>
            <textarea
              id="message"
              placeholder="Your Message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className={`${inputClasses} min-h-[150px] resize-y`}
            />
          </div>

          <button
            type="submit"
            className="self-start rounded-lg border border-white/30 bg-transparent px-[30px] py-3 text-[13px] font-medium text-gray-200 transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out hover:border-cyan-400/70 hover:bg-cyan-400/10 hover:text-cyan-200 hover:shadow-[0_4px_14px_rgba(94,234,240,0.3)] active:scale-[0.96] active:bg-cyan-400/20 active:shadow-[0_2px_6px_rgba(94,234,240,0.2)]"
          >
            Send Message
          </button>
        </form>
      </div>
    </>
  );
}