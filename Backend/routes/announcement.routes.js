// routes/announcement.routes.js

const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const { authenticate, requireAdmin } = require("../middlewares/auth.middleware");

// ─── Create Announcement (member or admin) ─────────────────────────────────
router.post("/announcement", authenticate, async (req, res) => {
  try {
    const { title, content, imageUrl, isActive } = req.body;
    if (!title || !content)
      return res.status(400).json({ error: "Title and content are required" });

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        isActive: isActive ?? false,
        authorId: req.user.id,
      },
      include: { author: { select: { id: true, name: true } } },
    });

    res.json(announcement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Get All Active Announcements (public) ─────────────────────────────────
router.get("/announcements", async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    });
    res.json(announcements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Get All Announcements (admin — including inactive) ────────────────────
router.get("/admin/announcements", authenticate, requireAdmin, async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    });
    res.json(announcements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Edit Announcement (admin only) ───────────────────────────────────────
router.patch("/announcement/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;

    const announcement = await prisma.announcement.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
      include: { author: { select: { id: true, name: true } } },
    });

    res.json(announcement);
  } catch (err) {
    console.error(err);
    if (err.code === "P2025")
      return res.status(404).json({ error: "Announcement not found" });
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Toggle isActive (admin only) ─────────────────────────────────────────
router.patch("/announcement/:id/toggle", authenticate, requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.announcement.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!existing)
      return res.status(404).json({ error: "Announcement not found" });

    const announcement = await prisma.announcement.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: !existing.isActive },
    });

    res.json({
      message: `Announcement ${announcement.isActive ? "activated" : "deactivated"}`,
      announcement,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Delete Announcement (admin only) ─────────────────────────────────────
router.delete("/announcement/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.announcement.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025")
      return res.status(404).json({ error: "Announcement not found" });
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── Get My Announcements (member) ────────────────────────────────────────
router.get("/my-announcements", authenticate, async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { authorId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;