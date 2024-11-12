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
const token = process.env.TELEGRAM_BOT_TOKEN || '7431411001:AAHx9_TODfc7VOlRfcXeab9bbiHeYgl-iNs';
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

// Инициализация бота
const bot = new TelegramBot(token);

// Установка вебхука
const webhookUrl = `${process.env.VERCEL_URL}/webhook`; // URL вашего приложения на Vercel
bot.setWebHook(webhookUrl);

// Обработка сообщений от Telegram
app.post('/webhook', (req, res) => {
    const update = req.body;
    
    if (update.message) {
        handleMessage(update.message);
    }

    res.sendStatus(200); // Отправляем статус 200 OK
});

// Логика обработки сообщений
const handleMessage = async (msg) => {
    const chatId = msg.chat.id;  
    const text = msg.text;

    // Обработка команды /start
    if (text === '/start') {
        try {
            let user = await User.findOne({ telegramId: chatId });

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
        } catch (error) {
            console.error('Ошибка при обработке команды /start:', error);
            bot.sendMessage(chatId, 'Произошла ошибка, попробуйте позже.');
        }
        return;
    }

    // Остальная логика обработки сообщений
    // ...
};

// Проверка существующего пользователя через REST API  
app.get('/check-user/:telegramId', async (req, res) => {  
    const { telegramId } = req.params;  
    try {  
        const user = await User.findOne({ telegramId });  
        if (user) {  
            return res.json({ exists: true, user });  
        }  
        res.json({ exists: false });  
    } catch (error) {  
        console.error('Ошибка при проверке пользователя:', error);  
        res.status(500).send('Ошибка сервера');  
    }  
});  

// Получение данных пользователя  
app.get('/api/users/:telegramId', async (req, res) => {  
    const { telegramId } = req.params;  

    try {  
        const user = await User.findOne({ telegramId }).maxTimeMS(60000);  
        if (!user) {  
            return res.status(404).json({ message: 'Пользователь не найден' });  
        }  
        res.json(user);
    } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Запуск сервера на Vercel
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

// Эндпоинт для проверки работоспособности API
app.get('/', (req, res) => {
    res.send('Telegram bot is running.');
});
