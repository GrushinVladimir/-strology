import React, { useEffect, useState } from 'react';  
import { useTelegram } from '../hooks/useTelegram';  
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const ProfilePage = ({ telegramId }) => {  
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);  // Состояние для хранения данных пользователя
  
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await fetch(`/api/users/${telegramId}`);  // Запрос к API для получения данных по telegramId
        const data = await response.json();

        if (data) {
          setUserData(data);  // Устанавливаем данные пользователя в состояние
        }
      } catch (error) {
        console.error('Ошибка при получении профиля:', error);
      }
    }

    if (telegramId) {
      fetchUserProfile();
    }
  }, [telegramId]);


  return (  
    <div className='Prof'>  
    <div className='body-profile'>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer'}}>
        {/* Ваш SVG-код кнопки назад */}
      </button>

      <div className="header-pofile">
        <div className="line-profile">
          <div className='top-profile-left'> 
            <div style={{width:'60px', height:'60px'}}>
              <img src={'https://via.placeholder.com/100'} alt="Профиль" />
            </div> 
            {userData ? (
              <div>
                <p>{userData.name}</p>           {/* Выводим имя пользователя */}
                <p>{userData.birthDate}</p>     {/* Выводим дату рождения */}
              </div>
            ) : (
              <div>
                <p>Загрузка...</p>   {/* Сообщение пока загружаются данные */}
              </div>
            )}
          </div>
          <div className='top-profile-right'>
            0,00
          </div>
        </div>  

        {userData && (
          <div className="profile-desk">
            <h4 style={{fontWeight: '200'}}>О вашем знаке: {userData.zodiacSign}</h4>  {/* Вывод знака зодиака */}
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