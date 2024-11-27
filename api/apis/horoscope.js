const axios = require('axios');  
const { load } = require('cheerio');  

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

async function handler(req, res) {  
  const { zodiacSign, period } = req.query;  
  const signNumber = zodiacSigns[zodiacSign];  

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
    const { data } = await axios.get(url, {  
      headers: {  
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'  
      }  
    });  

    // Логируем полученные данные, чтобы можно было увидеть полный ответ
    console.log('Received HTML:', data);  
    
    const $ = load(data);  

    const horoscopeText = $('div.main-horoscope p').not('.show-small, .hide-small').first().text().trim();

    // Для проверки, что действительно извлекаем текст 
    console.log('Extracted Horoscope Text:', horoscopeText);

    if (!horoscopeText) {  
      return res.status(404).json({ error: 'Horoscope not found' });  
    }  

    return res.status(200).json({ horoscope: horoscopeText });  
  } catch (error) {  
    console.error('Error fetching horoscope:', error.message);  
    return res.status(500).json({ error: 'Failed to fetch horoscope' });  
  }  
}  

// Экспорт функции обработчика  
module.exports = handler;  