const TelegramBot = require('node-telegram-bot-api');
const token = '7431411001:AAHx9_TODfc7VOlRfcXeab9bbiHeYgl-iNs';
const webAppUrl ='https://dynamic-hotteok-3b3216.netlify.app/';
// Создайте объект бота
const bot = new TelegramBot(token, { polling: true });

// Слушайте сообщения
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Приложение Аstrology', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Перейти', web_app: {url: webAppUrl}}]
                ]
            }
        });
    } else {
        // Отправьте сообщение обратно
        bot.sendMessage(chatId, 'Привет! Как я могу помочь?');
    }
});