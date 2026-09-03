const express = require("express");
const app = express();
const prisma = require("./prismaClient");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const cors = require('cors')
app.use(cors())

app.use(express.json());

app.get("/", (req, res) => {
  res.send("ANARC Backend is running!");
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post('/user', async (req, res) => {
  const { name, email, password, batch, instagram, linkedin, github, role } = req.body
  const user = await prisma.user.create({
    data: { name, email, password, batch, instagram, linkedin, github, role }
  })
  res.json(user)
})

app.post("/apply", async (req, res) => {
  const { name, email, rollNumber, branch, year, reason } = req.body;
  const application = await prisma.application.create({
    data: { name, email, rollNumber, branch, year, reason },
  });
  res.json(application);
});

app.post("/event", async (req, res) => {
  const { title, description, date } = req.body;
  const event = await prisma.event.create({
    data: { title, description, date: new Date(date) },
  });
  res.json(event);
});

app.get("/events", async (req, res) => {
  const events = await prisma.event.findMany();
  res.json(events);
});

app.post("/project", async (req, res) => {
  const { title, description, imageUrl, githubUrl } = req.body;
  const project = await prisma.project.create({
    data: { title, description, imageUrl, githubUrl },
  });
  res.json(project);
});

app.get("/projects", async (req, res) => {
  const projects = await prisma.project.findMany();
  res.json(projects);
});

app.post("/announcement", async (req, res) => {
  const { content } = req.body;
  const announcement = await prisma.announcement.create({
    data: { content },
  });
  res.json(announcement);
});

app.get("/announcements", async (req, res) => {
  const announcements = await prisma.announcement.findMany();
  res.json(announcements);
});

app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  const contact = await prisma.contactMessage.create({
    data: { name, email, message },
  });

  const members = await prisma.user.findMany();
  console.log("members:", members);

  await prisma.notification.createMany({
    data: members.map((member) => ({
      userId: member.id,
      messageId: contact.id,
    })),
  });

  res.json(contact);
});

app.get("/contacts", async (req, res) => {
  const contacts = await prisma.contactMessage.findMany();
  res.json(contacts);
});

app.get("/notifications", async (req, res) => {
  const notifications = await prisma.notification.findMany({
    include: { message: true, user: true },
  });
  res.json(notifications);
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body
  
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ id: user.id, role: user.role }, 'anarc_secret', { expiresIn: '7d' })
  
  res.json({ token, user: { id: user.id, name: user.name, role: user.role, photo: user.photo, batch: user.batch } })
})

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
