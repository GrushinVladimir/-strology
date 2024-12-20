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
const app = express();  
const userStates = {}; 


 
app.use(express.json());

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
async function savePaymentToDatabase(userId, chatId, totalAmount, currency) {  
    try {  
        const amount = Number(totalAmount);  
        if (isNaN(amount)) {  
            throw new Error("Invalid amount: must be a number");  
        }  

        // Удаляем предыдущую запись  
        await Payment.deleteMany({ telegramId: userId });  
        
        const paymentRecord = new Payment({  
            telegramId: userId,  
            chatId: chatId,  
            amount: amount,  
            currency: currency,  
            date: new Date()  
        });  

        await paymentRecord.save();  
        console.log('Платеж успешно сохранен в БД');  
    } catch (error) {  
        console.error('Ошибка при сохранении платежа в БД:', error);  
        throw error;  
    }  
}  
// Эндпоинт для обработки обновлений от Telegram  
app.post('/api/telegram-webhook', async (req, res) => {  
    const update = req.body;  

    // Проверяем, произошло ли успешное получение платежа  
    if (update && update.message && update.message.successful_payment) {  
        const successfulPayment = update.message.successful_payment;  
        const chatId = update.message.chat.id;  
        const userId = update.message.from.id;  
    
        console.log('Содержимое успешного платежа:', successfulPayment);  
    
        const totalAmount = successfulPayment.total_amount; // Ожидается, что это число  
        const currency = successfulPayment.currency;  
    
        console.log('Total Amount:', totalAmount);  
        console.log('Currency:', currency);  
    
        await savePaymentToDatabase(userId, chatId, totalAmount, currency);  
        return res.sendStatus(200);  
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

    if (!chatId) {  
        return res.status(400).json({ success: false, message: 'chatId не указан' });  
    }  

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
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!process.env.REACT_APP_CHAT_API_KEY) {
        return res.status(500).json({ message: 'API Key отсутствует.' });
    }

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [{ role: 'user', content: message }],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${process.env.REACT_APP_CHAT_API_KEY}`,
                },
            }
        );

        const botMessage = response.data.choices?.[0]?.message?.content || 'Ошибка: нет ответа.';
        res.json({ message: botMessage });
    } catch (error) {
        console.error('Ошибка при обращении к OpenAI API:', error);
        res.status(500).json({ message: 'Ошибка при получении ответа от API.' });
    }
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
            const userId = update.message.from.id;  // Получаем ID пользователя  

            // Сохраняем информацию о платеже  
            await savePaymentToDatabase(userId, chatId, successfulPayment.total_amount, successfulPayment.currency);  
            return res.sendStatus(200); // Подтверждаем, что сообщение обработано  
        }  

        // Обработка предоплаты  
        if (update && update.pre_checkout_query) {  
            const preCheckoutQuery = update.pre_checkout_query;  
            await bot.answerPreCheckoutQuery(preCheckoutQuery.id, true); // Подтверждаем предоплату  
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
                const responseText = 'Добро пожаловать в наше новое приложение для любителей астрологии!';  

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

app.get('/api/payment/:telegramId', async (req, res) => {  
    const { telegramId } = req.params;  
    console.log(`Получен запрос на получение платежа с ID: ${telegramId}`); // Для отладки

    try {  
        const payment = await Payment.findOne({ telegramId });  
        if (payment) {  
            console.log('Платеж найден:', payment); // Для отладки
            res.json({ paid: true, amount: payment.amount, currency: payment.currency });  
        } else {  
            console.log('Платеж не найден'); // Для отладки
            res.json({ paid: false });  
        }  
    } catch (error) {  
        console.error('Ошибка при получении информации о платеже:', error);  
        res.status(500).json({ success: false, message: 'Ошибка при получении данных' });  
    }  
});

// Запуск сервера  
const PORT = process.env.PORT || 5000;  
app.listen(PORT, () => {  
    console.log(`Сервер запущен на порту ${PORT}`);  
});  