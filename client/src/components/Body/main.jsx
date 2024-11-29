import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { load } from 'cheerio';
import { useLocation, Link, useParams } from 'react-router-dom';

const getApiKey = async () => {
  try {
    const response = await axios.get('https://strology.vercel.app/api/config-google');
    return response.data.apiKeys;
  } catch (error) {
    console.error('Ошибка при получении ключа API:', error);
    throw new Error('Не удалось получить ключ API');
  }
};
const translateText = async (text) => {
  try {
    const apiKey = await getApiKey(); // Получаем ключ API
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const response = await axios.post(url, {
      q: text,
      target: 'ru',
    });

    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Ошибка перевода текста:', error);
    return text; // Возвращаем оригинальный текст в случае ошибки
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
  Водолей: {  
    src: 'img/zhak/vodoley2.png',  
    width: '210px', // ширина  
    height: 'auto' // высота  
  },  
  Рыбы: {  
    src: 'img/zhak/riby2.png',  
    width: '311px',  
    height: 'auto'  
  },  
  Овен: {  
    src: 'img/zhak/oven2.png',  
    width: '250px',  
    height: 'auto'  
  },  
  Телец: {  
    src: 'img/zhak/telec2.png',  
    width: '250px',  
    height: 'auto'  
  },  
  Близнецы: {  
    src: 'img/zhak/bliznecy2.png',  
    width: '200px',  
    height: 'auto'  
  },  
  Рак: {  
    src: 'img/zhak/rak2.png',  
    width: '288px',  
    height: 'auto'  
  },  
  Лев: {  
    src: 'img/zhak/lev2.png',  
    width: '215px',  
    height: 'auto'  
  },  
  Дева: {  
    src: 'img/zhak/deva2.png',  
    width: '210px',  
    height: 'auto'  
  },  
  Весы: {  
    src: 'img/zhak/vesy2.png',  
    width: '220px',  
    height: 'auto'  
  },  
  Скорпион: {  
    src: 'img/zhak/scorpion2.png',  
    width: '245px',  
    height: 'auto'  
  },  
  Стрелец: {  
    src: 'img/zhak/strelec2.png',  
    width: '226px',  
    height: 'auto'  
  },  
  Козерог: {  
    src: 'img/zhak/kozerog2.png',  
    width: '220px',  
    height: 'auto'  
  },  
};  


const getHoroscope = async (zodiacSign, period) => {  
  try {  
    const response = await axios.get(`/api/horoscope`, {  
      params: { zodiacSign, period }, // Передаем параметры в запросе  
    });  

    return response.data.horoscope;  
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
  const [showContent, setShowContent] = useState(false);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);  
  const [tabLoading, setTabLoading] = useState(false);  


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
      setLoading(false); // Устанавливаем состояние загрузки в true  
      setShowContent(false); // Скрываем контент перед загрузкой  
  
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
      } finally {  
        setTabLoading(True); // Устанавливаем состояние загрузки в false после завершения  
        setTimeout(() => {  
          setShowContent(true); // Показываем контент с задержкой  
        }, 500); // Задержка в 500 мс  
      }  
    };  
  
    fetchAndTranslateHoroscope();  
  }, [activeTab, zodiacSign]);  

  if (loading) {
    return (
        <div className="loading-overlay">
            <div className="loader"></div>
        </div>
    );
}

if (error) return <p>{error}</p>;

  return (
    


  <div className="main-page">
<img src="zvezda.png" />  
    <h2 style={{ marginTop: '10vh' }}>Ваш знак</h2>
    {zodiacSign ? (
    <>
      <h1>{zodiacSign}</h1>
      <div className="zodiac-image">  
  {zodiacImages && zodiacImages[zodiacSign] ? (  
    <img  
      src={zodiacImages[zodiacSign].src}  
      alt={zodiacSign}  
      style={{ maxWidth: zodiacImages[zodiacSign].width, height: zodiacImages[zodiacSign].height }}  
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
            <img src="ard.png" alt="" style={{ width: '20px', background: '#4c3997', borderRadius: '50%',  padding: '5px', border: '.5px solid #e7dfdf52'}} />
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
          <>  
            <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '24px' }}>{currentDate}</p>  
            <p style={{ textAlign: 'left', lineHeight: '1rem', fontSize: '14px', paddingBottom: '2rem' }}>{horoscope || 'Гороскоп пока недоступен'}</p>  
          </>  

    </>  
  )}  
</div>  
              
             
        <div className="menu">
          <Link to="/main">
          <img src="home.png" alt="Главная" className='ico-home' style={{opacity: '1'}}/>  
            <span style={{opacity: '1'}}>Главная</span>
          </Link>
          <Link to="/chat">
          <img src="chat.png" alt="Чат"  className='ico-chat'/>  
            <span>Чат</span>
          </Link>
          <Link to={`/profile?telegramId=${telegramId}`}>
          <img src="user.png" alt="Профиль" className='ico-profile'/> 
        <span>Профиль</span>
      </Link>
        </div>
      </div>
    </div>
  );
};

export default MainPage;