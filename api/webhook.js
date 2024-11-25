import { NextApiRequest, NextApiResponse } from 'next';
import TelegramBot from 'node-telegram-bot-api';

// Ваш токен бота
const token = process.env.TELEGRAM_BOT_TOKEN;  

// Создаем экземпляр бота
const bot = new TelegramBot(token);

export default async (req = NextApiRequest, res = NextApiResponse) => {
    if (req.method === 'POST') {
        const { body } = req;

        // Логируем входящие данные
        console.log(body);

        if (body.message) {
            const chatId = body.message.chat.id;
            const text = body.message.text;

            // Обработка команды /start
            if (text === '/start') {
                const responseMessage = 'Привет! Я бот. Чем могу помочь?';

                // Отправка сообщения пользователю
                await bot.sendMessage(chatId, responseMessage);
            }
        }

        res.status(200).send('OK'); // Возвращаем статус 200 OK
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`); // Обрабатываем другие методы
    }
};