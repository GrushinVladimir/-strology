const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./db');
const User = require('./models/User');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();
const token = process.env.TELEGRAM_BOT_TOKEN || '7431411001:AAHx9_TODfc7VOlRfcXeab9bbiHeYgl-iNs';
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

    try {
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
    } catch (error) {
        console.error('Ошибка при сохранении пользователя:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Слушайте сообщения от Telegram
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    try {
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
            // Можно отправить сообщение о том, что пользователь уже зарегистрирован
            await bot.sendMessage(chatId, 'Вы уже зарегистрированы. Можете начать использовать бота!');
            // Можно сразу перейти на веб-приложение, если хотите
            await bot.sendMessage(chatId, 'Перейти к приложению:', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Перейти', web_app: { url: webAppUrl } }]
                    ]
                }
            });
            return; // Прерываем выполнение, если пользователь уже зарегистрирован
        }

        if (text === '/start') {
            await bot.sendMessage(chatId, 'Приложение Аstrology', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Перейти', web_app: { url: webAppUrl } }]
                    ]
                }
            });
        
            // Отправка данных пользователя на фронтенд
            const response = await fetch('http://localhost:5000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegramId: chatId,
                    name: msg.from.first_name,
                }),
            });
        
            if (response.ok) {
                console.log('Данные пользователя успешно отправлены на фронтенд');
            } else {
                console.error('Ошибка при отправке данных на фронтенд');
            }
        } else {
            // Отправьте сообщение обратно
            bot.sendMessage(chatId, 'Привет! Как я могу помочь?');
        }
    } catch (error) {
        console.error('Ошибка при обработке сообщения:', error);
        bot.sendMessage(chatId, 'Произошла ошибка, попробуйте позже.');
    }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
app.get('/api/users/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Логика для поиска пользователя в базе данных
        const user = await User.findOne({ telegramId: userId });
        
        if (user) {
            res.json(user); // Отправляем данные пользователя
        } else {
            res.status(404).send('Пользователь не найден'); // Если пользователь не найден
        }
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
        res.status(500).send('Ошибка сервера'); // Если произошла ошибка на сервере
    }
});
