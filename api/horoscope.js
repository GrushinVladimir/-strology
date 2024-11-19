import axios from 'axios';
import cheerio from 'cheerio';

const zodiacSigns = {
  // Добавьте сюда ваши знаки зодиака и их соответствующие номера
};

export default async function handler(req, res) {
  const { sign, period } = req.query;
  const signNumber = zodiacSigns[sign];

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