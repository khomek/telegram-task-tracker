import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters.command import Command
from aiogram.types import MenuButtonWebApp, WebAppInfo 
from config import settings

logging.basicConfig(level=logging.INFO)

import os 
from dotenv import load_dotenv
load_dotenv()
TOKEN = os.getenv("BOT_TOKEN")

bot = Bot(token = TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def cmd_start(message:types.Message):
    await bot.set_chat_menu_button(
        chat_id=message.chat.id,
        menu_button=MenuButtonWebApp(
            text="Мои задачи",
            web_app=WebAppInfo(url=settings.WEBAPP_URL)
        )
    )
    await message.answer("Нажми на кнопку 'Мои задачи' слева от поля ввода, чтобы увидеть трекер")


async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())