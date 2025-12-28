## Описание задания

Нужно разработать сервис работы с пользователями. Модель пользователя должна содержать:
• ФИО
• Дату рождения
• Email - уникальное значение
• Пароль
• Роль - либо admin либо user
• Статус пользователя - активный или нет

Должны быть реализованы следующие <b>endpoint</b>:

<ol>
  <li>Регистрация пользователя</li>
  <li>Авторизация пользователя - любой механизм</li>
  <li>Получение пользователя по ID (Может получить либо админ либо пользователь сам себя)</li>
  <li>Получение списка пользователей - только для админа</li>
  <li>Блокировка пользователя - либо админ либо пользователь сам себя</li>
</ol>

Важно обратить внимание на организацию структуры проекта, применять лучшие практики.
Что использовать запрещено:

- NestJS
  Что использовать можно:
- Express или koa
- Любую СУБД
- Любую ORM/ODM
- Желательно работу выполнить на Typescript, но JS так же допускается

## Детали выполнения задания

<ul>
  <li>Данный проект базируется на архитектуре «Контроллер-Сервис-Репозиторий»</li>
  <li>Node.js (>=18) без фреймворков</li>
  <li>СУБД - SQLite</li>
  <li>В качестве ORM импользуется Prisma</li>
  <li>Для авторизации JSON Web Tokens</li>
  <li>Хеширование паролей - bcrypt</li>
  <li>Валидация - Zod</li>
</ul>

<p><b>API Endpoints:</b></p>
<p><b>Аутентификация</b></p>
<ul>
  <li><code>POST /api/register</code> - регистрация</li>
  <li><code>POST /api/login</code> - вход</li>
</ul>
<p><b>Пользователи</b></p>
<ul>
  <li><code>GET /api/users</code> - все пользователи (только admin)</li>
  <li><code>GET /api/users/:id</code> - получить пользователя</li>
  <li><code>PUT /api/users/:id</code> - блокировка/разблокировка</li>
</ul>

<p>Функционал согласно ТЗ протестирован через <b>Postman</b>:</p>
<p>1. После создания админа и запуска сервера (описание ниже), вход для админа - <code>POST {{baseUrl}}/api/login</code>, далее <code>Content-Type: application/json</code></p>
<code>
{
  "email": "admin@test.com",
  "password": "admin123"
}
</code>
<p>2. Регистрация пользователя - <code>POST {{baseUrl}}/api/register</code>, далее <code>Content-Type: application/json</code></p>
<code>
{
  "firstName": "Джун",
  "lastName": "Джунский",
  "birthDate": "1990-01-01",
  "email": "jun@test.com",
  "password": "jun123"
}
</code>
<p>3. Вход пользователя - <code>POST {{baseUrl}}/api/login</code>, далее <code>Content-Type: application/json</code></p>
<code>
{
  "email": "jun@test.com",
  "password": "jun123"
}
</code>
<p>4. Получение всех пользователей (только для админа) - <code>GET {{baseUrl}}/api/users</code>, далее <code>Authorization: Bearer {{adminToken}}</code></p>
<p>5. Получение своего профиля админом - <code>GET {{baseUrl}}/api/users/1</code>, далее <code>Authorization: Bearer {{adminToken}}</code></p>
<p>6. Получение своего профиля пользователем - <code>GET {{baseUrl}}/api/users/2</code>, далее <code>Authorization: Bearer {{userToken}}</code></p>
<p>7. Админ блокирует пользователя - <code>PUT {{baseUrl}}/api/users/2</code>, далее <code>Authorization: Bearer {{{{adminToken}}}}</code>, далее <code>Content-Type: application/json</code></p>
<code>
{
  "isActive": false
}
</code>

### Клонировать

```bash
git clone <repo-url>
cd nodejs-test-task
```

### Создать .env файл из .env.example

### Запустить

```bash
npm ci                              # установка зависимостей
npx prisma migrate dev --name init  # инициализация БД
npx ts-node scripts/createAdmin.ts  # создание админа
npm run dev                         # запуск сервера
```
