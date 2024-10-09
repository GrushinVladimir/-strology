const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./db');
const User = require('./models/User');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();
const token = '7431411001:AAHx9_TODfc7VOlRfcXeab9bbiHeYgl-iNs';
const webAppUrl = 'https://dynamic-hotteok-3b3216.netlify.app/';

// Подключаемся к MongoDB
connectDB();

// Создайте объект бота
const bot = new TelegramBot(token, { polling: true });

// Настройка Express
const app = express();
app.use(cors()); // Разрешаем кросс-доменные запросы
app.use(bodyParser.json()); // Для парсинга JSON

// Маршрут для сохранения пользователя
app.post('/api/users', async (req, res) => {
    const { telegramId, name } = req.body;

    // Проверка, существует ли пользователь
    let user = await User.findOne({ telegramId });

    if (!user) {
        user = new User({ telegramId, name });
        await user.save();
        console.log(`Пользователь с ID ${telegramId} сохранён.`);
        return res.status(201).json(user);
    } else {
        console.log(`Пользователь с ID ${telegramId} уже существует.`);
        return res.status(200).json(user);
    }
});

// Слушайте сообщения
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Поиск пользователя в базе данных по telegramId
    let user = await User.findOne({ telegramId: chatId });
    console.log(`Проверка пользователя с ID ${chatId}: ${user ? 'найден' : 'не найден'}`);

    if (!user) {
        // Если пользователя нет в базе данных, создаём новый профиль
        user = new User({
            telegramId: chatId,
            name: msg.from.first_name,
        });
        await user.save();
        console.log(`Пользователь с ID ${chatId} сохранён.`);
    } else {
        console.log(`Пользователь с ID ${chatId} уже существует.`);
    }

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Приложение Аstrology', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Перейти', web_app: { url: webAppUrl } }]
                ]
            }
        });

        // Отправка данных пользователя на ваш фронтенд
        await fetch('http://localhost:5000/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                telegramId: chatId,
                name: msg.from.first_name,
            }),
        });
    } else {
        // Отправьте сообщение обратно
        bot.sendMessage(chatId, 'Привет! Как я могу помочь?');
    }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
