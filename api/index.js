require('dotenv').config();  
const cors = require('cors');  
const mongoURI = process.env.MONGO_URI;  
const mongoose = require('mongoose');  
const TelegramBot = require('node-telegram-bot-api');  
const express = require('express');  
const bodyParser = require('body-parser');  
const User = require('./models/User');  
const userRoutes = require('./routes/userRoutes'); // Убедитесь, что этот файл существует  
const testResultRoutes = require('./routes/testResultRoutes');  
const horoscopeHandler = require('./apis/horoscope');  
const token = process.env.TELEGRAM_BOT_TOKEN;  
const webAppUrl = 'https://strology.vercel.app';  
const Question = require('./models/Question');  

const app = express();  

// Подключение к MongoDB
mongoose.connect(mongoURI, { socketTimeoutMS: 30000,  
    serverSelectionTimeoutMS: 30000,   })
    .then(() => console.log('Успешно подключено к MongoDB'))
    .catch(err => console.error('Ошибка подключения к MongoDB:', err));



    app.use(cors());  
    app.use(bodyParser.json());  
    app.use('/api/users', userRoutes);
    app.use('/api/test-results', testResultRoutes);  
    app.get('/api/horoscope', horoscopeHandler);  


    app.post('/api/questions/:id', async (req, res) => {  
        const { id } = req.params;  
        const { remainingQuestions } = req.body;  
      
        try {  
          const questionData = await Question.findOneAndUpdate(  
            { telegramId: id },  
            { remainingQuestions },  
            { new: true, upsert: true }  
          );  
          res.json(questionData);  
        } catch (error) {  
          res.status(500).json({ error: 'Не удалось сохранить количество вопросов' });  
        }  
      });  
      app.get('/api/questions/:id', async (req, res) => {  
        const { id } = req.params;  
        try {  
          const questionData = await Question.findOne({ telegramId: id });  
          if (questionData) {  
            res.json({ remainingQuestions: questionData.remainingQuestions });  
          } else {  
            res.json({ remainingQuestions: 10 }); // Начальное значение, если ничего нет  
          }  
        } catch (error) {  
          res.status(500).json({ error: 'Не удалось получить количество вопросов' });  
        }  
      });  


// Инициализация бота
const bot = new TelegramBot(token, { polling: false });
const serverUrl = 'https://strology.vercel.app';
bot.setWebHook(`${serverUrl}/bot${token}`)
    .then(() => console.log('Webhook установлен.'))
    .catch(err => console.error('Ошибка при установке вебхука:', err));



// Эндпоинт для получения API_KEY
app.get('/api/config', (req, res) => {
    res.json({ apiKey: process.env.REACT_APP_CHAT_API_KEY });
});
// Эндпоинт для получения API_KEY
app.get('/api/config-google', (req, res) => {
    res.json({ apiKeys: process.env.GOOGLE_KEY });
});
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

// Хранение состояний пользователей
const userStates = {};

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
            console.log(`Новый пользователь, отправляем на тест: ${chatId}`);
            await bot.sendMessage(chatId, 'Добро пожаловать! Для регистрации пройдите тест:');
            userStates[chatId] = { stage: 'zodiacSign' };
        }
    } catch (error) {
        console.error('Ошибка при обработке команды /start:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка, попробуйте позже.');
    }
}

async function handleOtherMessages(chatId, msg) {
    const text = msg.text;
    if (!text) return;

    if (userStates[chatId] && userStates[chatId].stage === 'zodiacSign') {
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


// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});