const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./db');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User'); // Убедитесь, что вы импортируете модель User
const userRoutes = require('./routes/userRoutes');

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

// Подключаем маршруты
app.use('/api/users', userRoutes); // Убедитесь, что это middleware-функция, а не объект

// Слушайте сообщения от Telegram
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    try {
        // Логика обработки пользователя
        let user = await User.findOne({ telegramId: chatId });
        let zodiacSign = null;

        if (!user) {
            if (!zodiacSign) {
                // Запрашиваем знак зодиака у пользователя
                zodiacSign = text; // Здесь вы можете сохранить введённый текст как знак зодиака
                user = new User({
                    telegramId: chatId,
                    name: msg.from.first_name,
                    zodiacSign: zodiacSign,
                });
                await user.save();
                console.log(`Пользователь с ID ${chatId} сохранён.`);
                await bot.sendMessage(chatId, `Для получения астрологических данных и определения вашего знака зодиака пройдите тест.`);
            }
        } else {
            console.log(`Пользователь с ID ${chatId} уже существует.`);
            await bot.sendMessage(chatId, 'Вы уже зарегистрированы. Можете начать использовать бота!');
            await bot.sendMessage(chatId, 'Перейти к приложению:', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Перейти', web_app: { url: webAppUrl } }]
                    ]
                }
            });
            return;
        }

        if (text === '/start') {
            await bot.sendMessage(chatId, 'Приложение Astrology', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Перейти', web_app: { url: webAppUrl } }]
                    ]
                }
            });
        } else {
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