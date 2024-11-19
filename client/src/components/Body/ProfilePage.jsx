
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProfilePage = ({ telegramId }) => {
  const [userData, setUserData] = useState(null);
  const [zodiacSign, setZodiacSign] = useState(null);
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [error, setError] = useState(null); // Состояние ошибки
  const navigate = useNavigate();

  useEffect(() => {
    if (!telegramId) return;

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/api/users/${telegramId}`);
        if (response.data && response.data.user) {
          setUserData(response.data.user);
          setZodiacSign(response.data.user.zodiacSign); // Устанавливаем знак зодиака
        } else {
          console.error('Данные пользователя не найдены');
          setError('Данные пользователя не найдены');
        }
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        setError('Ошибка при получении данных пользователя');
      } finally {
        setLoading(false); // Завершаем загрузку
      }
    };

    fetchUserData();
  }, [telegramId]);

  const getAvatarUrl = (user) => {
    return user && user.photo_url ? user.photo_url : 'https://via.placeholder.com/100'; // Используйте photo_url, если он есть
  };

  if (loading) return <p>Загрузка...</p>; // Сообщение о загрузке
  if (error) return <p>{error}</p>; // Сообщение об ошибке

  return (
    <div className='Prof'>
      <div className='body-profile'>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer'}}>
          {/* Ваш SVG-код кнопки назад */}
        </button>

        <div className="header-pofile">
          <div className="line-profile">
            <div className='top-profile-left'> 
              <div style={{ width: '60px', height: '60px' }}>
                <img src={getAvatarUrl(userData)} alt="Профиль" />
              </div>
              {userData ? (
                <div>
                  <p>{userData.name}</p>
                </div>
              ) : (
                <p>Пользователь не найден</p>
              )}
            </div>
            <div className='top-profile-right'>
              0,00
            </div>
          </div>

        {userData && (
          <div className="profile-desk">
            <h4 style={{fontWeight: '200'}}>О вашем знаке: {zodiacSign || 'Не найден'}</h4>  {/* Вывод знака зодиака */}
            <p>{userData.zodiacDescription}</p>  {/* Описание знака зодиака */}
          </div>
        )}

          <div className="center-profile">
            <div className="profile-block">
            <p>Пройти тест на знак зодиака</p>
            <Link to="/test">  
            <button className='button na' 
            style={{
              position: 'absolute', margin: '2vh auto auto', display: 'block', left: 'unset', transform: 'none', padding: '6px 15px',
              bottom: '0',
              transform: 'translateX(-50%)',
              left: '50%',
              width: '115px',
              fontSize: '15px'
            }}
            >Летс гоу</button> </Link>  
            </div>
            <div className="profile-block">
              <p>Проходи ежедневные задания и получай приятные бонусы</p>
              <Link to="/zadaniya"> 
              <button className='button na' 
            style={{
              position: 'absolute', margin: '2vh auto auto', display: 'block', left: 'unset', transform: 'none', padding: '6px 15px',
              bottom: '0',
              transform: 'translateX(-50%)',
              left: '50%',
              width: '115px',
              fontSize: '15px'
            }}
            >Летс гоу</button></Link>  
              </div>
              
          </div>

          <div className="bottom-profile">
          <div>
            <p>Часто задаваемые вопросы</p>
          </div>
          <div>
            <p>Пригласить друга </p>
          </div>
          <div>
            <p>Поддержка</p>
          </div>
          </div>

        </div> 
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
  <Link to="/profile">
    <img src="img/menu/profile.png" style={{ width: '13px' }} />
    <span>Профиль</span>
  </Link>
</div>
    </div>  
  );  
};  

export default ProfilePage;  