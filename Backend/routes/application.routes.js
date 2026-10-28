// routes/application.routes.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("../generated/prisma");
const { generateAdmitCardPDF } = require("../lib/admitCardPdf");
const { authenticate, requireAdmin } = require("../middlewares/auth.middleware");
const {
  sendApplicationSubmittedEmail,
  sendAdmitCardEmail,
  sendInterviewInviteEmail,
  sendWelcomeEmail,
} = require("../lib/mailer");

const prisma = new PrismaClient();

// ─── Submit Application (public) ───────────────────────────────────────────
router.post("/apply", async (req, res) => {
  try {
    const { name, email, password, rollNumber, branch, year, batch, reason } =
      req.body;
    if (!name || !email || !password || !rollNumber || !branch || !year || !reason)
      return res.status(400).json({ error: "All fields are required" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const application = await prisma.application.create({
      data: {
        name,
        email,
        password: hashedPassword,
        rollNumber,
        branch,
        year,
        batch,
        reason,
      },
    });

    try {
      await sendApplicationSubmittedEmail({ to: email, name });
    } catch (mailErr) {
      console.error("Failed to send confirmation email:", mailErr);
    }

    const { password: _, ...safeApplication } = application;
    res.json(safeApplication);
  } catch (err) {
    console.error(err);
    if (err.code === "P2002")
      return res.status(409).json({ error: "Email or roll number already exists" });
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Applicant Login ───────────────────────────────────────────────────────
router.post("/applicant/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const application = await prisma.application.findUnique({
      where: { email },
    });

    if (!application)
      return res.status(404).json({ error: "No application found with this email" });

    const isMatch = await bcrypt.compare(password, application.password);
    if (!isMatch)
      return res.status(401).json({ error: "Incorrect password" });

    const token = jwt.sign(
      { id: application.id, email: application.email, role: "APPLICANT" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...safeApplication } = application;
    res.json({ token, application: safeApplication });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Accept Application (admin) ────────────────────────────────────────────
router.post("/application/:id/accept", authenticate, requireAdmin, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application)
      return res.status(404).json({ error: "Application not found" });
    if (application.status !== "PENDING")
      return res.status(400).json({ error: "Application already processed" });

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "ACCEPTED" },
    });

    res.json({ message: "Application accepted, admit card can now be issued" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Reject Application (admin) ────────────────────────────────────────────
router.post("/application/:id/reject", authenticate, requireAdmin, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application)
      return res.status(404).json({ error: "Application not found" });
    if (application.status === "CONVERTED")
      return res.status(400).json({ error: "Cannot reject a converted member" });

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "REJECTED" },
    });

    res.json({ message: "Application rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Issue Admit Card (admin) ──────────────────────────────────────────────
router.post("/application/:id/admit-card", authenticate, requireAdmin, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { examDate, venue } = req.body;

    if (!examDate)
      return res.status(400).json({ error: "examDate is required" });

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { admitCard: true },
    });

    if (!application)
      return res.status(404).json({ error: "Application not found" });
    if (application.status !== "ACCEPTED")
      return res.status(400).json({
        error: "Application must be accepted before issuing admit card",
      });
    if (application.admitCard)
      return res.status(409).json({ error: "Admit card already issued for this application" });

    const admitCard = await prisma.admitCard.create({
      data: {
        applicationId,
        examDate: new Date(examDate),
        venue,
      },
    });

    const admitCardId = `ANARC-${new Date(admitCard.issuedAt).getFullYear()}-${admitCard.id}`;

    const pdfBuffer = await generateAdmitCardPDF({
      admitCardId,
      name: application.name,
      rollNumber: application.rollNumber,
      branch: application.branch,
      examDate,
      venue,
    });

    try {
      await sendAdmitCardEmail({
        to: application.email,
        name: application.name,
        examDate,
        venue,
        attachment: pdfBuffer,
      });
    } catch (mailErr) {
      console.error("Failed to send admit card email:", mailErr);
    }

    res.json(admitCard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Download Admit Card (applicant) ──────────────────────────────────────
router.get("/application/admit-card/download", authenticate, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.user.id },
      include: { admitCard: true },
    });

    if (!application)
      return res.status(404).json({ error: "Application not found" });
    if (!application.admitCard)
      return res.status(404).json({ error: "Admit card not yet issued" });

    const admitCardId = `ANARC-${new Date(application.admitCard.issuedAt).getFullYear()}-${application.admitCard.id}`;

    const pdfBuffer = await generateAdmitCardPDF({
      admitCardId,
      name: application.name,
      rollNumber: application.rollNumber,
      branch: application.branch,
      examDate: application.admitCard.examDate,
      venue: application.admitCard.venue,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="ANARC_Admit_Card.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Submit Exam Result (admin) ────────────────────────────────────────────
router.post("/application/:id/exam-result", authenticate, requireAdmin, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { examScore, maxScore, isPassed } = req.body;

    if (examScore === undefined || maxScore === undefined || isPassed === undefined)
      return res.status(400).json({ error: "examScore, maxScore and isPassed are required" });

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { admitCard: true },
    });

    if (!application)
      return res.status(404).json({ error: "Application not found" });
    if (application.status !== "ACCEPTED")
      return res.status(400).json({
        error: "Application must be in ACCEPTED status to submit exam result",
      });
    if (!application.admitCard)
      return res.status(400).json({ error: "No admit card found for this application" });

    await prisma.admitCard.update({
      where: { applicationId },
      data: { examScore, maxScore, isPassed },
    });

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: isPassed ? "EXAM_PASSED" : "EXAM_FAILED" },
    });

    res.json({
      message: isPassed
        ? "Exam passed — interview invite can now be sent"
        : "Exam failed — application marked as EXAM_FAILED",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Send Interview Invite (admin) ─────────────────────────────────────────
router.post("/application/:id/interview-invite", authenticate, requireAdmin, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { date, venue } = req.body;

    if (!date) return res.status(400).json({ error: "date is required" });

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { interviewInvite: true },
    });

    if (!application)
      return res.status(404).json({ error: "Application not found" });
    if (application.status !== "EXAM_PASSED")
      return res.status(400).json({
        error: "Applicant must have passed the exam before scheduling interview",
      });
    if (application.interviewInvite)
      return res.status(409).json({ error: "Interview already scheduled for this application" });

    const interviewInvite = await prisma.interviewInvite.create({
      data: {
        applicationId,
        date: new Date(date),
        venue,
      },
    });

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "INTERVIEW_SCHEDULED" },
    });

    try {
      await sendInterviewInviteEmail({
        to: application.email,
        name: application.name,
        date,
        venue,
      });
    } catch (mailErr) {
      console.error("Failed to send interview invite email:", mailErr);
    }

    res.json({
      message: `Interview scheduled and invite sent to ${application.email}`,
      interviewInvite,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Submit Interview Result (admin) ───────────────────────────────────────
router.post("/application/:id/interview-result", authenticate, requireAdmin, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { interviewScore, maxScore, isPassed, feedback } = req.body;

    if (interviewScore === undefined || maxScore === undefined || isPassed === undefined)
      return res.status(400).json({
        error: "interviewScore, maxScore and isPassed are required",
      });

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { interviewInvite: true },
    });

    if (!application)
      return res.status(404).json({ error: "Application not found" });
    if (application.status !== "INTERVIEW_SCHEDULED")
      return res.status(400).json({ error: "Application must be in INTERVIEW_SCHEDULED status" });
    if (!application.interviewInvite)
      return res.status(400).json({ error: "No interview invite found for this application" });

    await prisma.interviewInvite.update({
      where: { applicationId },
      data: { interviewScore, maxScore, isPassed, feedback },
    });

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: isPassed ? "INTERVIEW_PASSED" : "INTERVIEW_FAILED" },
    });

    res.json({
      message: isPassed
        ? "Interview passed — applicant can now be converted to member"
        : "Interview failed — admin can still invite them manually if needed",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Convert to Member (admin) ─────────────────────────────────────────────
router.post("/application/:id/convert", authenticate, requireAdmin, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { interviewInvite: true },
    });

    if (!application)
      return res.status(404).json({ error: "Application not found" });
    if (application.status !== "INTERVIEW_PASSED")
      return res.status(400).json({
        error: "Applicant must have passed the interview to be converted",
      });
    if (application.userId)
      return res.status(400).json({ error: "Applicant is already a member" });

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: application.name,
          email: application.email,
          password: application.password,
          batch: application.batch,
          siteRole: "MEMBER",
        },
      });

      await tx.application.update({
        where: { id: applicationId },
        data: { status: "CONVERTED", userId: newUser.id },
      });

      return newUser;
    });

    try {
      await sendWelcomeEmail({
        to: application.email,
        name: application.name,
      });
    } catch (mailErr) {
      console.error("Failed to send welcome email:", mailErr);
    }

    const { password: _, ...safeUser } = user;
    res.json({
      message: "Applicant successfully converted to member, welcome email sent",
      user: safeUser,
    });
  } catch (err) {
    console.error(err);
    if (err.code === "P2002")
      return res.status(409).json({ error: "A member with this email already exists" });
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Get Application Status (applicant) ────────────────────────────────────
router.get("/application/status", authenticate, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.user.id },
      include: {
        admitCard: true,
        interviewInvite: true,
      },
    });

    if (!application)
      return res.status(404).json({ error: "Application not found" });

    const { password: _, ...safeApplication } = application;
    res.json(safeApplication);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Get All Applications (admin) ──────────────────────────────────────────
router.get("/applications", authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    const applications = await prisma.application.findMany({
      where: status ? { status } : {},
      include: {
        admitCard: true,
        interviewInvite: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const safeApplications = applications.map(({ password, ...rest }) => rest);
    res.json(safeApplications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;