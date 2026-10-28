// index.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth.routes");
const applicationRoutes = require("./routes/application.routes");
const announcementRoutes = require("./routes/announcement.routes");
const eventRoutes = require("./routes/event.routes");
const projectRoutes = require("./routes/project.routes");

app.use("/", authRoutes);
app.use("/", applicationRoutes);
app.use("/", announcementRoutes);
app.use("/", eventRoutes);
app.use("/", projectRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));