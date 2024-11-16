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
<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none">
            <circle cx="11.5" cy="11.5" r="11" stroke="white"/>
            <path d="M7.64645 11.6464C7.45118 11.8417 7.45118 12.1583 7.64645 12.3536L10.8284 15.5355C11.0237 15.7308 11.3403 15.7308 11.5355 15.5355C11.7308 15.3403 11.7308 15.0237 11.5355 14.8284L8.70711 12L11.5355 9.17157C11.7308 8.97631 11.7308 8.65973 11.5355 8.46447C11.3403 8.2692 11.0237 8.2692 10.8284 8.46447L7.64645 11.6464ZM16 11.5L8 11.5V12.5L16 12.5V11.5Z" fill="white"/>
          </svg>           </button>

        <div className="header-pofile">
                  
            <div className="line-profile">
                <div className='top-profile-left'> 
                      <div style={{width:'60px', height:'60px;'}}>
                      <img   
                          src={'https://via.placeholder.com/100'}  
                          alt="Профиль" 
                        />  
                      </div> 
                      <div>
                        <p>Имя {userData.name}</p>           
                        <p>00.00.0000</p>  
                      </div> 
                </div>
              <div className='top-profile-right'>
                0,00
              </div>
          </div>  
          <div className="profile-desk">
            <h4 style={{fontWeight: '200'}}>О вашем знаке: РЫБЫ</h4>
            <p>Хорошо развитая от природы интуиция позволяет Рыбам приспособиться к любому общественному порядку, быть своим в любой среде, находить наилучшие выходы из затруднительных положений и устанавливать деловые связи с неизменной выгодой для себя.</p>
          </div>

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