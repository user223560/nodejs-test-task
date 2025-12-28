import http from "http"
import { authService } from "../services/auth.service"
import { errorResponse, HttpStatus } from "../utils/apiResponse"

export async function authMiddleware(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  next: () => Promise<void>
) {
  try {
    // получаем токен
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Требуется авторизация")
    }

    const token = authHeader.split(" ")[1]

    // валидируем
    const decoded = authService.validateToken(token)
    // добавление пользователя в запрос
    ;(req as any).user = decoded
    // вызов следующего обработчика
    await next()
  } catch (error) {
    if (error instanceof Error && error.message === "Требуется авторизация") {
      errorResponse(res, error.message, HttpStatus.UNAUTHORIZED)
    } else {
      errorResponse(res, "Невалидный токен", HttpStatus.UNAUTHORIZED)
    }
  }
}
