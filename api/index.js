require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const connectDB = require('./db'); // 
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

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Успешно подключено к MongoDB'))
    .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Настройка Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Подключение маршрутов
app.use('/api/users', userRoutes); // Эндпоинт для сохранения пользователей

// Создаем экземпляр бота
const bot = new TelegramBot(token);

// Устанавливаем вебхук
const PORT = process.env.PORT || 5000;
const serverUrl = process.env.VERCEL_URL || `http://localhost:${PORT}`;
bot.setWebHook(`${serverUrl}/bot${token}`).then(() => {
    console.log('Webhook установлен.');
}).catch(err => {
    console.error('Ошибка при установке вебхука:', err);
});

// Обработка сообщений от Telegram
app.post(`/bot${token}`, (req, res) => {
    console.log('Получено сообщение:', req.body); // Логируем входящие данные
    const msg = req.body;

    if (msg.message && msg.message.chat && msg.message.chat.id) {
        const chatId = msg.message.chat.id;
        
        // Обработчик команд /start
        if (msg.message.text === '/start') {
            handleStartCommand(chatId);
        } else {
            handleOtherMessages(chatId, msg.message);
        }
        
        res.sendStatus(200);
    } else {
        console.log('Неправильный формат сообщения:', req.body);
        res.sendStatus(400);
    }
});

// Логика обработки команды /start
async function handleStartCommand(chatId) {
    try {
        let existingUser = await User.findOne({ telegramId: chatId });
        if (existingUser) {
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
    } catch (error) {
        console.error('Ошибка при обработке команды /start:', error);
        bot.sendMessage(chatId, 'Произошла ошибка, попробуйте позже.');
    }
}

// Логика для обработки остальных сообщений (регистрация)
const userStates = {}; // Хранение состояния пользователя
async function handleOtherMessages(chatId, msg) {
    const text = msg.text;
 // Пропускаем пустые сообщения
 if (!text) {
    return;
}

try {
    if (userStates[chatId] && userStates[chatId].stage === 'zodiacSign') {
        // Здесь вы можете добавить логику для обработки зодиакального знака
        userStates[chatId].zodiacSign = text; // Сохраняем введенный знак
        userStates[chatId].stage = 'otherStage'; // Переход к следующему этапу

        await bot.sendMessage(chatId, `Вы выбрали знак зодиака: ${text}. Теперь продолжайте...`); // Подтверждение выбора
    } else {
        // Обработка других возможных состояний или команд
        await bot.sendMessage(chatId, 'Я не понимаю ваше сообщение. Пожалуйста, укажите свой знак зодиака.');
    }
} catch (error) {
    console.error('Ошибка при обработке сообщений:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка при обработке вашего запроса.');
}
}

// Запуск сервера
app.listen(PORT, () => {
console.log(`Сервер запущен на порту ${PORT}`);
});