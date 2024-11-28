import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { load } from 'cheerio';
import { useLocation, Link, useParams } from 'react-router-dom';
const MainPage = ({ telegramId }) => {  
  const [zodiacSign, setZodiacSign] = useState(null);  
  const [horoscope, setHoroscope] = useState('');  
  const [activeTab, setActiveTab] = useState('Сегодня');  
  const [currentDate, setCurrentDate] = useState('');  
  const [userData, setUserData] = useState(null);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);  
  const [tabLoading, setTabLoading] = useState(false);  
  const [showTabContent, setShowTabContent] = useState(false);  

  useEffect(() => {  
    if (!telegramId) return;  

    const fetchUserData = async () => {  
      try {  
        const response = await axios.get(`/api/users/${telegramId}`);  
        if (response.data && response.data.user) {  
          setUserData(response.data.user);  
          setZodiacSign(response.data.user.zodiacSign);  
        } else {  
          console.error('Данные пользователя не найдены');  
        }  
      } catch (error) {  
        console.error('Ошибка при получении данных пользователя:', error);  
        setError('Ошибка при получении данных пользователя');  
      } finally {  
        setLoading(false); // Устанавливаем loading в false после завершения загрузки данных пользователя  
      }  
    };  

    fetchUserData();  
  }, [telegramId]);  

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
      setTabLoading(true); // Устанавливаем состояние загрузки в true для табов  
      setShowTabContent(false); // Скрываем контент перед загрузкой  

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
        setTabLoading(false); // Устанавливаем состояние загрузки в false после завершения  
        setShowTabContent(true); // Показываем контент после загрузки  
      }  
    };  

    fetchAndTranslateHoroscope();  
  }, [activeTab, zodiacSign]);  

  if (loading) {  
    return (  
      <div className="loading-overlay">  
        <div className="loader">Загрузка данных пользователя...</div>  
      </div>  
    );  
  }  

  if (error) return <p>{error}</p>;  

  if (tabLoading) {  
    return (  
      <div className="loading-overlay">  
        <div className="loader">Загрузка гороскопа...</div>  
      </div>  
    );  
  }  

  return (  
    <div className="main-page">  
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
        <p>Знак зодиака не найден...</p>  
      )}  

      <div className="tabs-and-content">  
        {showTabContent && activeTab && (  
          <div className="toggle-icon" onClick={() => setShowTabContent(!showTabContent)}>  
            <img src="free-icon-down-chevron-10728680.png" alt="Toggle" style={{ width: '35px' }} />  
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
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '24px' }}>{currentDate}</p>  
              <p style={{ textAlign: 'left', lineHeight: '1rem', fontSize: '14px', paddingBottom: '2rem' }}>  
                {horoscope || 'Гороскоп пока недоступен'}  
              </p>  
            </>  
          )}  
        </div>  

        <div className="menu">  
          <Link to="/main">  
            <img src="img/menu/home.png" alt="Home" />  
            <span style={{ color: 'white', opacity: '1' }}>Главная</span>  
          </Link>  
          <Link to="/chat">  
            <img src="img/menu/chat.png" alt="Chat" />  
            <span>Чат</span>  
          </Link>  
          <Link to={`/profile?telegramId=${telegramId}`}>  
            <img src="img/menu/profile.png" style={{ width: '13px' }} alt="Profile" />  
            <span>Профиль</span>  
          </Link>  
        </div>  
      </div>  
    </div>  
  );  
};  

export default MainPage;  