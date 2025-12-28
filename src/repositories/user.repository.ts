import { PrismaClient, Role } from "@prisma/client"
import { CreateUserDto } from "../models/user"

const prisma = new PrismaClient()

export class UserRepository {
  // создание пользователя
  async create(
    userData: Omit<CreateUserDto, "birthDate"> & {
      password: string
      birthDate: Date
      role?: Role
    }
  ) {
    return prisma.user.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        middleName: userData.middleName,
        birthDate: userData.birthDate,
        email: userData.email,
        password: userData.password,
        role: userData.role || Role.USER
      }
    })
  }

  // поиск по почте
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    })
  }

  // поиск по ID
  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id }
    })
  }

  // получение всех пользователей (с пагинацией)
  async findAll(skip = 0, take = 100) {
    return prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" }
    })
  }

  // обновление статуса
  async updateStatus(id: number, isActive: boolean) {
    return prisma.user.update({
      where: { id },
      data: { isActive }
    })
  }

  // удаление пользователя
  async delete(id: number) {
    return prisma.user.delete({
      where: { id }
    })
  }
}

export const userRepository = new UserRepository()
