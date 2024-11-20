import React, { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import axios from 'axios';
import { Link } from 'react-router-dom';
const ChatPage = () => {
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(true); // Состояние загрузки

  useEffect(() => {
      const fetchApiKey = async () => {
          try {
              const response = await fetch('/api/config');
              if (!response.ok) {
                  throw new Error('Сеть не отвечает'); // Обработка ошибки сети
              }
              const data = await response.json();
              setApiKey(data.apiKey);
          } catch (error) {
              console.error('Ошибка при получении API Key:', error);
          } finally {
              setLoading(false); // Завершение загрузки
          }
      };

      fetchApiKey();
  }, []);

  return (
      <div>
          {loading ? ( // Проверка состояния загрузки
              <div>Загрузка...</div>
          ) : (
              apiKey ? (
                  <div>Ваш API Key: {apiKey}</div>
              ) : (
                  <div>Не удалось получить API Key</div>
              )
          )}
      </div>
  );
};
