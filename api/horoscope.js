// api/horoscope.js
import axios from 'axios';
import { load } from 'cheerio';

export default async function handler(req, res) {
  const url = 'https://www.horoscope.com/us/horoscopes/general/horoscope-general-daily-today.aspx?sign=8';  // Ссылка на гороскоп

  try {
    // Запрос к сайту
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Referer': 'https://www.horoscope.com/',
      },
    });

    // Парсинг страницы
    const $ = load(data);
    const horoscopeText = $('.main-horoscope').text().trim();  // Извлечение текста гороскопа

    // Если текст гороскопа найден, отправляем его в ответ
    if (horoscopeText) {
      res.status(200).json({ horoscope: horoscopeText });
    } else {
      res.status(404).json({ error: 'Horoscope not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching horoscope' });
  }
}
