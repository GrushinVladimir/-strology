require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes');

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = 'https://strology.vercel.app';
const mongoURI = process.env.MONGO_URI;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/users', userRoutes);

// Подключение к MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Успешно подключено к MongoDB'))
    .catch(err => console.error('Ошибка подключения к MongoDB:', err));

const bot = new TelegramBot(token);
const serverUrl = 'https://strology.vercel.app';
bot.setWebHook(`${serverUrl}/bot${token}`).then(() => {
    console.log('Webhook установлен.');
}).catch(err => {
    console.error('Ошибка при установке вебхука:', err);
});

// Маршрут для обработки сообщений Telegram
app.post(`/bot${token}`, async (req, res) => {
    const msg = req.body;
    const chatId = msg.message.chat.id;

    if (msg.message.text === '/start') {
        handleStartCommand(chatId);
    } else {
        handleOtherMessages(chatId, msg.message);
    }
    res.sendStatus(200);
});

async function handleStartCommand(chatId) {
    try {
        const existingUser = await User.findOne({ telegramId: chatId });
        if (existingUser) {
            await bot.sendMessage(chatId, 'Добро пожаловать обратно! Переход на главную страницу приложения.', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Перейти на главную', web_app: { url: `${webAppUrl}/main` } }]
                    ]
                }
            });
        } else {
            await bot.sendMessage(chatId, 'Добро пожаловать! Для регистрации пройдите тест:');
            userStates[chatId] = { stage: 'zodiacSign' };
        }
    } catch (error) {
        console.error('Ошибка при обработке команды /start:', error);
        bot.sendMessage(chatId, 'Произошла ошибка, попробуйте позже.');
    }
}

const userStates = {};

async function handleOtherMessages(chatId, msg) {
    const text = msg.text;
    if (!text) return;

    if (userStates[chatId] && userStates[chatId].stage === 'zodiacSign') {
        userStates[chatId].zodiacSign = text;
        userStates[chatId].stage = 'completed';

        await bot.sendMessage(chatId, `Вы выбрали знак зодиака: ${text}. Регистрация завершена.`);
        
        const user = new User({
            telegramId: chatId,
            name: msg.from.first_name,
            zodiacSign: text,
        });
        await user.save();

        delete userStates[chatId];
    } else {
        await bot.sendMessage(chatId, 'Укажите ваш знак зодиака для регистрации.');
    }
}

// Эндпоинт для проверки пользователя по Telegram ID
app.get('/check-user/:telegramId', async (req, res) => {
    try {
        const { telegramId } = req.params;
        const user = await User.findOne({ telegramId });
        if (user) {
            res.json({ exists: true, user });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Ошибка при проверке пользователя:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Эндпоинт для получения данных пользователя по Telegram ID
app.get('/api/users/:telegramId', async (req, res) => {
    try {
        const { telegramId } = req.params;
        const user = await User.findOne({ telegramId });
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json(user);
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
