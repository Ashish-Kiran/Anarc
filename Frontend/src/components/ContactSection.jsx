import React, { useState } from 'react';

const CONTACT_DETAILS = [
  {
    key: 'address',
    title: 'ANARC Robotics Club',
    text: 'National Institute Of Technology Agartala - 799046',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: 'phone',
    title: '+91 9771825050',
    text: 'Call us during office hours',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    key: 'email',
    title: 'anarc.nita.robotics@gmail.com',
    text: 'You can mail us 24/7',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

const MAP_EMBED_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1024.4440904434346!2d91.42035271248133!3d23.84079162641604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3753ed4cdc2e301d%3A0x27b6a301edf4249!2sSAC%20Building-%20NIT%20Agartala.!5e0!3m2!1sen!2sin!4v1783620932249!5m2!1sen!2sin';

const inputClass =
  'w-full rounded-xl border border-[rgba(138,164,178,0.2)] bg-[rgba(7,12,18,0.5)] px-4 py-3.5 text-sm text-[#e9eef2] caret-[#4dd9e8] placeholder-[#55636d] outline-none transition-all duration-300 focus:border-[rgba(94,234,240,0.5)] focus:shadow-[0_0_0_2px_rgba(77,217,232,0.08),0_0_12px_rgba(77,217,232,0.15)]';

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">{label}</label>
      {children}
    </div>
  );
}

export default function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      setSuccess("Message sent! We'll get back to you soon.");
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto my-[100px] w-full max-w-[1300px] px-4 sm:px-6">

      {/* Merged card */}
      <div className="relative bg-[rgba(8,15,22,0.5)] border border-[rgba(94,234,240,0.32)] rounded-[20px] shadow-[0_16px_50px_rgba(0,0,0,0.3),inset_0_1px_rgba(255,255,255,0.08),inset_0_0_35px_rgba(94,234,240,0.035)] backdrop-blur-[20px] overflow-hidden">

        {/* Brand header */}
        {/* <div className="px-8 pt-8 pb-6 border-b border-[rgba(94,234,240,0.1)]">
          <div className="flex items-center gap-[10px] text-[#8fd8dd] font-mono text-[0.7rem] font-bold tracking-[0.16em]">
            <div className="w-[22px] h-px bg-[#d99a5b] shadow-[0_0_8px_rgba(217,154,91,0.8)]" />
            <span>ANARC · CONTACT</span>
            <div className="w-[22px] h-px bg-[#d99a5b] shadow-[0_0_8px_rgba(217,154,91,0.8)]" />
          </div>
          <h2 className="mt-2 text-xl font-semibold text-[#e9eef2] tracking-tight">Get in Touch</h2>
          <p className="text-[#96a3ad] text-sm mt-0.5">Reach out to us — we'd love to hear from you.</p>
        </div> */}

        {/* Two-column body */}
        <div className="flex flex-col lg:flex-row">

          {/* LEFT — map + contact details */}
          <div className="flex flex-col gap-6 p-8 lg:w-[45%] border-b lg:border-b-0 lg:border-r border-[rgba(94,234,240,0.08)]">

            {/* Contact details */}
            <div className="flex flex-col gap-5">
              {CONTACT_DETAILS.map(({ key, title, text, icon }) => (
                <div key={key} className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-[rgba(94,234,240,0.2)] bg-[rgba(77,217,232,0.06)] text-[#4dd9e8]">
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#e9eef2]">{title}</p>
                    <p className="text-xs text-[#96a3ad] mt-0.5">{text}</p>
                    <br/>
                  </div>
                </div>
                
              ))}
            </div>

            {/* Map */}
            <div className="w-full overflow-hidden rounded-[14px] border border-[rgba(94,234,240,0.15)] shadow-[0_0_20px_rgba(0,0,0,0.4)]">
              <iframe
                title="ANARC Robotics Club location — NIT Agartala"
                src={MAP_EMBED_SRC}
                className="block h-[220px] w-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

          </div>

          {/* RIGHT — contact form */}
          <div className="flex flex-1 flex-col p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 h-full">

              <Field label="Full Name">
                <input
                  type="text" placeholder="John Doe" value={name} required
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  className={inputClass}
                />
              </Field>

              <Field label="Email Address">
                <input
                  type="email" placeholder="john@example.com" value={email} required
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className={inputClass}
                />
              </Field>

              <Field label="Message">
                <textarea
                  placeholder="Tell us what's on your mind..."
                  rows={6} value={message} required
                  onChange={(e) => { setMessage(e.target.value); setError(''); }}
                  className={inputClass + ' resize-none'}
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
                type="submit" disabled={loading}
                className="mt-auto w-full rounded-xl border border-[rgba(94,234,240,0.32)] bg-[rgba(94,234,240,0.05)] py-3.5 text-sm font-semibold text-[#4dd9e8] tracking-wide transition-all duration-300 hover:bg-[rgba(94,234,240,0.10)] hover:border-[rgba(94,234,240,0.75)] hover:shadow-[0_0_20px_rgba(77,217,232,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}