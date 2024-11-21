// api/horoscope.js  
const axios = require('axios');  
const { load } = require('cheerio');  
console.log(data); // Выводим HTML страницы в консоль
console.log(response.status); // Проверить статус ответа
console.log(data); // Проверить данные ответа
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
    const $ = load(data);  
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

// Экспорт функции обработчика  
module.exports = handler;  