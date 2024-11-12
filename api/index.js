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
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true,serverSelectionTimeoutMS: 90000 })  
    .then(() => console.log('Успешно подключено к MongoDB'))  
    .catch(err => console.error('Ошибка подключения к MongoDB:', err));   

// Настройка Express  
const app = express();  
app.use(cors());  
app.use(bodyParser.json());  

// Подключение маршрутов  
app.use('/api/users', userRoutes); // Эндпоинт для сохранения пользователей  

// Слушаем сообщения от Telegram
bot.start(async (ctx) => {
    const chatId = ctx.chat.id;

    try {
        let user = await User.findOne({ telegramId: chatId });

        if (user) {
            await bot.telegram.sendMessage(chatId, 'Добро пожаловать обратно! Переход на главную страницу приложения.', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Перейти на главную', web_app: { url: `${webAppUrl}/main` } }]
                    ]
                }
            });
        } else {
            ctx.session = { stage: 'zodiacSign' }; // Используем сессии для хранения состояния пользователя
            await bot.telegram.sendMessage(chatId, 'Добро пожаловать! Для регистрации пройдите тест:');
        }
    } catch (error) {
        console.error('Ошибка при обработке команды /start:', error);
        bot.telegram.sendMessage(chatId, 'Произошла ошибка, попробуйте позже.');
    }
});

// Логика для обработки остальных сообщений (регистрация)
bot.on('text', async (ctx) => {
    const chatId = ctx.chat.id;
    const text = ctx.message.text;

    // Пропускаем обработку, если это команда /start
    if (text === '/start') return;

    try {
        let user = await User.findOne({ telegramId: chatId });

        if (!user && ctx.session) {
            switch (ctx.session.stage) {
                case 'zodiacSign':
                    ctx.session.zodiacSign = text;
                    ctx.session.stage = 'birthDate';
                    await bot.telegram.sendMessage(chatId, 'Введите вашу дату рождения (например, 01.01.2000):');
                    break;
                case 'birthDate':
                    ctx.session.birthDate = text;
                    ctx.session.stage = 'birthTime';
                    await bot.telegram.sendMessage(chatId, 'Введите время рождения (например, 14:30):');
                    break;
                case 'birthTime':
                    ctx.session.birthTime = text;
                    ctx.session.stage = 'birthPlace';
                    await bot.telegram.sendMessage(chatId, 'Введите место рождения:');
                    break;
                case 'birthPlace':
                    ctx.session.birthPlace = text;

                    // Сохранение данных пользователя в базе данных
                    user = new User({
                        telegramId: chatId,
                        name: ctx.from.first_name,
                        zodiacSign: ctx.session.zodiacSign,
                        birthDate: ctx.session.birthDate,
                        birthTime: ctx.session.birthTime,
                        birthPlace: ctx.session.birthPlace
                    });
                    await user.save();
                    delete ctx.session; // Очистка сессии
                    await bot.telegram.sendMessage(chatId, `Спасибо, ${ctx.from.first_name}! Ваши данные сохранены.`);
                    break;
            }
        } else if (user) {
            await bot.telegram.sendMessage(chatId, 'Вы уже зарегистрированы. Переходите на главную страницу приложения.');
        }
    } catch (error) {
        console.error('Ошибка при обработке сообщения:', error);
        bot.telegram.sendMessage(chatId, 'Произошла ошибка, попробуйте позже.');
    }
});

// Vercel требует, чтобы каждое API было экспортировано как функция
export default function handler(req, res) {
    if (req.method === 'POST') {
        bot.handleUpdate(req.body); // Обработка обновлений от Telegram
        res.status(200).send('OK');
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

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
          // Возвращаем данные пользователя, включая знак зодиака  
          res.json({  
            name: user.name,  
            zodiacSign: user.zodiacSign,  // Включаем знак зодиака  
            birthDate: user.birthDate,  
            birthTime: user.birthTime,  
            birthPlace: user.birthPlace,  
        });  
    } catch (error) {  
        console.error('Ошибка при получении пользователя:', error);  
        res.status(500).json({ message: 'Ошибка сервера' });  
    }  
});  

// Запуск сервера  
const PORT = process.env.PORT || 5000;  
app.listen(PORT, () => {  
    const serverUrl = process.env.VERCEL_URL || `http://localhost:${PORT}`;  
    console.log(`Сервер запущен на ${serverUrl}`);  
});  