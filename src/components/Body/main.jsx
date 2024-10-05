import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { load } from 'cheerio';
import { useLocation } from 'react-router-dom';

const zodiacSigns = {
  'Водолей': 11,
  'Рыбы': 12,
  'Овен': 1,
  'Телец': 2,
  'Близнецы': 3,
  'Рак': 4,
  'Лев': 5,
  'Дева': 6,
  'Весы': 7,
  'Скорпион': 8,
  'Стрелец': 9,
  'Козерог': 10,
};

const zodiacImages = {
  Водолей: 'img/zhak/vodoley.png',
  Рыбы: 'img/zhak/riby.png',
  Овен: 'img/zhak/oven.png',
  Телец: 'img/zhak/telec.png',
  Близнецы: 'img/zhak/bliznecy.png',
  Рак: 'img/zhak/rak.png',
  Лев: 'img/zhak/lev.png',
  Дева: '/img/zhak/deva.png',
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

    // Удаляем строку с датой для каждого периода
    switch (period) {
      case 'today':
      case 'tomorrow':
        horoscopeText = horoscopeText.replace(/^\w+ \d{1,2}, \d{4} -\s*/, '');
        break;
      case 'week':
        horoscopeText = horoscopeText.replace(/^\w+ \d{1,2}(, \d{4})? - \w+ \d{1,2}(, \d{4})?\s*-?\s*/, '');
        break;
      case 'month':
        horoscopeText = horoscopeText.replace(/^\w+ \d{4} - On \w+ \d{1,2}/, '');
        horoscopeText = horoscopeText.replace(/^,\s*/, ''); // Убираем запятую и пробелы
        horoscopeText = horoscopeText.charAt(0).toUpperCase() + horoscopeText.slice(1);
        break;
    }

    horoscopeText = horoscopeText.replace('Learn More', '');

    return horoscopeText.trim();
  } catch (error) {
    console.error('Error fetching horoscope:', error);
    return 'Unable to fetch horoscope';
  }
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
  return `${formatDate(firstDay)} - ${formatDate(lastDay)}`;
};

const getMonthRange = () => {
  const currentDate = new Date();
  const month = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  return `${month} ${year}`;
};

const MainPage = () => {
  const location = useLocation();
  const { zodiacSign } = location.state || {};
  const [horoscope, setHoroscope] = useState('');
  const [activeTab, setActiveTab] = useState('Сегодня');
  const [showTabContent, setShowTabContent] = useState(false);
  const [currentDate, setCurrentDate] = useState(''); // Для хранения текущей даты

  const fetchHoroscope = async (period) => {
    let periodKey = '';
    let formattedDate = '';

    switch (period) {
      case 'Сегодня':
        periodKey = 'today';
        formattedDate = formatDate(new Date());
        break;
      case 'Завтра':
        periodKey = 'tomorrow';
        formattedDate = formatDate(new Date(Date.now() + 86400000)); // Завтра
        break;
      case 'Неделя':
        periodKey = 'week';
        formattedDate = getWeekRange();
        break;
      case 'Месяц':
        periodKey = 'month';
        formattedDate = getMonthRange();
        break;
      default:
        return;
    }

    setCurrentDate(formattedDate); // Устанавливаем текущую дату для выбранного периода

    const horoscopeText = await getHoroscope(zodiacSign, periodKey);
    setHoroscope(horoscopeText);
  };

  useEffect(() => {
    fetchHoroscope(activeTab);
  }, [activeTab]);

  const toggleTabContent = () => {
    setShowTabContent(!showTabContent);
    if (showTabContent) {
      setActiveTab(null);
    }
  };

  return (
    <div className="main-page">
      <h2>Ваш знак</h2>
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

        <div className="tab-content-container">
          {showTabContent && (
            <>
              <p style={{ textAlign: 'center', fontWeight: 'bold' }}>{currentDate}</p> {/* Добавление даты по центру */}
              <p>{horoscope}</p>
            </>
          )}
        </div>

        <div className="menu">
          <a href="">
            <img src="img/menu/Union.png" />
            <span>Главная</span>
          </a>
          <a href="">
            <img src="img/menu/chat.png" />
            <span>Чат</span>
          </a>
          <a href="">
            <img src="img/menu/profile.png" style={{ width: '16px' }} />
            <span>Профиль</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
