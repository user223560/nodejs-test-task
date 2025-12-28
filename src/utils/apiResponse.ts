import http from "http"

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500
}

// успешный ответ
export function successResponse<T>(
  res: http.ServerResponse,
  data: T,
  statusCode: HttpStatus = HttpStatus.OK
) {
  res.writeHead(statusCode, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ success: true, data }))
}

// ответ с ошибкой
export function errorResponse(
  res: http.ServerResponse,
  message: string,
  statusCode: HttpStatus = HttpStatus.BAD_REQUEST
) {
  res.writeHead(statusCode, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ success: false, error: message }))
}

// обработчик ошибок
export function errorHandler(res: http.ServerResponse, error: any) {
  console.error("Ошибка:", error)

  if (error instanceof Error) {
    // обработка известных ошибок
    switch (error.message) {
      case "Пользователь с таким email уже существует":
        return errorResponse(res, error.message, HttpStatus.CONFLICT)
      case "Неверный email или пароль":
      case "Невалидный токен":
        return errorResponse(res, error.message, HttpStatus.UNAUTHORIZED)
      case "Пользователь заблокирован":
      case "Недостаточно прав":
      case "Нельзя заблокировать самого себя":
        return errorResponse(res, error.message, HttpStatus.FORBIDDEN)
      case "Пользователь не найден":
        return errorResponse(res, error.message, HttpStatus.NOT_FOUND)
      case "Невалидный JSON":
      case "Требуется авторизация":
      case "Пользователь не авторизован":
        return errorResponse(res, error.message, HttpStatus.BAD_REQUEST)
      default:
        return errorResponse(
          res,
          "Внутренняя ошибка сервера",
          HttpStatus.INTERNAL_SERVER_ERROR
        )
    }
  }

  errorResponse(res, "Неизвестная ошибка", HttpStatus.INTERNAL_SERVER_ERROR)
}

// валидация JSON
export function parseJson<T>(body: string): T {
  try {
    return JSON.parse(body)
  } catch {
    throw new Error("Невалидный JSON")
  }
}
