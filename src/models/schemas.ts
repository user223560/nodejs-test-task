import { z } from "zod"

export const createUserSchema = z.object({
  firstName: z
    .string()
    .min(1, "Имя обязательно")
    .max(50, "Имя слишком длинное"),
  lastName: z
    .string()
    .min(1, "Фамилия обязательна")
    .max(50, "Фамилия слишком длинная"),
  middleName: z.string().max(50, "Отчество слишком длинное").optional(),
  birthDate: z.string().refine(
    (val) => {
      const date = new Date(val)
      return !isNaN(date.getTime()) && date < new Date()
    },
    {
      message: "Некорректная дата рождения (должна быть в прошлом)"
    }
  ),
  email: z
    .string()
    .email("Некорректный email")
    .max(100, "Email слишком длинный"),
  password: z
    .string()
    .min(6, "Пароль должен быть не менее 6 символов")
    .max(100, "Пароль слишком длинный")
})

export const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Пароль обязателен")
})

export const userIdSchema = z.object({
  id: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: "ID должен быть положительным числом"
  })
})

export const updateStatusSchema = z.object({
  isActive: z.boolean()
})
