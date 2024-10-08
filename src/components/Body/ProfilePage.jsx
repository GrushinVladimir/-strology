import React from 'react';
import { Link } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';  

const ProfilePage = () => {
  const { user } = useTelegram(); // Use the custom hook to get user data

  console.log(user); // Check the structure of the user object

  return (
    <div>
      <h1>Профиль пользователя</h1>
      {user ? (
        <>
          <p>Имя: {user.first_name} {user.last_name}</p>
          
          {/* Display the user's photo */}
          <img 
            src={user.photo_url || 'https://via.placeholder.com/100'} // Fallback if photo_url is absent
            alt="Профиль" 
            style={{ width: '100px', height: '100px' }} 
          />
          
          {/* Display the user's phone number */}
          <p>Номер телефона: {user.phone_number || 'Не предоставлен'}</p>
        </>
      ) : (
        <p>Загрузка данных пользователя...</p>
      )}

      <div className="menu">
        <Link to="/">
          <img src="img/menu/Union.png" alt="Главная" />
          <span>Главная</span>
        </Link>
        <a href="">
          <img src="img/menu/chat.png" alt="Чат" />
          <span>Чат</span>
        </a>
        <Link to="/profile">
          <img src="img/menu/profile.png" alt="Профиль" style={{ width: '16px' }} />
          <span>Профиль</span>
        </Link>
      </div>
    </div>
  );
};

export default ProfilePage;