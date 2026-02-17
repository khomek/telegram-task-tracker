Task Tracker Telegram Bot

Task Tracker — это веб-приложение для управления задачами с интеграцией в Telegram бота. 
Проект позволяет создавать, отслеживать и управлять задачами по технологии Kanban через веб-интерфейс или прямо из Telegram .

# О проекте

**Реализованные функции**
- Создание задач и управление ими
- Возможность изменения статуса задачи
- Управление задачами через Telegram бота
- Доступ через публичный URL (Serveo туннель)
- Синхронизация между веб-интерфейсом и ботом

**Стек, использованный в процессе разработки проекта:**
- *Backend:* FastAPI (Python 3.11)
- *Frontend:* React + Vite
- *Database:* PostgreSQL 15
- *Bot:* Aiogram 3.x
- *Container:* Docker + Docker Compose
- *Tunnel:* Serveo.net

## Запуск приложения

### Предварительные требования

- Docker и Docker Compose
- Python 3.11+ (для локальной разработки)
- Node.js 18+ (для локальной разработки)
- Telegram Bot Token (получить у @BotFather)

### Установка и запуск

1. **Клонируйте репозиторий**

2. **Настройте переменные окружения в backend/.env. в нем должны быть:**
```Python   
BOT_TOKEN=your_bot_token_here
WEBAPP_URL=https://your-app-url.com
 Публичный URL, который будет отправлять бот пользователям
# После запуска serveo, обновите этот URL на актуальный
# Пример: WEBAPP_URL=https://cool-tracker-xxxxx.serveo.net

# Настройки подключения к PostgreSQL
DB_HOST=db                    # Имя сервиса в Docker (не меняйте)
DB_PORT=5432                  # Порт PostgreSQL (по умолчанию 5432)
DB_USER=myuser                # Имя пользователя БД
DB_PASS=mypassword             # Пароль пользователя БД
DB_NAME=tasktracker            # Название базы данных
```
3. **Запустите через Docker Compose:**
```bash
docker-compose up -d --build
```

4. **Получите публичный URL:**
```bash
docker-compose logs -f serveo
# Скопируйте URL вида https://xxxxx.serveo.net
```

5. **Обновите URL в .env и пересоберите бота, backend, frontend:**
```bash
# Отредактируйте backend/.env, добавьте WEBAPP_URL
docker-compose stop frontend backend bot
docker-compose rm -f frontend backend bot
docker-compose build --no-cache frontend backend bot
docker-compose up -d frontend backend bot
```

## Компоненты

**Backend (FastAPI)**
--REST API для управления задачами
--Автоматическая документация Swagger: http://localhost:8000/docs
--Порт: 8000

**Frontend (React)**
--Современный интерфейс на React + Vite
--Адаптивный дизайн
--Порт: 80 (в Docker) / 5173 (для разработки)

**Telegram Bot**
--Управление задачами через Telegram
--Интерактивные кнопки и меню

**Serveo Tunnel**
--Автоматический проброс портов в интернет
--Логи доступны через docker-compose logs -f serveo

**API Документация**
После запуска доступна автоматическая документация:
Swagger UI: http://localhost:8000/docs
