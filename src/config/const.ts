// конфигурация приложения
export const JWT_EXPIRES_IN = "24h"
export const BCRYPT_SALT_ROUNDS = 10

// настройки сервера
export const SERVER_CONFIG = {
  PORT: process.env.PORT || 5000,
  HOST: "localhost"
}

// роли пользователей
export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER"
} as const
