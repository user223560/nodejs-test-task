import { Role } from "@prisma/client"
import http from "http"
import { userIdSchema } from "../models/schemas"
import { UpdateStatusDto } from "../models/user"
import { userService } from "../services/user.service"
import {
  errorResponse,
  HttpStatus,
  parseJson,
  successResponse
} from "../utils/apiResponse"

export class UserController {
  // получение пользователя по ID
  async getUserById(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    userId: number
  ) {
    try {
      // валидация ID (уже сделано в маршрутизаторе, но проверяем еще раз)
      userIdSchema.parse({ id: userId.toString() })

      // получение текущего пользователя из запроса (добавлено в middleware)
      const currentUser = (req as any).user
      if (!currentUser) {
        throw new Error("Пользователь не авторизован")
      }

      // вызов сервиса
      const user = await userService.getUserById(userId, {
        id: currentUser.userId,
        role: currentUser.role as Role
      })

      // возврат результата
      successResponse(res, user)
    } catch (error: any) {
      if (error.message.includes("не найден")) {
        return errorResponse(res, error.message, HttpStatus.NOT_FOUND)
      }
      if (error.message.includes("Недостаточно прав")) {
        return errorResponse(res, error.message, HttpStatus.FORBIDDEN)
      }
      errorResponse(res, error.message, HttpStatus.BAD_REQUEST)
    }
  }

  // получение списка всех пользователей
  async getAllUsers(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    query: any
  ) {
    try {
      // получаем текущего пользователя
      const currentUser = (req as any).user
      if (!currentUser) {
        throw new Error("Пользователь не авторизован")
      }

      // парсинг параметров пагинации
      const skip = query.skip ? parseInt(query.skip) : 0
      const take = query.take ? parseInt(query.take) : 100

      // вызов сервиса
      const users = await userService.getAllUsers(
        { role: currentUser.role as Role },
        skip,
        Math.min(take, 100) // Ограничиваем максимум 100 записей
      )

      // возврат результата с метаданными
      successResponse(res, {
        users,
        pagination: {
          skip,
          take: Math.min(take, 100),
          total: users.length
        }
      })
    } catch (error: any) {
      if (error.message.includes("Недостаточно прав")) {
        return errorResponse(res, error.message, HttpStatus.FORBIDDEN)
      }
      errorResponse(res, error.message, HttpStatus.BAD_REQUEST)
    }
  }

  // блокировка/разблокировка пользователя
  async updateUserStatus(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    userId: number,
    body: string
  ) {
    try {
      // валидация ID
      userIdSchema.parse({ id: userId.toString() })

      // парсинг и валидация тела запроса
      const data = parseJson<UpdateStatusDto>(body)

      // проверка isActive на boolean
      if (typeof data.isActive !== "boolean") {
        throw new Error("Поле isActive должно быть boolean")
      }

      // получение текущего юзера
      const currentUser = (req as any).user
      if (!currentUser) {
        throw new Error("Пользователь не авторизован")
      }

      // вызов сервиса
      const updatedUser = await userService.updateUserStatus(
        userId,
        data.isActive,
        {
          id: currentUser.userId,
          role: currentUser.role as Role
        }
      )

      // возврат результата
      successResponse(res, {
        message: `Пользователь ${data.isActive ? "разблокирован" : "заблокирован"}`,
        user: updatedUser
      })
    } catch (error: any) {
      if (error.message.includes("не найден")) {
        return errorResponse(res, error.message, HttpStatus.NOT_FOUND)
      }
      if (
        error.message.includes("Недостаточно прав") ||
        error.message.includes("Нельзя заблокировать")
      ) {
        return errorResponse(res, error.message, HttpStatus.FORBIDDEN)
      }
      errorResponse(res, error.message, HttpStatus.BAD_REQUEST)
    }
  }
}

export const userController = new UserController()
