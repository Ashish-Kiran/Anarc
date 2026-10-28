// routes/auth.routes.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { PrismaClient } = require("../generated/prisma");
const { authenticate, requireAdmin } = require("../middlewares/auth.middleware");
const { sendInviteEmail } = require("../lib/mailer");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// ─── Admin: Send Invite ────────────────────────────────────────────────────
router.post("/admin/invite", authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: "Name is required" });
    if (!email)
      return res.status(400).json({ error: "Email is required" });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(409).json({ error: "This email is already a member" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await prisma.inviteToken.upsert({
      where: { email },
      update: { name: name.trim(), token, used: false, expiresAt },
      create: { name: name.trim(), email, token, expiresAt },
    });

    const inviteLink = `${process.env.FRONTEND_URL}/invite/accept?token=${token}`;

    try {
      await sendInviteEmail({ to: email, name: name.trim(), inviteLink });
    } catch (mailErr) {
      console.error("Failed to send invite email:", mailErr);
      return res.status(500).json({ error: "Failed to send invite email" });
    }

    res.json({ message: `Invite sent to ${email}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Verify Invite Token ───────────────────────────────────────────────────
router.get("/invite/verify", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Token is required" });

    const invite = await prisma.inviteToken.findUnique({ where: { token } });

    if (!invite)
      return res.status(400).json({ valid: false, error: "Invalid invite link" });
    if (invite.used)
      return res.status(400).json({ valid: false, error: "This invite link has already been used" });
    if (new Date() > invite.expiresAt)
      return res.status(400).json({ valid: false, error: "This invite link has expired" });

    res.json({ valid: true, name: invite.name, email: invite.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Accept Invite ─────────────────────────────────────────────────────────
router.post("/invite/accept", async (req, res) => {
  try {
    const { token, name, password, batch, instagram, linkedin, github } = req.body;

    if (!token || !name || !password)
      return res.status(400).json({ error: "Token, name, and password are required" });

    const invite = await prisma.inviteToken.findUnique({ where: { token } });

    if (!invite)
      return res.status(400).json({ error: "Invalid invite link" });
    if (invite.used)
      return res.status(400).json({ error: "This invite link has already been used" });
    if (new Date() > invite.expiresAt)
      return res.status(400).json({ error: "This invite link has expired" });

    const existingUser = await prisma.user.findUnique({ where: { email: invite.email } });
    if (existingUser)
      return res.status(409).json({ error: "An account with this email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: invite.email,
          name,
          password: hashedPassword,
          batch,
          instagram,
          linkedin,
          github,
          siteRole: "MEMBER",
        },
      });

      await tx.inviteToken.update({
        where: { token },
        data: { used: true },
      });

      return newUser;
    });

    const jwtToken = jwt.sign(
      { id: user.id, siteRole: user.siteRole },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...safeUser } = user;
    res.json({
      message: "Account created successfully",
      token: jwtToken,
      user: safeUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Member / Admin Login ──────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(404).json({ error: "No account found with this email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Incorrect password" });

    const token = jwt.sign(
      { id: user.id, siteRole: user.siteRole },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Get My Profile ────────────────────────────────────────────────────────
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        batch: true,
        instagram: true,
        linkedin: true,
        github: true,
        siteRole: true,
        createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Create User Manually (admin only) ────────────────────────────────────
router.post("/user", authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, batch, instagram, linkedin, github, siteRole } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email, password required" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        batch,
        instagram,
        linkedin,
        github,
        siteRole: siteRole || "MEMBER",
      },
    });

    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error(err);
    if (err.code === "P2002")
      return res.status(409).json({ error: "Email already exists" });
    res.status(500).json({ error: "Something went wrong" });
  }
});

const { sendApplyInviteEmail } = require("../lib/mailer"); // add to existing import

// ─── Member: Invite to Apply ───────────────────────────────────────────────
router.post("/member/invite", authenticate, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: "Name and email are required" });

    try {
      await sendApplyInviteEmail({ to: email, name: name.trim() });
    } catch (mailErr) {
      console.error("Failed to send invite email:", mailErr);
      return res.status(500).json({ error: "Something went wrong" });
    }

    res.json({ message: `Invite sent to ${email}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Update My Profile ─────────────────────────────────────────────────────
router.patch("/me", authenticate, async (req, res) => {
  try {
    const { name, photo, batch, instagram, linkedin, github, orgRole, currentPassword, newPassword } = req.body;

    // ── If changing password, verify current first ──
    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ error: "Current password is required" });

      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(401).json({ error: "Current password is incorrect" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(photo !== undefined && { photo }),
        ...(batch !== undefined && { batch }),
        ...(instagram !== undefined && { instagram }),
        ...(linkedin !== undefined && { linkedin }),
        ...(github !== undefined && { github }),
        ...(orgRole !== undefined && { orgRole }),
        ...(newPassword && { password: await bcrypt.hash(newPassword, 10) }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        batch: true,
        instagram: true,
        linkedin: true,
        github: true,
        orgRole: true,
        siteRole: true,
        createdAt: true,
      },
    });

    // ── Update localStorage on frontend with new user data ──
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const { sendPasswordResetEmail } = require("../lib/mailer"); // add to existing import

// ─── Request Password Reset ────────────────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });

    // Don't reveal if email exists or not
    if (!user) return res.json({ message: "If that email exists, a reset link has been sent" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: { token, expiresAt },
      create: { userId: user.id, token, expiresAt },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail({ to: email, name: user.name, resetLink });
    } catch (mailErr) {
      console.error("Failed to send reset email:", mailErr);
      return res.status(500).json({ error: "Something went wrong" });
    }

    res.json({ message: "If that email exists, a reset link has been sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Reset Password ────────────────────────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ error: "Token and new password are required" });

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken)
      return res.status(400).json({ error: "Invalid or expired reset link" });
    if (new Date() > resetToken.expiresAt)
      return res.status(400).json({ error: "Reset link has expired" });

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });

    await prisma.passwordResetToken.delete({ where: { token } });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;