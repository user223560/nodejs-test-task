import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()
const BCRYPT_SALT_ROUNDS = 10

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", BCRYPT_SALT_ROUNDS)

    const admin = await prisma.user.create({
      data: {
        firstName: "Админ",
        lastName: "Админов",
        birthDate: new Date("1980-01-01"),
        email: "admin@test.com",
        password: hashedPassword,
        role: "ADMIN",
        isActive: true
      }
    })

    console.log("Админ создан:", {
      id: admin.id,
      email: admin.email,
      role: admin.role
    })
  } catch (error) {
    console.error("Ошибка:", error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
