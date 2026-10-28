// prisma/seed.js

const { PrismaClient } = require("../generated/prisma");  
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Check environment variables
  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be defined in the .env file"
    );
  }

  console.log("⏳ Checking if admin already exists...");

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (existingAdmin) {
    console.log("ℹ️ Admin user already exists. Skipping creation.");
    return;
  }

  console.log("🔑 Hashing password...");

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  console.log("🚀 Creating admin user...");

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Ashish Kiran",
      siteRole: "ADMIN",           
      photo: "https://res.cloudinary.com/gd5c2yad/image/upload/v1788554737/WhatsApp_Image_2026-09-05_at_02.12.53.jpg",
      password: hashedPassword,
    },
  });

  console.log(`✅ Admin user created successfully with ID: ${admin.id}`);
}

main()
  .catch((error) => {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });