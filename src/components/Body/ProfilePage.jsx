import React from 'react';
import { Link } from 'react-router-dom';

const ProfilePage = ({ name, zodiacSign }) => {
  return (
    <div>
      <h1>Профиль пользователя</h1>
      <p>Имя: {name}</p>
      <p>Знак зодиака: {zodiacSign}</p>

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
