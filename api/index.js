require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI);
const TelegramBot = require('node-telegram-bot-api');

const dotenv = require('dotenv');
const connectDB = require('./db');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes');

const mongoose = require('mongoose');

// Загрузка конфигурации

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = 'https://strology.vercel.app/';

// Подключение к MongoDB  
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('Ошибка: переменная окружения MONGO_URI не определена.');
    process.exit(1);
}
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 90000 })
    .then(() => console.log('Успешно подключено к MongoDB'))
    .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Настройка Express  
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Подключение маршрутов  
app.use('/api/users', userRoutes); // Эндпоинт для сохранения пользователей  

// Настройка вебхука для бота
const bot = new TelegramBot(token);
const webhookUrl = `${process.env.VERCEL_URL}/webhook`; // Убедитесь, что у вас есть переменная окружения VERCEL_URL

bot.setWebHook(webhookUrl);

// Обработка входящих обновлений (вебхук)
app.post('/webhook', (req, res) => {
    const update = req.body;

    // Обработка команды /start
    if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const text = update.message.text;

        handleCommand(chatId, text, update.message.from);
    }

    res.sendStatus(200);
});

// Логика обработки команды /start и других сообщений
const userStates = {}; // Хранение состояния пользователя

async function handleCommand(chatId, text, from) {
    try {
        let user = await User.findOne({ telegramId: chatId });

        if (text === '/start') {
            if (user) {
                await bot.sendMessage(chatId, 'Добро пожаловать обратно! Переход на главную страницу приложения.', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Перейти на главную', web_app: { url: `${webAppUrl}/main` } }]
                        ]
                    }
                });
            } else {
                userStates[chatId] = { stage: 'zodiacSign' };
                await bot.sendMessage(chatId, 'Добро пожаловать! Для регистрации пройдите тест:');
            }
        } else {
            // Обработка этапов регистрации
            if (!user && userStates[chatId]) {
                switch (userStates[chatId].stage) {
                    case 'zodiacSign':
                        userStates[chatId].zodiacSign = text;
                        userStates[chatId].stage = 'birthDate';
                        await bot.sendMessage(chatId, 'Введите вашу дату рождения (например, 01.01.2000):');
                        break;
                    case 'birthDate':
                        userStates[chatId].birthDate = text;
                        userStates[chatId].stage = 'birthTime';
                        await bot.sendMessage(chatId, 'Введите время рождения (например, 14:30):');
                        break;
                    case 'birthTime':
                        userStates[chatId].birthTime = text;
                        userStates[chatId].stage = 'birthPlace';
                        await bot.sendMessage(chatId, 'Введите место рождения:');
                        break;
                    case 'birthPlace':
                        userStates[chatId].birthPlace = text;

                        // Сохранение данных пользователя в базе данных
                        user = new User({
                            telegramId: chatId,
                            name: from.first_name,
                            zodiacSign: userStates[chatId].zodiacSign,
                            birthDate: userStates[chatId].birthDate,
                            birthTime: userStates[chatId].birthTime,
                            birthPlace: userStates[chatId].birthPlace
                        });
                        await user.save();
                        delete userStates[chatId]; // Удаляем состояние пользователя
                        await bot.sendMessage(chatId, 'Вы успешно зарегистрированы! Добро пожаловать!');
                        break;
                }
            } else {
                await bot.sendMessage(chatId, 'Я не понимаю вас. Пожалуйста, используйте команду /start для начала.');
            }
        }
    } catch (error) {
        console.error('Ошибка обработки команды:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте еще раз позже.');
    }
}

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});