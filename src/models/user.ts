import { Role } from "@prisma/client"

export { Role }

export interface User {
  id: number
  firstName: string
  lastName: string
  middleName?: string | null
  birthDate: Date
  email: string
  password: string
  role: Role
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserDto {
  firstName: string
  lastName: string
  middleName?: string
  birthDate: string
  email: string
  password: string
}

export interface LoginDto {
  email: string
  password: string
}

export type SafeUser = Omit<User, "password">

export interface AuthResponse {
  token: string
  user: SafeUser
}

// для обновления статуса
export interface UpdateStatusDto {
  isActive: boolean
}
