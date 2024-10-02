import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';


const MainPage = () => {
  const location = useLocation();
  const { zodiacSign } = location.state || {};

  const [activeTab, setActiveTab] = useState('Сегодня');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Сегодня':
        return <p>Астрологический прогноз на сегодня.</p>;
      case 'Завтра':
        return <p>Астрологический прогноз на завтра.</p>;
      case 'Неделя':
        return <p>Астрологический прогноз на неделю.</p>;
      case 'Месяц':
        return <p>Астрологический прогноз на месяц.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="main-page">
      <h1>Ваш знак</h1>
      <h2>{zodiacSign}</h2>
      <div className="zodiac-image">
        {/* Здесь будет изображение знака зодиака, пока оставляем пустым */}
      </div>
      <div className="tabs">
        <button
          className={activeTab === 'Сегодня' ? 'active' : ''}
          onClick={() => setActiveTab('Сегодня')}
        >
          Сегодня
        </button>
        <button
          className={activeTab === 'Завтра' ? 'active' : ''}
          onClick={() => setActiveTab('Завтра')}
        >
          Завтра
        </button>
        <button
          className={activeTab === 'Неделя' ? 'active' : ''}
          onClick={() => setActiveTab('Неделя')}
        >
          Неделя
        </button>
        <button
          className={activeTab === 'Месяц' ? 'active' : ''}
          onClick={() => setActiveTab('Месяц')}
        >
          Месяц
        </button>
      </div>
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default MainPage;
