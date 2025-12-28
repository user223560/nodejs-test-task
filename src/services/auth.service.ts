import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { BCRYPT_SALT_ROUNDS } from "../config/const"
import { AuthResponse, CreateUserDto, LoginDto, Role } from "../models/user"
import { userRepository } from "../repositories/user.repository"

export class AuthService {
  // регистрация пользователя
  async register(
    userData: CreateUserDto
  ): Promise<Omit<AuthResponse, "token">> {
    // проверка наличия пользователя с таким же email
    const existingUser = await userRepository.findByEmail(userData.email)
    if (existingUser) {
      throw new Error("Пользователь с таким email уже существует")
    }

    // хеширование пароля
    const hashedPassword = await bcrypt.hash(
      userData.password,
      BCRYPT_SALT_ROUNDS
    )

    // преобразование строки даты в объект Date
    const birthDate = new Date(userData.birthDate)

    // проверка валидности даты
    if (isNaN(birthDate.getTime())) {
      throw new Error("Некорректная дата рождения")
    }

    // создание пользователя
    const user = await userRepository.create({
      ...userData,
      password: hashedPassword,
      birthDate: birthDate,
      role: Role.USER
    })

    // возвращаем юзера без пароля
    const { password: _, ...userWithoutPassword } = user
    return { user: userWithoutPassword }
  }

  // авторизация (вход)
  async login(loginData: LoginDto): Promise<AuthResponse> {
    // Находим пользователя по почте
    const user = await userRepository.findByEmail(loginData.email)
    if (!user) {
      throw new Error("Неверный email или пароль")
    }

    // проверка статуса юзера
    if (!user.isActive) {
      throw new Error("Пользователь заблокирован")
    }

    // проверка пароля
    const isPasswordValid = await bcrypt.compare(
      loginData.password,
      user.password
    )
    if (!isPasswordValid) {
      throw new Error("Неверный email или пароль")
    }

    // создание JWT токена
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    )

    // возвращаем токен и юзера без пароля
    const { password: _, ...userWithoutPassword } = user
    return { token, user: userWithoutPassword }
  }

  // валидация токена (нужна для middleware)
  validateToken(token: string) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!)
    } catch (error) {
      throw new Error("Невалидный токен")
    }
  }
}

export const authService = new AuthService()
