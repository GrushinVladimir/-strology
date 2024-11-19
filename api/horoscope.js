import axios from 'axios';

export default async function handler(req, res) {
  const { sign, period } = req.query; // Получаем параметры запроса
  
  let url = '';
  switch (period) {
    case 'today':
      url = `https://www.horoscope.com/us/horoscopes/general/horoscope-general-daily-today.aspx?sign=${sign}`;
      break;
    case 'tomorrow':
      url = `https://www.horoscope.com/us/horoscopes/general/horoscope-general-daily-tomorrow.aspx?sign=${sign}`;
      break;
    case 'week':
      url = `https://www.horoscope.com/us/horoscopes/general/horoscope-general-weekly.aspx?sign=${sign}`;
      break;
    case 'month':
      url = `https://www.horoscope.com/us/horoscopes/general/horoscope-general-monthly.aspx?sign=${sign}`;
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
    return res.status(500).json({ error: 'Unable to fetch horoscope' });
  }
}