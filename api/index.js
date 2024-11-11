const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./db');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes');



// Загрузка конфигурации
dotenv.config();
const token = process.env.TELEGRAM_BOT_TOKEN || '7431411001:AAHx9_TODfc7VOlRfcXeab9bbiHeYgl-iNs';
const webAppUrl = 'https://strology.vercel.app/';


// Подключение к MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/Astro';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB подключен"))
  .catch(err => console.error("Ошибка подключения к MongoDB:", err));

// Настройка Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Подключение маршрутов
app.use('/api/users', userRoutes); // Эндпоинт для сохранения пользователей

// Слушаем сообщения от Telegram
const bot = new TelegramBot(token, { polling: true });

// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        // Проверка, существует ли пользователь
        let user = await User.findOne({ telegramId: chatId });

        if (user) {
            // Если пользователь существует, перенаправляем на страницу main
            await bot.sendMessage(chatId, 'Добро пожаловать обратно! Переход на главную страницу приложения.', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Перейти на главную', web_app: { url: `${webAppUrl}/main` } }]
                    ]
                }
            });
        } else {
            // Если пользователь не зарегистрирован, начинаем процесс регистрации
            userStates[chatId] = { stage: 'zodiacSign' };
            await bot.sendMessage(chatId, 'Добро пожаловать! Для регистрации пройдите тест:');
        }
    } catch (error) {
        console.error('Ошибка при обработке команды /start:', error);
        bot.sendMessage(chatId, 'Произошла ошибка, попробуйте позже.');
    }
});

// Логика для обработки остальных сообщений (регистрация)
const userStates = {}; // Хранение состояния пользователя
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
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
                        name: msg.from.first_name,
                        zodiacSign: userStates[chatId].zodiacSign,
                        birthDate: userStates[chatId].birthDate,
                        birthTime: userStates[chatId].birthTime,
                        birthPlace: userStates[chatId].birthPlace
                    });
                    await user.save();
                    delete userStates[chatId];
                    await bot.sendMessage(chatId, `Спасибо, ${msg.from.first_name}! Ваши данные сохранены.`);
                    break;
            }
        } else if (user) {
            await bot.sendMessage(chatId, 'Вы уже зарегистрированы. Переходите на главную страницу приложения.');
        }
    } catch (error) {
        console.error('Ошибка при обработке сообщения:', error);
        bot.sendMessage(chatId, 'Произошла ошибка, попробуйте позже.');
    }
});

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

app.get('/api/users/:telegramId', async (req, res) => {
    const { telegramId } = req.params;
  
    try {
      const user = await User.findOne({ telegramId }); // Здесь предполагается, что вы ищете пользователя по telegramId в базе данных
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
    console.log(`Server is running on http://localhost:${PORT}`);
});