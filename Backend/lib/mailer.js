const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function wrapEmail({ heading, body }) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f172a; color: #e2e8f0; border-radius: 8px;">
      <h2 style="color: #5eeaf0; margin-bottom: 8px;">${heading}</h2>
      <p style="color: #94a3b8;">NIT Agartala Robotics Club — ANARC</p>
      ${body}
    </div>
  `;
}

async function sendMail({ to, subject, html, text }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
    text,
  });
}

// ─── Application Submitted ──────────────────────────────────────────────
async function sendApplicationSubmittedEmail({ to, name }) {
  const html = wrapEmail({
    heading: "Application Received! 🎉",
    body: `
      <p style="margin-top: 24px;">Hey <strong>${name}</strong>, congratulations — you're just one step away from unlocking your spot at ANARC!</p>
      <p style="margin-top: 16px;">We've received your application and our team is already excited to review it. Sit tight, we'll be in touch soon with next steps.</p>
    `,
  });
  return sendMail({ to, subject: "Application Received — You're One Step Closer! 🚀", html });
}

// ─── Admit Card / Exam Invite ────────────────────────────────────────────

async function sendAdmitCardEmail({ to, name, examDate, venue, attachment }) {
  const formattedDate = new Date(examDate).toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });
  const html = wrapEmail({
    heading: "You're In for the Exam! 📝",
    body: `
      <p style="margin-top: 24px;">Great news, <strong>${name}</strong>! Your application has been accepted and you're all set for the next round.</p>
      <div style="margin-top: 24px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 6px; border: 1px solid rgba(94,234,240,0.2);">
        <p style="margin: 0 0 8px 0;"><strong style="color: #5eeaf0;">Date & Time:</strong> ${formattedDate}</p>
        <p style="margin: 0;"><strong style="color: #5eeaf0;">Venue:</strong> ${venue || "To be announced"}</p>
      </div>
      <p style="margin-top: 24px;">Your admit card is attached to this email — please carry a printed or digital copy along with your college ID.</p>
      <p style="margin-top: 16px;">Give it your best shot — we're rooting for you!</p>
    `,
  });

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Admit Card Issued — Let's Go! 🎯",
    html,
    attachments: attachment
      ? [{ filename: "ANARC_Admit_Card.pdf", content: attachment, contentType: "application/pdf" }]
      : [],
  });
}

// ─── Application Rejected ───────────────────────────────────────────────
async function sendApplicationRejectedEmail({ to, name }) {
  const html = wrapEmail({
    heading: "Thank You for Applying",
    body: `
      <p style="margin-top: 24px;">Hi <strong>${name}</strong>, thank you so much for showing interest in ANARC.</p>
      <p style="margin-top: 16px;">After careful consideration, we're unable to move forward with your application this time. We know this isn't the news you were hoping for, and we truly appreciate the time and effort you put in.</p>
      <p style="margin-top: 16px;">This isn't goodbye — we'd love to see you try again in the future. Wishing you a bright and successful journey ahead! ✨</p>
    `,
  });
  return sendMail({ to, subject: "Update on Your ANARC Application", html });
}

// ─── Exam Passed ─────────────────────────────────────────────────────────
async function sendExamPassedEmail({ to, name }) {
  const html = wrapEmail({
    heading: "You Passed! 🎉",
    body: `
      <p style="margin-top: 24px;">Amazing work, <strong>${name}</strong>! You've cleared the written exam and you're moving one step closer to becoming part of ANARC.</p>
      <p style="margin-top: 16px;">Keep an eye on your inbox — your interview invite is coming up soon!</p>
    `,
  });
  return sendMail({ to, subject: "You Passed the Exam! 🎉", html });
}

// ─── Exam Failed ─────────────────────────────────────────────────────────
async function sendExamFailedEmail({ to, name }) {
  const html = wrapEmail({
    heading: "Thank You for Taking the Exam",
    body: `
      <p style="margin-top: 24px;">Hi <strong>${name}</strong>, thank you for taking the time to sit for the ANARC exam.</p>
      <p style="margin-top: 16px;">Unfortunately, you weren't able to clear this round. We know you put in effort, and we genuinely appreciate your interest in the club.</p>
      <p style="margin-top: 16px;">We'd love to see you apply again down the line — wishing you all the best and a bright future ahead! ✨</p>
    `,
  });
  return sendMail({ to, subject: "Exam Result — ANARC Application", html });
}

// ─── Interview Invite ────────────────────────────────────────────────────
async function sendInterviewInviteEmail({ to, name, date, venue }) {
  const formattedDate = new Date(date).toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });
  const html = wrapEmail({
    heading: "Interview Invitation 🎤",
    body: `
      <p style="margin-top: 24px;">Congratulations <strong>${name}</strong>! You've passed the written exam and are invited for an interview.</p>
      <div style="margin-top: 24px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 6px; border: 1px solid rgba(94,234,240,0.2);">
        <p style="margin: 0 0 8px 0;"><strong style="color: #5eeaf0;">Date & Time:</strong> ${formattedDate}</p>
        <p style="margin: 0;"><strong style="color: #5eeaf0;">Venue:</strong> ${venue || "To be announced"}</p>
      </div>
      <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
        Please be on time. Carry your college ID card.<br/>
        For queries, contact the club admin.
      </p>
    `,
  });
  return sendMail({ to, subject: "ANARC Interview Invitation 🎤", html });
}

// ─── Interview Passed ─────────────────────────────────────────────────────
async function sendInterviewPassedEmail({ to, name }) {
  const html = wrapEmail({
    heading: "You Nailed It! 🌟",
    body: `
      <p style="margin-top: 24px;">Fantastic news, <strong>${name}</strong>! You've passed your interview and you're almost officially part of ANARC.</p>
      <p style="margin-top: 16px;">Your welcome email with login details is on its way — get ready to build some amazing machines with us!</p>
    `,
  });
  return sendMail({ to, subject: "You Passed the Interview! 🌟", html });
}

// ─── Interview Failed ─────────────────────────────────────────────────────
async function sendInterviewFailedEmail({ to, name }) {
  const html = wrapEmail({
    heading: "Thank You for Your Time",
    body: `
      <p style="margin-top: 24px;">Hi <strong>${name}</strong>, thank you for taking the time to interview with us.</p>
      <p style="margin-top: 16px;">This time, we won't be moving forward with your application. We really appreciate the interest and enthusiasm you showed throughout the process.</p>
      <p style="margin-top: 16px;">We hope our paths cross again in the future — wishing you continued success and a bright road ahead! ✨</p>
    `,
  });
  return sendMail({ to, subject: "Interview Result — ANARC Application", html });
}

// ─── Welcome / Converted to Member ────────────────────────────────────────
async function sendWelcomeEmail({ to, name }) {
  const html = wrapEmail({
    heading: "Welcome to ANARC! 🎉",
    body: `
      <p style="margin-top: 24px;">Congratulations <strong>${name}</strong>! You are now an official member of ANARC.</p>
      <p style="margin-top: 16px;">You can now log in to the member portal using your email and the password you set during application.</p>
      <a href="${process.env.FRONTEND_URL}/login"
        style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #5eeaf0; color: #0f172a; border-radius: 6px; text-decoration: none; font-weight: 600;">
        Log in to Member Portal
      </a>
    `,
  });
  return sendMail({ to, subject: "Welcome to ANARC! 🎉", html });
}

// add this to lib/mailer.js and include it in module.exports

async function sendInviteEmail({ to, name, inviteLink }) {
  const html = wrapEmail({
    heading: `Congratulations, ${name}! You're In! 🏆`,
    body: `
      <p style="margin-top: 24px; line-height: 1.7;">
        We are incredibly proud to announce that you have successfully cleared the official recruitment process for ANARC! 🙌<br/><br/>
        We deeply respect the hard work, dedication, and sleepless hours you put in to earn this spot. Out of many brilliant minds, your passion and skill stood out.<br/><br/>
        It is a true honour to officially welcome you into the ANARC family. We cannot wait to build, innovate, and break boundaries alongside you.<br/><br/>
        Your final step to making it official is right here — click the button below to set up your account and step into the lab!
      </p>
      <a href="${inviteLink}"
        style="display: inline-block; margin-top: 28px; padding: 12px 28px; background: #5eeaf0; color: #0f172a; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(94, 234, 240, 0.3);">
        Accept Invitation
      </a>
      <p style="margin-top: 28px; font-size: 13px; color: #64748b; line-height: 1.6;">
        This official onboarding link expires in 48 hours and can only be used once.<br/>
        If you have any trouble setting up your profile, reach out to the core team.
      </p>
      <p style="margin-top: 24px; font-size: 13px; color: #5eeaf0; font-weight: 600;">
        Welcome to the future of robotics,<br/>
        — Team ANARC
      </p>
    `,
  });
  return sendMail({
    to,
    subject: "You're invited to join ANARC",
    html,
  });
}

// ─── Member: Invite to Apply ───────────────────────────────────────────────
async function sendApplyInviteEmail({ to, name }) {
  const applyLink = `${process.env.FRONTEND_URL}/apply`;
  const html = wrapEmail({
    heading: `Hey ${name}, we think you'd be a great fit! 🤖`,
    body: `
      <p style="margin-top: 24px; line-height: 1.7;">
        We've noticed your passion and curiosity, and honestly — we think you belong here at ANARC.<br/><br/>
        We build autonomous rovers, embedded systems, and open-source machines that push the boundaries of what's possible. And we believe you have what it takes to be part of that journey.<br/><br/>
        We'd love to see you walk through our doors — not just as a visitor, but as someone who helps shape what we build next.<br/><br/>
        If you're up for the challenge, click below to begin your application. We'll be rooting for you every step of the way. 💙
      </p>
      <a href="${applyLink}"
        style="display: inline-block; margin-top: 28px; padding: 12px 28px; background: #5eeaf0; color: #0f172a; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(94, 234, 240, 0.3);">
        Apply to Join ANARC
      </a>
      <p style="margin-top: 28px; font-size: 13px; color: #64748b; line-height: 1.6;">
        This is a personal invite from one of our members who believes in you.<br/>
        The application is open — take your shot!
      </p>
      <p style="margin-top: 24px; font-size: 13px; color: #5eeaf0; font-weight: 600;">
        See you on the other side,<br/>
        — Team ANARC
      </p>
    `,
  });
  return sendMail({
    to,
    subject: "You're invited to apply for ANARC 🚀",
    html,
  });
}

// ─── Password Reset ────────────────────────────────────────────────────────
async function sendPasswordResetEmail({ to, name, resetLink }) {
  const html = wrapEmail({
    heading: "Reset Your Password 🔐",
    body: `
      <p style="margin-top: 24px;">Hey <strong>${name}</strong>, we received a request to reset your ANARC account password.</p>
      <p style="margin-top: 16px;">Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
      <a href="${resetLink}"
        style="display: inline-block; margin-top: 28px; padding: 12px 28px; background: #5eeaf0; color: #0f172a; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(94, 234, 240, 0.3);">
        Reset Password
      </a>
      <p style="margin-top: 28px; font-size: 13px; color: #64748b; line-height: 1.6;">
        If you didn't request this, you can safely ignore this email — your password won't change.<br/>
        This link can only be used once and expires in 1 hour.
      </p>
      <p style="margin-top: 24px; font-size: 13px; color: #5eeaf0; font-weight: 600;">
        — Team ANARC
      </p>
    `,
  });
  return sendMail({
    to,
    subject: "Reset your ANARC password 🔐",
    html,
  });
}

module.exports = {
  sendMail,
  sendApplicationSubmittedEmail,
  sendAdmitCardEmail,
  sendApplicationRejectedEmail,
  sendExamPassedEmail,
  sendExamFailedEmail,
  sendInterviewInviteEmail,
  sendInterviewPassedEmail,
  sendInterviewFailedEmail,
  sendWelcomeEmail,
  sendInviteEmail,
  sendApplyInviteEmail,
  sendPasswordResetEmail,
};