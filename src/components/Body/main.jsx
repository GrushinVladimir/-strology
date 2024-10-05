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
    const horoscopeText = $('.main-horoscope p').text();
    return horoscopeText;
  } catch (error) {
    console.error('Error fetching horoscope:', error);
    return 'Unable to fetch horoscope';
  }
};

const MainPage = () => {
  const location = useLocation();
  const { zodiacSign } = location.state || {};
  const [horoscope, setHoroscope] = useState('');
  const [activeTab, setActiveTab] = useState('Сегодня');
  
  const fetchHoroscope = async (period) => {
    let periodKey = '';
    switch (period) {
      case 'Сегодня':
        periodKey = 'today';
        break;
      case 'Завтра':
        periodKey = 'tomorrow';
        break;
      case 'Неделя':
        periodKey = 'week';
        break;
      case 'Месяц':
        periodKey = 'month';
        break;
      default:
        return;
    }

    const horoscopeText = await getHoroscope(zodiacSign, periodKey);
    setHoroscope(horoscopeText);
  };

  useEffect(() => {
    fetchHoroscope(activeTab);
  }, [activeTab]);

  return (
    <div className="main-page">
      <h2>Ваш знак</h2>
      <h1>{zodiacSign}</h1>

      <div className="tabs">
        {['Сегодня', 'Завтра', 'Неделя', 'Месяц'].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => {
              setActiveTab(tab);
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="horoscope-content">
        <p>{horoscope}</p>
      </div>
    </div>
  );
};

export default MainPage;
