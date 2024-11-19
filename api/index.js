require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/users', userRoutes);

// Подключение к MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Успешно подключено к MongoDB'))
    .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Настройки Telegram бота
const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = 'https://strology.vercel.app';
const bot = new TelegramBot(token, { polling: false });
const serverUrl = webAppUrl; // Используем переменную webAppUrl для унификации
bot.setWebHook(`${serverUrl}/bot${token}`)
    .then(() => console.log('Webhook установлен.'))
    .catch(err => console.error('Ошибка при установке вебхука:', err));

// Хранение состояний пользователей
const userStates = {};

// Маршрут для обработки сообщений Telegram
app.post(`/bot${token}`, async (req, res) => {
    const msg = req.body;
    if (msg.message) {
        const chatId = msg.message.chat.id;
        const text = msg.message.text;

        console.log(`Получено сообщение: ${text} от chatId: ${chatId}`);

        if (text === '/start') {
            await handleStartCommand(chatId);
        } else {
            await handleOtherMessages(chatId, msg.message);
        }
    }
    res.sendStatus(200);
});

// Обработка команды /start
async function handleStartCommand(chatId) {
    try {
        const existingUser = await User.findOne({ telegramId: chatId });

        if (existingUser) {
            console.log(`Пользователь найден, перенаправляем на main: ${chatId}`);
            await bot.sendMessage(chatId, 'Добро пожаловать обратно! Переход на главную страницу приложения.', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Перейти на главную', web_app: { url: `${webAppUrl}/main` } }]
                    ]
                }
            });
        } else {
            console.log(`Новый пользователь, отправляем на регистрацию: ${chatId}`);
            await bot.sendMessage(chatId, 'Добро пожаловать! Для регистрации пройдите тест: Укажите ваш знак зодиака.');
            userStates[chatId] = { stage: 'zodiacSign' };
        }
    } catch (error) {
        console.error('Ошибка при обработке команды /start:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка, попробуйте позже.');
    }
}

// Обработка других сообщений
async function handleOtherMessages(chatId, msg) {
    const text = msg.text;
    if (!text) return;

    if (userStates[chatId]?.stage === 'zodiacSign') {
        userStates[chatId].zodiacSign = text;
        userStates[chatId].stage = 'completed';

        console.log(`Знак зодиака ${text} сохранён для chatId: ${chatId}`);
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

// Эндпоинт для обработки запросов к OpenAI
app.post('/api/chat-completion', async (req, res) => {
    const { message } = req.body;

    // Здесь вы можете добавить вызов к OpenAI API
    try {
        // Пример вызова OpenAI API (замените на свой код)
        const aiResponse = await getOpenAIResponse(message);
        
        res.json({ response: aiResponse });
    } catch (error) {
        console.error('Ошибка при получении ответа от OpenAI:', error);
        res.status(500).json({ message: 'Ошибка при обработке запроса' });
    }
});

// Функция для получения ответа от OpenAI
async function getOpenAIResponse(userMessage) {
    // Здесь должен быть ваш код обращения к OpenAI API
    // Пример с использованием fetch или axios
    return "Это пример ответа от AI"; // Замените на реальный ответ от OpenAI
}

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});