import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters.command import Command
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
    kb = [
        [types.KeyboardButton(text = "Открыть Трекер", web_app = types.WebAppInfo(url = "https://github.com"))]
    ]
    keyboard = types.ReplyKeyboardMarkup(keyboard = kb, resize_keyboard = True)

    await message.answer("Привет! Нажми кнопку ниже, чтобы запустить трекер =)", reply_markup = keyboard)

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())