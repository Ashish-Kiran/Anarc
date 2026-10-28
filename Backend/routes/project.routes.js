// routes/project.routes.js

const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const { authenticate, requireAdmin } = require("../middlewares/auth.middleware");

// ─── Create Project (admin) ────────────────────────────────────────────────
router.post("/project", authenticate, async (req, res) => {
  try {
    const { title, description, imageUrl, githubUrl, isActive } = req.body;
    if (!title || !description)
      return res.status(400).json({ error: "Title and description are required" });

    const project = await prisma.project.create({
      data: {
        title,
        description,
        imageUrl,
        githubUrl,
        isActive: isActive ?? true,
        authorId: req.user.id,
      },
      include: { author: { select: { id: true, name: true } } },
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get All Projects (public — only active) ───────────────────────────────
router.get("/projects", async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get All Projects (admin — including inactive) ─────────────────────────
router.get("/admin/projects", authenticate, requireAdmin, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get Single Project (public) ───────────────────────────────────────────
router.get("/project/:id", async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { author: { select: { id: true, name: true } } },
    });

    if (!project)
      return res.status(404).json({ error: "Project not found" });

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Edit Project (admin) ──────────────────────────────────────────────────
router.patch("/project/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl, githubUrl, isActive } = req.body;

    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { author: { select: { id: true, name: true } } },
    });

    res.json(project);
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ error: "Project not found" });
    res.status(500).json({ error: err.message });
  }
});

// ─── Delete Project (admin) ────────────────────────────────────────────────
router.delete("/project/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.project.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "Project deleted" });
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ error: "Project not found" });
    res.status(500).json({ error: err.message });
  }
});

// ─── Get My Projects (member) ──────────────────────────────────────────────
router.get("/my-projects", authenticate, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { authorId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;