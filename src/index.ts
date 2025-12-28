import http from "http"
import { URL } from "url"
import { SERVER_CONFIG } from "./config/const"
import { authController } from "./controllers/auth.controller"
import { userController } from "./controllers/user.controller"
import { authMiddleware } from "./middleware/auth.middleware"
import { errorHandler } from "./utils/apiResponse"

const server = http.createServer(async (req, res) => {
  try {
    // устанавка заголовков CORS
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    )
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

    // обработка preflight запросов
    if (req.method === "OPTIONS") {
      res.writeHead(204)
      res.end()
      return
    }

    // парсинг URL для получения пути и query параметров
    const parsedUrl = new URL(req.url || "", `http://${req.headers.host}`)
    const pathname = parsedUrl.pathname
    const query = Object.fromEntries(parsedUrl.searchParams.entries())

    // читаем тело запроса (если есть)
    let body = ""
    if (req.method === "POST" || req.method === "PUT") {
      body = await readRequestBody(req)
    }

    // маршрутизация
    await handleRoutes(req, res, pathname, query, body)
  } catch (error) {
    errorHandler(res, error)
  }
})

// ф-ция для чтения тела запроса
function readRequestBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ""
    req.on("data", (chunk) => {
      body += chunk.toString()
    })
    req.on("end", () => {
      resolve(body)
    })
    req.on("error", reject)
  })
}

// ф-ция маршрутизации
async function handleRoutes(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  query: any,
  body: string
) {
  // устанавливка заголовка Content-Type
  res.setHeader("Content-Type", "application/json")

  // маршруты
  switch (true) {
    // аутентификация
    case pathname === "/api/register" && req.method === "POST":
      await authController.register(req, res, body)
      break

    case pathname === "/api/login" && req.method === "POST":
      await authController.login(req, res, body)
      break

    // пользователи (требуют авторизации)
    case pathname.startsWith("/api/users/") && req.method === "GET":
      await authMiddleware(req, res, () => {
        const id = parseInt(pathname.split("/")[3])
        return userController.getUserById(req, res, id)
      })
      break

    case pathname === "/api/users" && req.method === "GET":
      await authMiddleware(req, res, () => {
        return userController.getAllUsers(req, res, query)
      })
      break

    case pathname.startsWith("/api/users/") && req.method === "PUT":
      await authMiddleware(req, res, () => {
        const id = parseInt(pathname.split("/")[3])
        return userController.updateUserStatus(req, res, id, body)
      })
      break

    // 404 - маршрут не найден
    default:
      res.writeHead(404)
      res.end(JSON.stringify({ error: "Маршрут не найден" }))
  }
}

// запуск сервера
server.listen(SERVER_CONFIG.PORT, () => {
  console.log(
    `Сервер запущен на http://${SERVER_CONFIG.HOST}:${SERVER_CONFIG.PORT}`
  )
})

// обработка ошибок сервера
server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Порт ${SERVER_CONFIG.PORT} уже используется!`)
  } else {
    console.error("Ошибка сервера:", error)
  }
})
