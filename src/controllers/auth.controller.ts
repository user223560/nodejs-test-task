import http from "http"
import { createUserSchema, loginSchema } from "../models/schemas"
import { CreateUserDto, LoginDto } from "../models/user"
import { authService } from "../services/auth.service"
import {
  errorResponse,
  HttpStatus,
  parseJson,
  successResponse
} from "../utils/apiResponse"

export class AuthController {
  // регистрация пользователя
  async register(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    body: string
  ) {
    try {
      // парсинг и валидация JSON
      const data = parseJson<CreateUserDto>(body)

      // валидация с помощью Zod
      const validatedData = createUserSchema.parse(data)

      // вызов сервиса регистрации
      const result = await authService.register(validatedData)

      // возврат успешного ответа
      successResponse(res, result, HttpStatus.CREATED)
    } catch (error: any) {
      // обработка ошибок валидации Zod
      if (error.name === "ZodError") {
        const errorMessage = error.errors
          .map((err: any) => `${err.path.join(".")}: ${err.message}`)
          .join(", ")
        return errorResponse(
          res,
          `Ошибка валидации: ${errorMessage}`,
          HttpStatus.BAD_REQUEST
        )
      }

      // обработка остальных ошибок
      if (error.message.includes("уже существует")) {
        return errorResponse(res, error.message, HttpStatus.CONFLICT)
      }

      errorResponse(res, error.message, HttpStatus.BAD_REQUEST)
    }
  }

  // авторизация
  async login(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    body: string
  ) {
    try {
      // парсинг и валидация JSON
      const data = parseJson<LoginDto>(body)

      // валидация с помощью Zod
      const validatedData = loginSchema.parse(data)

      // вызов сервис авторизации
      const result = await authService.login(validatedData)

      // возвращаем токен и данные юзера
      successResponse(res, result)
    } catch (error: any) {
      // обработка ошибок валидации Zod
      if (error.name === "ZodError") {
        const errorMessage = error.errors
          .map((err: any) => `${err.path.join(".")}: ${err.message}`)
          .join(", ")
        return errorResponse(
          res,
          `Ошибка валидации: ${errorMessage}`,
          HttpStatus.BAD_REQUEST
        )
      }

      // обработка ошибок авторизации
      if (
        error.message.includes("Неверный") ||
        error.message.includes("заблокирован")
      ) {
        return errorResponse(res, error.message, HttpStatus.UNAUTHORIZED)
      }

      errorResponse(res, error.message, HttpStatus.BAD_REQUEST)
    }
  }
}

export const authController = new AuthController()
