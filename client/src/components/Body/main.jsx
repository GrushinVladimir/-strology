import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { load } from 'cheerio';
import { useLocation, Link } from 'react-router-dom';

const translateText = async (text) => {
  const apiKey = 'AIzaSyBjA1Vb3DcbyZGvy9I2drZlEUbOd6ApbVY';
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

  try {
    const response = await axios.post(url, {
      q: text,
      target: 'ru',
    });

    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Ошибка перевода текста:', error);
    return text;
  }
};

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

const zodiacImages = {
  Водолей: 'img/zhak/vodoley.png',
  Рыбы: 'img/zhak/riby.png',
  Овен: 'img/zhak/oven.png',
  Телец: 'img/zhak/telec.png',
  Близнецы: 'img/zhak/bliznecy.png',
  Рак: 'img/zhak/rak.png',
  Лев: 'img/zhak/lev.png',
  Дева: 'img/zhak/deva.png',
  Весы: 'img/zhak/vesy.png',
  Скорпион: 'img/zhak/scorpion.png',
  Стрелец: 'img/zhak/strelec.png',
  Козерог: 'img/zhak/kozerog.png',
};

const getHoroscope = async (zodiacSign, period) => {
  const signNumber = zodiacSigns[zodiacSign];
  let url = '';

  switch (period) {
    case 'today':
      url = `/api/us/horoscopes/general/horoscope-general-daily-today.aspx?sign=${signNumber}`;
      break;
    case 'tomorrow':
      url = `/api/us/horoscopes/general/horoscope-general-daily-tomorrow.aspx?sign=${signNumber}`;
      break;
    case 'week':
      url = `/api/us/horoscopes/general/horoscope-general-weekly.aspx?sign=${signNumber}`;
      break;
    case 'month':
      url = `/api/us/horoscopes/general/horoscope-general-monthly.aspx?sign=${signNumber}`;
      break;
    default:
      return '';
  }

  try {
    const { data } = await axios.get(url);
    const $ = load(data);
    let horoscopeText = $('.main-horoscope p').text();

    switch (period) {
      case 'today':
      case 'tomorrow':
        horoscopeText = horoscopeText.replace(/^\w+ \d{1,2}, \d{4} - \s*/, '');
        break;
      case 'week':
        horoscopeText = horoscopeText.replace(/^\w+ \d{1,2}(, \d{4})? - \w+ \d{1,2}(, \d{4})? -?\s*/, '');
        break;
      case 'month':
        horoscopeText = horoscopeText.replace(/^\w+ \d{4} - On \w+ \d{1,2}/, '');
        horoscopeText = horoscopeText.replace(/^,\s*/, '');
        horoscopeText = horoscopeText.charAt(0).toUpperCase() + horoscopeText.slice(1);
        break;
    }

    horoscopeText = horoscopeText.replace('Learn More', '');

    return horoscopeText.trim();
  } catch (error) {
    console.error('Error fetching horoscope:', error);
    return 'Не удалось получить гороскоп';
  }
};

const OneDate = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  return `${day}`;
};

const formatDate = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const getWeekRange = () => {
  const currentDate = new Date();
  const firstDay = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1));
  const lastDay = new Date(currentDate.setDate(currentDate.getDate() + 6));
  return `${OneDate(firstDay)} - ${formatDate(lastDay)}`;
};

const getMonthRange = () => {
  const currentDate = new Date();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  return `${OneDate(firstDay)} - ${formatDate(lastDay)}`;
};

const MainPage = () => {
  const location = useLocation();
  const { zodiacSign } = location.state || {};
  const [horoscope, setHoroscope] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [showTabContent, setShowTabContent] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [userData, setUserData] = useState(null); // Состояние для хранения данных пользователя

  useEffect(() => {
    // Функция для получения данных пользователя
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/get-user'); // Настройте этот маршрут на вашем сервере
        setUserData(response.data);
      } catch (error) {
        console.error('Ошибка получения данных пользователя:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchAndTranslateHoroscope = async () => {
      const periodKey = {
        'Сегодня': 'today',
        'Завтра': 'tomorrow',
        'Неделя': 'week',
        'Месяц': 'month',
      }[activeTab] || '';

      let formattedDate = '';

      switch (activeTab) {
        case 'Сегодня':
          formattedDate = formatDate(new Date());
          break;
        case 'Завтра':
          formattedDate = formatDate(new Date(Date.now() + 86400000));
          break;
        case 'Неделя':
          formattedDate = getWeekRange();
          break;
        case 'Месяц':
          formattedDate = getMonthRange();
          break;
        default:
          return;
      }

      setCurrentDate(formattedDate);

      const horoscopeText = await getHoroscope(zodiacSign, periodKey);

      if (horoscopeText) {
        const translatedText = await translateText(horoscopeText);
        setHoroscope(translatedText);
      } else {
        setHoroscope('Не удалось получить гороскоп');
      }
    };

    fetchAndTranslateHoroscope();
  }, [activeTab, zodiacSign]);

  const toggleTabContent = () => {
    setShowTabContent(!showTabContent);
    if (showTabContent) {
      setActiveTab(null);
    }
  };

  return (
    <div className="main-page">
      <h2 style={{ marginTop: '10vh' }}>Ваш знак</h2>
      <h1>{zodiacSign}</h1>

      <div className="zodiac-image">
        {zodiacSign && (
          <img
            src={zodiacImages[zodiacSign]}
            alt={zodiacSign}
            style={{ maxWidth: '260px', height: 'auto' }}
          />
        )}
      </div>

      {/* Отображение данных пользователя */}
      {userData && (
        <div>
          <h3>Данные пользователя:</h3>
          <p>Имя: {userData.name}</p>
          <p>Дата рождения: {userData.birthdate}</p>
          {/* Добавьте другие данные, если необходимо */}
        </div>
      )}

      <div className="tabs-and-content">
        {showTabContent && activeTab && (
          <div className="toggle-icon" onClick={toggleTabContent}>
            <img src="free-icon-down-chevron-10728680.png" alt="" style={{ width: '35px' }} />
          </div>
        )}

        <div className="tabs">
          {['Сегодня', 'Завтра', 'Неделя', 'Месяц'].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? 'active' : ''}
              onClick={() => {
                setActiveTab(tab);
                setShowTabContent(true);
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="





ChatGPT сказал:
ChatGPT
tab-content"> {showTabContent && activeTab && ( <> <h3>{activeTab}</h3> <p>{currentDate}</p> <p>{horoscope}</p> </> )} </div> </div>
 <Link to="/">
    <div className="start-button">
      <img src="img/zhak/btn.png" alt="назад" />
    </div>
  </Link>
</div>
); };

export default MainPage;