import axios from 'axios';
import cheerio from 'cheerio';
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes');

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = 'https://strology.vercel.app';
const mongoURI = process.env.MONGO_URI;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/users', userRoutes);

// Подключение к MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Успешно подключено к MongoDB'))
    .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Инициализация бота
const bot = new TelegramBot(token, { polling: false });
const serverUrl = 'https://strology.vercel.app';
bot.setWebHook(`${serverUrl}/bot${token}`)
    .then(() => console.log('Webhook установлен.'))
    .catch(err => console.error('Ошибка при установке вебхука:', err));

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
        let user = await User.findOne({ telegramId });

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Получаем фото профиля пользователя
        const profilePhotos = await bot.getUserProfilePhotos(telegramId);

        if (profilePhotos && profilePhotos.photos.length > 0) {
            const photoFileId = profilePhotos.photos[0][0].file_id;
            const photoUrl = await bot.getFileLink(photoFileId);
            user.photoUrl = photoUrl; // Сохраняем ссылку на фото в объекте пользователя
            
            // Обновляем информацию о пользователе в БД
            await User.updateOne({ telegramId }, { photoUrl });
        }

        res.json(user);
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});
const zodiacSigns = {
    Водолей: 11,
    Рыбы: 12,
    Овен: 1,
    Телец: 2,
    Близнецы: 3,
    Рак: 4,
    Лев: 5,
    Дева: 6,
    Весы: 7,
    Скорпион: 8,
    Стрелец: 9,
    Козерог: 10,
  };
  
  export default async function handler(req, res) {
    const { sign, period } = req.query;
  
    console.log('Received request with sign:', sign, 'and period:', period); // Логируем параметры
  
    if (!sign || !period) {
      return res.status(400).json({ error: 'Missing sign or period' });
    }
  
    const signNumber = zodiacSigns[sign.toLowerCase()];
  
    if (!signNumber) {
      return res.status(400).json({ error: 'Invalid zodiac sign' });
    }
  
    let url = '';
    switch (period) {
      case 'today':
        url = `https://www.horoscope.com/us/horoscopes/general/horoscope-general-daily-today.aspx?sign=${signNumber}`;
        break;
      case 'tomorrow':
        url = `https://www.horoscope.com/us/horoscopes/general/horoscope-general-daily-tomorrow.aspx?sign=${signNumber}`;
        break;
      case 'week':
        url = `https://www.horoscope.com/us/horoscopes/general/horoscope-general-weekly.aspx?sign=${signNumber}`;
        break;
      case 'month':
        url = `https://www.horoscope.com/us/horoscopes/general/horoscope-general-monthly.aspx?sign=${signNumber}`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid period' });
    }
  
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      const horoscopeText = $('div.horoscope__content p').text().trim();
  
      if (!horoscopeText) {
        return res.status(404).json({ error: 'Horoscope not found' });
      }
  
      return res.status(200).json({ horoscope: horoscopeText });
    } catch (error) {
      console.error('Error fetching horoscope:', error);
      return res.status(500).json({ error: 'Failed to fetch horoscope' });
    }
  }
// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
