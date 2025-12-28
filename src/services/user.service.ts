import { Role, SafeUser } from "../models/user"
import { userRepository } from "../repositories/user.repository"

export class UserService {
  // получение юзера по ID с проверкой прав
  async getUserById(
    userId: number,
    currentUser: { id: number; role: Role }
  ): Promise<SafeUser> {
    // находим юзера
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new Error("Пользователь не найден")
    }

    // админ может видеть любого юзера (даже заблокированного)
    if (currentUser.role === Role.ADMIN) {
      return this.excludePassword(user)
    }
    // юзер только себя
    if (currentUser.id !== userId) {
      throw new Error("Недостаточно прав")
    }
    // проверяем, не заблокирован ли юзер
    if (!user.isActive) {
      throw new Error("Ваш аккаунт заблокирован. Обратитесь к администратору.")
    }
    return this.excludePassword(user)
  }
  // получение списка пользователей
  async getAllUsers(
    currentUser: { role: Role },
    skip = 0,
    take = 100
  ): Promise<SafeUser[]> {
    if (currentUser.role !== Role.ADMIN) {
      throw new Error("Недостаточно прав")
    }
    const users = await userRepository.findAll(skip, take)
    return users.map((user) => this.excludePassword(user))
  }

  async updateUserStatus(
    userId: number,
    isActive: boolean,
    currentUser: { id: number; role: Role }
  ): Promise<SafeUser> {
    // юзер не может заблокировать сам себя
    if (
      currentUser.role !== Role.ADMIN &&
      currentUser.id === userId &&
      !isActive
    ) {
      throw new Error("Нельзя заблокировать самого себя")
    }
    // проверка прав (админ может блокировать любого, пользователь - только себя)
    if (currentUser.role !== Role.ADMIN && currentUser.id !== userId) {
      throw new Error("Недостаточно прав")
    }
    const updatedUser = await userRepository.updateStatus(userId, isActive)
    return this.excludePassword(updatedUser)
  }
  // вспомогательный метод для удаления пароля
  private excludePassword(user: any): SafeUser {
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}

export const userService = new UserService()
