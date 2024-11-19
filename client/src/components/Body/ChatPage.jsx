import React, { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import axios from 'axios';
import { Link } from 'react-router-dom';

// API-ключ будет храниться в переменной окружения
const API_KEY = process.env.REACT_APP_CHATGPT_API_KEY;
console.log('API Key:', API_KEY)
function ChatPage() {
  const { tg } = useTelegram();
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Вот вопросы, которые вы можете задать:', isQuestionHeader: true },
    { sender: 'bot', text: 'Какие особенности моего знака зодиака?' },
    { sender: 'bot', text: 'Ждёт ли меня болезнь в этом году?' },
    { sender: 'bot', text: 'Чего стоит избегать завтра?' },
    { sender: 'bot', text: 'Ждёт ли меня повышение на работе?' },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async (message) => {
    const finalMessage = message || inputMessage;

    if (finalMessage.trim() === '') return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text: finalMessage },
    ]);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Ты астрологический помощник по имени Стеша.' },
            { role: 'user', content: finalMessage },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );
    
      console.log('Ответ от API:', response); // Добавлено для отладки
    
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: response.data.choices[0].message.content || 'Ошибка: нет ответа.' },
      ]);
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      let errorMessage = 'Ошибка при получении ответа. Попробуйте снова.';
    
      // Дополнительная информация о ошибке
      if (error.response) {
        // Сервер ответил статусом, отличным от 2xx
        console.error('Ответ сервера:', error.response.data);
        errorMessage += ` Ошибка сервера: ${error.response.data.message || error.response.statusText}`;
      } else if (error.request) {
        // Запрос был отправлен, но ответа не получено
        console.error('Запрос:', error.request);
        errorMessage += ' Не удалось получить ответ от сервера.';
      } else {
        // Произошла ошибка при настройке запроса
        console.error('Ошибка:', error.message);
        errorMessage += ' Произошла ошибка при отправке запроса.';
      }
    
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: errorMessage },
      ]);
    }

    setInputMessage('');
  };

  const handleQuestionClick = (question) => {
    handleSendMessage(question);
  };

  useEffect(() => {
    tg.ready();
  }, [tg]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Спроси Стешу</h2>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={message.sender === 'user' ? 'user-message' : 'bot-message'}
          >
            {message.isQuestionHeader ? (
              <div className="question-header">{message.text}</div>
            ) : (
              <button
                className="question-button"
                onClick={() => handleQuestionClick(message.text)}
              >
                {message.text}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Задай вопрос звездам..."
        />
        <button onClick={() => handleSendMessage()}>Отправить</button>
      </div>

      <div className="tabs-and-content">
        <div className="menu">
          <Link to="/main" style={{ textAlign: 'center' }}>
            <img src="img/menu/Union.png" alt="Главная" />
            <span>Главная</span>
          </Link>
          <Link to="/chat" style={{ textAlign: 'center' }}>
            <img src="img/menu/chat.png" alt="Чат" />
            <span>Чат</span>
          </Link>
          <Link to="/profile" style={{ textAlign: 'center' }}>
            <img src="img/menu/profile.png" alt="Профиль" style={{ width: '13px' }} />
            <span>Профиль</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
