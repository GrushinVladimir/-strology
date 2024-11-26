require('dotenv').config();  
const cors = require('cors');  
const mongoURI = process.env.MONGO_URI;  
const mongoose = require('mongoose');  
const TelegramBot = require('node-telegram-bot-api');  
const express = require('express');  
const bodyParser = require('body-parser');  
const User = require('./models/User');  
const Payment = require('./models/paymentModel');
const userRoutes = require('./routes/userRoutes');  
const testResultRoutes = require('./routes/testResultRoutes');  
const horoscopeHandler = require('./apis/horoscope');  
const token = process.env.TELEGRAM_BOT_TOKEN;  
const TOKEN = process.env.REACT_APP_SB_KEY;  
const webAppUrl = 'https://strology.vercel.app';  
const Question = require('./models/Question');  
const axios = require('axios');  // Используем axios для отправки запросов

// Хранение состояний пользователей  
const userStates = {};  

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
async function savePaymentToDatabase(chatId, amount, currency) {  
    const payment = new Payment({  
        telegramId,
        chatId,  
        amount,  
        currency,  
        successful: true  
    });  
    await payment.save();  
    console.log('Платеж успешно сохранен в БД:', payment);  
} 
// Эндпоинт для обработки обновлений от Telegram  
app.post('/api/telegram-webhook', async (req, res) => {  
    const update = req.body;  

    // Проверяем, произошло ли успешное получение платежа  
    if (update && update.message && update.message.successful_payment) {  
        const successfulPayment = update.message.successful_payment;  
        const chatId = update.message.chat.id;  

        // Сохраняем информацию о платеже  
        await savePaymentToDatabase(chatId, successfulPayment.total_amount, successfulPayment.currency);  

        return res.sendStatus(200); // Подтверждаем, что сообщение обработано  
    }  

    // Обработка предоплаты  
    if (update && update.pre_checkout_query) {  
        const preCheckoutQuery = update.pre_checkout_query;  

        // Здесь вы можете добавить логику проверки, если нужно  
        // Например, проверка суммы или валюты  

        // Подтверждаем предоплату  
        await bot.answerPreCheckoutQuery(preCheckoutQuery.id, true); // true означает, что мы подтверждаем платеж  
        return res.sendStatus(200);  
    }  

    // Если сообщение не соответствует ни одной из ожидаемых форматов  
    console.error('Некорректный формат сообщения:', update);  
    res.sendStatus(200);  
});  

// Эндпоинт для получения запроса на оплату  
app.post('/api/payment', async (req, res) => {  
    const { chatId } = req.body;  
    console.log('Получен запрос на оплату:', chatId); // Логируем полученный chatId  

    try {  
        await handlePayment(chatId);  
        res.json({ success: true, message: 'Инвойс успешно отправлен' });  
    } catch (error) {  
        console.error('Ошибка при отправке инвойса:', error);  
        res.status(500).json({ success: false, message: 'Ошибка при отправке инвойса', error: error.message });  
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
bot.setWebHook(`${serverUrl}/api/webhook`)
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
app.post('/api/webhook', async (req, res) => {  
    try {  
        const update = req.body;  

        // Проверка на успешный платеж  
        if (update && update.message && update.message.successful_payment) {  
            const successfulPayment = update.message.successful_payment;  
            const chatId = update.message.chat.id;  

            // Сохраняем информацию о платеже  
            await savePaymentToDatabase(chatId, successfulPayment.total_amount, successfulPayment.currency);  
            return res.sendStatus(200); // Подтверждаем, что сообщение обработано  
        }  

        // Обработка предоплаты  
        if (update && update.pre_checkout_query) {  
            const preCheckoutQuery = update.pre_checkout_query;  

            // Подтверждаем предоплату  
            await bot.answerPreCheckoutQuery(preCheckoutQuery.id, true); // true означает, что мы подтверждаем платеж  
            return res.sendStatus(200);  
        }  

        // Проверка наличия сообщения и чата  
        if (update && update.message && update.message.chat) {  
            const chatId = update.message.chat.id;  
            const userId = update.message.from.id; // Получаем ID пользователя  
            const text = update.message.text;  

            console.log(`Получено сообщение: "${text}" от User ID: ${userId}, Chat ID: ${chatId}`);  

            // Логика ответа на команду /start  
            if (text === '/start') {  
                const responseText = 'Добро пожаловать! Как я могу помочь вам?';  

                // Отправляем ответ пользователю  
                await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {  
                    chat_id: chatId,  
                    text: responseText  
                });  
            }  
        } else {  
            console.error('Некорректный формат сообщения:', update);  
        }  

        res.sendStatus(200); // Отправляем статус 200 OK  
    } catch (error) {  
        console.error('Ошибка при обработке webhook:', error);  
        res.status(500).send('Ошибка сервера');  
    }  
}); 



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
        if (error.response) {
            console.error('Ошибка при отправке инвойса:', error.response.body);  
        } else {
            console.error('Неизвестная ошибка:', error);
        }
        throw error; // Перебросить ошибку, чтобы она была видна на уровне API.  
    }  
}

// Эндпоинт для получения запроса на оплату  
app.post('/api/payment', async (req, res) => {  
    const { chatId } = req.body;  
    console.log('Получен запрос на оплату:', chatId); // Логируем полученный chatId

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