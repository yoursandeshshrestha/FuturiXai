import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create two demo users
  const user1 = await prisma.user.create({
    data: {
      email: "sandeshshrestha@gmail.com",
      name: "Sandesh Shrestha",
      password: hashedPassword,
      provider: "credentials",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "manasvikapoor@gmail.com",
      name: "Manasvi Kapoor",
      password: hashedPassword,
      provider: "credentials",
    },
  });

  console.log("Seed completed successfully!");
  console.log("Demo Users:");
  console.log("User 1: sandeshshrestha@gmail.com / password123");
  console.log("User 2: manasvikapoor@gmail.com / password123");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
