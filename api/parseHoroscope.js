import axios from 'axios';
import { load } from 'cheerio';

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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const { zodiacSign, period } = req.query;

  if (!zodiacSign || !period) {
    return res.status(400).json({ error: 'Missing zodiacSign or period parameter.' });
  }

  const signNumber = zodiacSigns[zodiacSign];
  if (!signNumber) {
    return res.status(400).json({ error: 'Invalid zodiac sign.' });
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
      return res.status(400).json({ error: 'Invalid period parameter.' });
  }

  try {
    const { data } = await axios.get(url);
    const $ = load(data);
    const horoscopeText = $('.main-horoscope').text().trim();

    if (!horoscopeText) {
      return res.status(404).json({ error: 'Horoscope not found.' });
    }

    return res.status(200).json({ horoscope: horoscopeText });
  } catch (error) {
    console.error('Error fetching horoscope:', error);
    return res.status(500).json({ error: 'Failed to fetch horoscope.' });
  }
}
