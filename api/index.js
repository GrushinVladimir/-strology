require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI);
const TelegramBot = require('node-telegram-bot-api');
const connectDB = require('./db'); // Убедитесь, что эта функция корректно подключает к БД
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes');
const mongoose = require('mongoose');

// Загрузка конфигурации
const token = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_DEFAULT_TOKEN';  // Замените на свой токен
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
    console.log('Получено сообщение:', req.body);
    const msg = req.body;

    if (msg.message && msg.message.chat && msg.message.chat.id && msg.message.text) {
        const chatId = msg.message.chat.id;

        // Обработка команды /start
        if (msg.message.text === '/start') {
            handleStartCommand(chatId, msg.message.from);
        } else {
            handleOtherMessages(chatId, msg.message);
        }

        // Отправляем 200 OK статус
        res.sendStatus(200);
    } else {
        console.log('Неправильный формат сообщения:', req.body);
        res.sendStatus(400); // Неверный запрос
    }
});

// Логика обработки команды /start
async function handleStartCommand(chatId, user) {
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

    // Пропускаем обработку, если это команда /start
    if (text === '/start') return;

    try {
        let user = await User.findOne({ telegramId: chatId });

        if (!user && userStates[chatId]) {
            // Обработка этапов регистрации
            switch (userStates[chatId].stage) {
                case 'zodiacSign':
                    userStates[chatId].zodiacSign = text;
                    userStates[chatId].stage = 'birthDate';
                    await bot.sendMessage(chatId, 'Введите вашу дату рождения (например, 01.01.2000):');
                    break;
                case 'birthDate':
                    userStates[chatId].birthDate = text;
                    userStates[chatId].stage = 'confirmation';
                    await bot.sendMessage(chatId, `Вы выбрали знак зодиака: ${userStates[chatId].zodiacSign}. Ваша дата рождения: ${text}. Подтвердите регистрацию? (Да/Нет)`);
                    break;
                case 'confirmation':
                    if (text.toLowerCase() === 'да') {
                        const newUser = new User({
                            telegramId: chatId,
                            zodiacSign: userStates[chatId].zodiacSign,
                            birthDate: userStates[chatId].birthDate
                        });
                        await newUser.save();
                        delete userStates[chatId]; // Удаляем состояние после регистрации
                        await bot.sendMessage(chatId, 'Вы успешно зарегистрированы! Используйте команду /start для доступа к приложениям.');
                    } else if (text.toLowerCase() === 'нет') {
                        delete userStates[chatId]; // Удаляем состояние при отказе
                        await bot.sendMessage(chatId, 'Регистрация отменена. Вы можете начать заново с командой /start.');
                    } else {
                        await bot.sendMessage(chatId, 'Пожалуйста, ответьте "Да" или "Нет".');
                    }
                    break;
                default:
                    await bot.sendMessage(chatId, 'Неизвестный этап. Начните заново с команды /start.');
            }
        } else {
            await bot.sendMessage(chatId, 'Вы уже зарегистрированы. Пожалуйста, используйте команду /start для доступа к приложениям.');
        }
    } catch (error) {
        console.error('Ошибка при обработке сообщения:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка, попробуйте позже.');
    }
}

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});