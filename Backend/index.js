const express = require("express");
const app = express();
const prisma = require("./prismaClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "anarc_secret";

// ─── Middleware ────────────────────────────────────────────────────────────

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "No token provided" });

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN")
    return res.status(403).json({ error: "Admins only" });
  next();
};

// ─── Health ────────────────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.send("ANARC Backend is running!");
});

// ─── Auth ──────────────────────────────────────────────────────────────────

// Member / Admin login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // OAuth user trying to use password login
    if (!user.password)
      return res.status(401).json({ error: "Please login with OAuth" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
        batch: user.batch,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Applicant login
app.post("/applicant/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const application = await prisma.application.findUnique({
      where: { email },
      include: { admitCard: true },
    });
    if (!application)
      return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, application.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: application.id, type: "APPLICANT" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      application: {
        id: application.id,
        name: application.name,
        email: application.email,
        status: application.status,
        admitCard: application.admitCard,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Users ─────────────────────────────────────────────────────────────────

// Get all users (admin only)
app.get("/users", authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        batch: true,
        instagram: true,
        linkedin: true,
        github: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create user manually (admin only)
app.post("/user", authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, batch, instagram, linkedin, github, role } =
      req.body;
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
        role: role || "MEMBER",
      },
    });

    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    if (err.code === "P2002")
      return res.status(409).json({ error: "Email already exists" });
    res.status(500).json({ error: err.message });
  }
});

// Get my profile
app.get("/me", authenticate, async (req, res) => {
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
        role: true,
        createdAt: true,
      },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update my profile
app.put("/me", authenticate, async (req, res) => {
  try {
    const { name, photo, batch, instagram, linkedin, github } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, photo, batch, instagram, linkedin, github },
      select: {
        id: true, name: true, email: true, photo: true,
        batch: true, instagram: true, linkedin: true, github: true,
      },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user (admin only)
app.delete("/user/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Applications ──────────────────────────────────────────────────────────

// Submit application (public)
app.post("/apply", async (req, res) => {
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
        year,  // must be FIRST | SECOND | THIRD | FOURTH
        batch,
        reason,
      },
    });

    const { password: _, ...safeApplication } = application;
    res.json(safeApplication);
  } catch (err) {
    if (err.code === "P2002")
      return res.status(409).json({ error: "Email or roll number already exists" });
    res.status(500).json({ error: err.message });
  }
});

// Get all applications (admin only)
app.get("/applications", authenticate, requireAdmin, async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      select: {
        id: true, name: true, email: true, rollNumber: true,
        branch: true, year: true, batch: true, reason: true,
        status: true, createdAt: true, admitCard: true,
      },
    });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept application → create User (admin only)
app.post("/application/:id/accept", authenticate, requireAdmin, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application)
      return res.status(404).json({ error: "Application not found" });
    if (application.status !== "PENDING")
      return res.status(400).json({ error: "Application already processed" });

    // Create User from application data
    const user = await prisma.user.create({
      data: {
        name: application.name,
        email: application.email,
        password: application.password, // already hashed
        batch: application.batch,
        role: "MEMBER",
      },
    });

    // Update application status and link user
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status: "ACCEPTED", userId: user.id },
    });

    res.json({ message: "Application accepted, member created", userId: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject application (admin only)
app.post("/application/:id/reject", authenticate, requireAdmin, async (req, res) => {
  try {
    const application = await prisma.application.update({
      where: { id: parseInt(req.params.id) },
      data: { status: "REJECTED" },
    });
    res.json({ message: "Application rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admit Card ────────────────────────────────────────────────────────────

// Issue admit card (admin only)
app.post("/application/:id/admit-card", authenticate, requireAdmin, async (req, res) => {
  try {
    const { examDate, venue } = req.body;
    const admitCard = await prisma.admitCard.create({
      data: {
        applicationId: parseInt(req.params.id),
        examDate: new Date(examDate),
        venue,
      },
    });
    res.json(admitCard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Events ────────────────────────────────────────────────────────────────

// Create event (admin only)
app.post("/event", authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const event = await prisma.event.create({
      data: { title, description, date: new Date(date), authorId: req.user.id },
    });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all events (public)
app.get("/events", async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: "asc" },
      include: { author: { select: { name: true } } },
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete event (admin only)
app.delete("/event/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Projects ──────────────────────────────────────────────────────────────

// Create project (admin only)
app.post("/project", authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl, githubUrl } = req.body;
    const project = await prisma.project.create({
      data: { title, description, imageUrl, githubUrl, authorId: req.user.id },
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all projects (public)
app.get("/projects", async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { isActive: true },
      include: { author: { select: { name: true } } },
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete project (admin only)
app.delete("/project/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Announcements ─────────────────────────────────────────────────────────

// Create announcement (admin only)
app.post("/announcement", authenticate, requireAdmin, async (req, res) => {
  try {
    const { content, isActive } = req.body;
    const announcement = await prisma.announcement.create({
      data: { content, isActive: isActive || false, authorId: req.user.id },
    });
    res.json(announcement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get active announcements (public)
app.get("/announcements", async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
    });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle announcement active state (admin only)
app.patch("/announcement/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const announcement = await prisma.announcement.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive },
    });
    res.json(announcement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Contact ───────────────────────────────────────────────────────────────

// Submit contact message (public)
app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ error: "All fields are required" });

    const contact = await prisma.contactMessage.create({
      data: { name, email, message },
    });

    // Notify all admins only (not all members)
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          messageId: contact.id,
        })),
      });
    }

    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all contact messages (admin only)
app.get("/contacts", authenticate, requireAdmin, async (req, res) => {
  try {
    const contacts = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      include: { replies: { include: { user: { select: { name: true } } } } },
    });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reply to contact message (admin only)
app.post("/contact/:id/reply", authenticate, requireAdmin, async (req, res) => {
  try {
    const { content } = req.body;
    const reply = await prisma.reply.create({
      data: {
        content,
        userId: req.user.id,
        messageId: parseInt(req.params.id),
      },
    });
    res.json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Notifications ─────────────────────────────────────────────────────────

// Get my notifications (authenticated)
app.get("/notifications", authenticate, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { message: true },
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
app.patch("/notification/:id/read", authenticate, async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: parseInt(req.params.id) },
      data: { isRead: true },
    });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ─────────────────────────────────────────────────────────────────

app.listen(3000, () => {
  console.log("Server running on port 3000");
});