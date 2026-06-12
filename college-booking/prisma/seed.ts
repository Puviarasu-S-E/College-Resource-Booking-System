import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  await prisma.user.upsert({
    where: { email: "admin@college.edu" },
    update: {},
    create: { name: "Admin User", email: "admin@college.edu", password: adminPassword, role: "ADMIN" },
  });

  await prisma.user.upsert({
    where: { email: "student@college.edu" },
    update: {},
    create: { name: "John Student", email: "student@college.edu", password: userPassword, role: "USER" },
  });

  const resources = [
    { name: "Room 101", category: "Classroom", description: "40-seat lecture room with projector and whiteboard" },
    { name: "CS Lab A", category: "Laboratory", description: "Computer science lab with 30 workstations" },
    { name: "Main Seminar Hall", category: "Seminar Hall", description: "200-seat auditorium with AV equipment" },
    { name: "Projector Unit 1", category: "Projector", description: "Full HD portable projector for events" },
    { name: "Basketball Court", category: "Sports Facility", description: "Indoor basketball court, available after hours" },
    { name: "Room 202", category: "Classroom", description: "25-seat tutorial room with smart board" },
    { name: "Physics Lab", category: "Laboratory", description: "Physics experiments lab with safety equipment" },
  ];

  for (const r of resources) {
    const exists = await prisma.resource.findFirst({ where: { name: r.name } });
    if (!exists) await prisma.resource.create({ data: r });
  }

  console.log("✅ Seed complete");
  console.log("   Admin: admin@college.edu / admin123");
  console.log("   User:  student@college.edu / user123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
