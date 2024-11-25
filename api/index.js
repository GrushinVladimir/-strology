require('dotenv').config();  
const cors = require('cors');  
const mongoURI = process.env.MONGO_URI;  
const mongoose = require('mongoose');  
const TelegramBot = require('node-telegram-bot-api');  
const express = require('express');  
const bodyParser = require('body-parser');  
const User = require('./models/User');  
const userRoutes = require('./routes/userRoutes');  
const testResultRoutes = require('./routes/testResultRoutes');  
const horoscopeHandler = require('./apis/horoscope');  
const token = process.env.TELEGRAM_BOT_TOKEN;  

const webAppUrl = 'https://strology.vercel.app';  
const Question = require('./models/Question');  



const app = express();  
let attempts = 0;  
const maxAttempts = 5;  

const connectToDatabase = async () => {  
    if (attempts >= maxAttempts) {  
        console.error('Достигнуто максимальное количество попыток подключения к MongoDB');  
        return;  
    }  
    try {  
        await mongoose.connect(mongoURI, {  
            socketTimeoutMS: 10000,  
            serverSelectionTimeoutMS: 10000,  
            useNewUrlParser: true,  
            useUnifiedTopology: true,  
        });  
        console.log('Успешно подключено к MongoDB');  
        attempts = 0;  
    } catch (error) {  
        attempts++;  
        console.error('Ошибка подключения к MongoDB:', error);  
        setTimeout(connectToDatabase, 5000);  
    }  
};  

connectToDatabase();  
mongoose.connection.on('connected', () => {  
    console.log('Подключено к MongoDB');  
});  

mongoose.connection.on('error', (err) => {  
    console.error('Ошибка подключения к MongoDB:', err);  
});  

mongoose.connection.on('disconnected', () => {  
    console.log('Отключено от MongoDB');  
    connectToDatabase();  
});  

if (!mongoURI) {  
    console.error('Ошибка: MONGO_URI не задана в переменных окружения');  
    process.exit(1);  
}  

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
            res.json({ remainingQuestions: 10 });  
        }  
    } catch (error) {  
        res.status(500).json({ error: 'Не удалось получить количество вопросов' });  
    }  
});  

const bot = new TelegramBot(token, { polling: false });  
const serverUrl = 'https://strology.vercel.app';  
bot.setWebHook(`${serverUrl}/bot${token}`)  
    .then(() => console.log('Webhook установлен.'))  
    .catch(err => console.error('Ошибка при установке вебхука:', err));  

app.get('/api/telegram-token', (req, res) => {  
    res.json({ token: process.env.TELEGRAM_BOT_TOKEN });  
});  

app.get('/api/config', (req, res) => {  
    res.json({ apiKey: process.env.REACT_APP_CHAT_API_KEY });  
});  

app.get('/api/config-google', (req, res) => {  
    res.json({ apiKeys: process.env.GOOGLE_KEY });  
});  
// Эндпоинт для обработки сообщений Telegram  
app.post(`/bot${token}`, async (req, res) => {  
    const msg = req.body;  
    if (msg.message) {  
        const chatId = msg.message.chat.id;  
        const text = msg.message.text;  

        console.log(`Получено сообщение: ${text} от chatId: ${chatId}`);  

        if (text === '/start') {  
            await handleStartCommand(chatId);  
        } else if (text === '/pay') {  
            await handlePayment(chatId);  
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


// Вставьте ваш токен платежей от BotFather  
const TOKEN = process.env.SB_KEY;  

const title = 'Платеж за услуги';  
const description = 'Оплата за доступ к услугам';  
const invoicePayload = 'payment';  
const currency = 'RUB'; // Валюта  
const price = 10000; // Сумма в копейках (100 руб.)  

// Обработка платежа  
async function handlePayment(chatId) {  
    try {  
        await bot.sendInvoice(  
            chatId,  
            title,  
            description,  
            invoicePayload,  
            TOKEN,  
            currency,  
            [{ label: 'Услуга', amount: price }],  
            { start_parameter: 'payment', invoice_payload: invoicePayload }  
        );  

        console.log('Инвойс отправлен в чат:', chatId);  
    } catch (error) {  
        console.error('Ошибка при отправке инвойса:', error);  
        throw error;  
    }  
}  

// Эндпоинт для получения запроса на оплату  
app.post('/api/payment', async (req, res) => {  
    const { chatId } = req.body;  

    try {  
        await handlePayment(chatId);  
        res.json({ success: true, message: 'Инвойс успешно отправлен' });  
    } catch (error) {  
        console.error('Ошибка при отправке инвойса:', error);  
        res.status(500).json({ success: false, message: 'Ошибка при отправке инвойса', error: error.message });  
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