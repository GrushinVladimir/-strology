import React, { useEffect, useState } from 'react';  
import { useTelegram } from '../hooks/useTelegram';  
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLocation} from 'react-router-dom';

const useTelegramID = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  return queryParams.get('telegramId'); // Здесь извлекаем telegramId из URL
};

const ProfilePage = () => {  
  const navigate = useNavigate();
  const telegramId = useTelegramID();  
  const [userData, setUserData] = useState(null);  
  const [phoneNumber, setPhoneNumber] = useState('');  

  useEffect(() => {  
    const fetchUserData = async () => {
      const response = await fetch(`http://localhost:3000/api/users/${telegramId}`); // Замените на ваш адрес API
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error('Ошибка при получении данных пользователя');
      }
    };

    fetchUserData();
  }, [telegramId]);  

  useEffect(() => {  
    const fetchPhoneNumber = async () => {  
      const response = await fetch('http://localhost:3000/api/contact'); // Замените на ваш адрес API  
      const data = await response.json();  
      setPhoneNumber(data.phoneNumber || 'Не предоставлен');  
    };  

    fetchPhoneNumber();  
  }, []);  

  return (  
    <div className='Prof'>  
      {userData ? (  
        <div className='body-profile'>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer'}}>
            {/* SVG кнопки назад */}
          </button>

          <div className="header-pofile">
            <div className="line-profile">
              <div className='top-profile-left'> 
                <div style={{width:'60px', height:'60px'}}>
                  <img src={'https://via.placeholder.com/100'} alt="Профиль" />  
                </div> 
                <div>
                  <p>Имя: {userData.name}</p>           
                  <p>Дата рождения: {userData.birthDate}</p>  
                </div> 
              </div>
              <div className='top-profile-right'>
                {phoneNumber}
              </div>
            </div>  
            <div className="profile-desk">
              <h4 style={{fontWeight: '200'}}>О вашем знаке: {userData.zodiacSign}</h4>
              <p>{/* Описание знака зодиака */}</p>
            </div>

            <div className="center-profile">
              <div className="profile-block">
                <p>Пройти тест на знак зодиака</p>
                <Link to="/test">  
                  <button className='button na'>Летс гоу</button>
                </Link>  
              </div>
              <div className="profile-block">
                <p>Проходи ежедневные задания и получай приятные бонусы</p>
                <Link to="/zadaniya"> 
                  <button className='button na'>Летс гоу</button>
                </Link>  
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
      ) : (  
<>Нет коннекта</>
      )}  

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