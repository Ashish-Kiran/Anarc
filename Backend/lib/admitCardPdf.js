const PDFDocument = require("pdfkit");
const path = require("path");

function generateAdmitCardPDF({ admitCardId, name, rollNumber, branch, examDate, venue }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const logoPath = path.join(__dirname, "..", "public", "AnarcLogo.png");
    const formattedDate = new Date(examDate).toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
    });

    // ── Header ──
    try {
      doc.image(logoPath, 50, 45, { width: 60 });
    } catch (e) {
      // logo missing, skip silently
    }

    doc
      .fontSize(20)
      .fillColor("#0f172a")
      .text("ANARC", 120, 50)
      .fontSize(10)
      .fillColor("#64748b")
      .text("NIT Agartala Robotics Club", 120, 75);

    doc.moveDown(3);

    // ── Title ──
    doc
      .moveTo(50, 120)
      .lineTo(545, 120)
      .strokeColor("#5eeaf0")
      .lineWidth(2)
      .stroke();

    doc
      .fontSize(18)
      .fillColor("#0f172a")
      .text("EXAM ADMIT CARD", 50, 140, { align: "center" });

    // ── Admit Card ID ──
    doc
      .fontSize(10)
      .fillColor("#64748b")
      .text(`Admit Card ID: ${admitCardId}`, 50, 175, { align: "center" });

    // ── Details box ──
    const boxTop = 220;
    doc
      .roundedRect(50, boxTop, 495, 220, 6)
      .strokeColor("#cbd5e1")
      .lineWidth(1)
      .stroke();

    const rows = [
      ["Candidate Name", name],
      ["Roll Number", rollNumber],
      ["Branch", branch || "—"],
      ["Exam Date & Time", formattedDate],
      ["Venue", venue || "To be announced"],
    ];

    let y = boxTop + 25;
    rows.forEach(([label, value]) => {
      doc
        .fontSize(11)
        .fillColor("#64748b")
        .text(label, 70, y, { width: 180 })
        .fillColor("#0f172a")
        .fontSize(12)
        .text(value, 260, y, { width: 260 });
      y += 38;
    });

    // ── Footer / instructions ──
    doc
      .fontSize(9)
      .fillColor("#94a3b8")
      .text(
        "Please carry this admit card along with your college ID card to the exam venue. Arrive at least 15 minutes before the scheduled time.",
        50,
        boxTop + 240,
        { width: 495, align: "center" }
      );

    doc.end();
  });
}

module.exports = { generateAdmitCardPDF };