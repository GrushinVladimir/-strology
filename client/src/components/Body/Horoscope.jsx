// src/components/Horoscope.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Horoscope = () => {
  const [horoscope, setHoroscope] = useState(null);  // Состояние для хранения гороскопа
  const [loading, setLoading] = useState(true);  // Состояние для отображения загрузки
  const [error, setError] = useState(null);  // Состояние для ошибки

  useEffect(() => {
    // Функция для запроса данных из API
    const fetchHoroscope = async () => {
      try {
        const response = await axios.get('/api/horoscope');  // Запрос к серверному API
        setHoroscope(response.data.horoscope);  // Установка данных гороскопа
      } catch (err) {
        setError('Failed to fetch horoscope');  // Установка ошибки, если запрос не удался
      } finally {
        setLoading(false);  // Закрытие состояния загрузки
      }
    };

    fetchHoroscope();  // Вызов функции при монтировании компонента
  }, []);

  if (loading) {
    return <div>Loading...</div>;  // Если данные загружаются
  }

  if (error) {
    return <div>{error}</div>;  // Если возникла ошибка
  }

  return (
    <div>
      <h1>Today's Horoscope</h1>
      <p>{horoscope}</p>  {/* Отображение текста гороскопа */}
    </div>
  );
};

export default Horoscope;
