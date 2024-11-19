import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { load } from 'cheerio';
import { useLocation, Link, useParams } from 'react-router-dom';


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
      url = `https://www.horoscope.com/us/horoscopes/general/horoscope-general-daily-tomorrow.aspx?sign=${signNumber}`;
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
    const { data } = await axios.get(url);  // Здесь мы отправляем запрос на локальный путь /api
    const $ = cheerio.load(data);

    // Для отладки: выводим весь HTML
    console.log(data);  // Посмотрите, что именно приходит от сервера

    // Находим текст гороскопа
    let horoscopeText = $('div.horoscope__content p').text().trim();  // Убедитесь, что это правильный селектор

    if (!horoscopeText) {
      console.error('Гороскоп не найден или не был извлечен!');
      return 'Не удалось получить гороскоп';
    }

    // Возвращаем чистый текст гороскопа
    console.log('Извлечённый гороскоп:', horoscopeText);  // Проверяем, что гороскоп извлекается правильно
    return horoscopeText;
  } catch (error) {
    console.error('Ошибка при получении гороскопа:', error);
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
  const month = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const firstDay = new Date(year, currentDate.getMonth(), 1);
  const lastDay = new Date(year, currentDate.getMonth() + 1, 0);
  return `${OneDate(firstDay)} - ${formatDate(lastDay)}`;
};

const useTelegramId = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  return queryParams.get('telegramId'); // Здесь извлекаем telegramId из URL
};

const MainPage = ({ telegramId }) => { // Получаем telegramId через пропсы
  const [zodiacSign, setZodiacSign] = useState(null);
  const [horoscope, setHoroscope] = useState('');
  const [showTabContent, setShowTabContent] = useState(false);
  const [activeTab, setActiveTab] = useState('Сегодня');
  const [currentDate, setCurrentDate] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!telegramId) return; // Если нет telegramId, выходим из useEffect

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/api/users/${telegramId}`); // Запрос к серверу для получения данных
        if (response.data && response.data.user) {
          setUserData(response.data.user);
          setZodiacSign(response.data.user.zodiacSign); // Устанавливаем знак зодиака
        } else {
          console.error('Данные пользователя не найдены');
        }
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
      }
    };

    fetchUserData(); // Загружаем данные пользователя
  }, [telegramId]); // Используем telegramId в зависимости
  
  useEffect(() => {
    if (!zodiacSign) return;

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

      try {
        const horoscopeText = await getHoroscope(zodiacSign, periodKey);
        if (horoscopeText) {
          const translatedText = await translateText(horoscopeText);
          setHoroscope(translatedText);
        } else {
          setHoroscope('Не удалось получить гороскоп');
        }
      } catch (error) {
        console.error('Ошибка при получении гороскопа:', error);
        setHoroscope('Не удалось получить гороскоп');
      }
    };

    fetchAndTranslateHoroscope();
  }, [activeTab, zodiacSign]);

  return (
  <div className="main-page">

    <h2 style={{ marginTop: '10vh' }}>Ваш знак</h2>
    {zodiacSign ? (
    <>
      <h1>{zodiacSign}</h1>
      <div className="zodiac-image">
        {zodiacImages && zodiacImages[zodiacSign] ? (
          <img 
            src={zodiacImages[zodiacSign]} 
            alt={zodiacSign} 
            style={{ maxWidth: '260px', height: 'auto' }} 
          />
        ) : (
          <p>Изображение для знака зодиака не найдено</p>
        )}
      </div>
    </>
  ) : (
    <p>Знак зодиака...</p>
  )}

      <div className="tabs-and-content">
        {showTabContent && activeTab && (
          <div className="toggle-icon" onClick={() => setShowTabContent(!showTabContent)}>
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
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '24px' }}>
                {currentDate}
              </p>
              <p style={{ textAlign: 'left', lineHeight: '1rem', fontSize: '14px', paddingBottom: '2rem' }}>
                {horoscope || 'Загрузка гороскопа...'}
              </p>
            </>
          )}
        </div>

        <div className="menu">
          <Link to="/main">
            <img src="img/menu/Union.png" />
            <span>Главная</span>
          </Link>
          <Link to="/chat">
            <img src="img/menu/chat.png" />
            <span>Чат</span>
          </Link>
          <Link to={`/profile?telegramId=${telegramId}`}>
        <img src="img/menu/profile.png" style={{ width: '13px' }} />
        <span>Профиль</span>
      </Link>
        </div>
      </div>
    </div>
  );
};

export default MainPage;