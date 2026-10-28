// test-mailer.js
// Run with: node test-mailer.js
// Make sure EMAIL_USER, EMAIL_PASS, and TEST_TO are set (via .env or directly below)

require("dotenv").config();
const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const TEST_TO = process.env.TEST_TO || "ritikraushan812@gmail.com"; // hardcoded target for this test

console.log("── Config check ──");
console.log("EMAIL_USER:", EMAIL_USER ? EMAIL_USER : "❌ MISSING");
console.log("EMAIL_PASS:", EMAIL_PASS ? `${EMAIL_PASS.length} chars` : "❌ MISSING");
console.log("Sending to:", TEST_TO);
console.log("──────────────────\n");

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error("Missing EMAIL_USER or EMAIL_PASS in environment. Aborting.");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  logger: true,   // verbose SMTP protocol logs
  debug: true,    // include SMTP traffic in logs
});

async function main() {
  try {
    console.log("Verifying transporter connection...");
    await transporter.verify();
    console.log("✅ Transporter verified — SMTP connection & auth OK.\n");

    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: EMAIL_USER,
      to: TEST_TO,
      subject: `Test email — ${new Date().toISOString()}`,
      text: "This is a plain-text test email from test-mailer.js",
      html: "<p>This is a <strong>test email</strong> from test-mailer.js</p>",
    });

    console.log("\n── Send result ──");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
    console.log("Pending:", info.pending);
    console.log("─────────────────");

    if (info.rejected && info.rejected.length > 0) {
      console.warn("\n⚠️  Recipient was rejected by the server. Check the address / spam policies.");
    } else {
      console.log("\n✅ Email accepted by Gmail SMTP. Check inbox AND spam folder of:", TEST_TO);
      console.log("Also check the Sent folder of:", EMAIL_USER);
    }
  } catch (err) {
    console.error("\n❌ ERROR while sending:");
    console.error("Name:", err.name);
    console.error("Message:", err.message);
    console.error("Code:", err.code);
    console.error("Command:", err.command);
    console.error("Full error:", err);
  }
}

main();