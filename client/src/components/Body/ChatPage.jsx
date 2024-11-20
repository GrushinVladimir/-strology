import React, { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import axios from 'axios';
import { Link } from 'react-router-dom';
const ChatPage = () => {
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
      const fetchApiKey = async () => {
          try {
              const response = await fetch('/api/config');
              const data = await response.json();
              setApiKey(data.apiKey);
          } catch (error) {
              console.error('Ошибка при получении API Key:', error);
          }
      };

      fetchApiKey();
  }, []);

  return (
      <div>
          {apiKey ? (
              <div>Ваш API Key: {apiKey}</div>
          ) : (
              <div>Загрузка...</div>
          )}
      </div>
  );
};

export default ChatPage;