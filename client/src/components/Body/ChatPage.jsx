import React, { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ChatPage.css';

const ChatPage = ({ remainingQuestions, decrementQuestions, zodiacSign, userName }) => {
  const { tg } = useTelegram();
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [botTyping, setBotTyping] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Вот вопросы, которые вы можете задать:', isQuestionHeader: true },
    { sender: 'bot', text: 'Какие особенности моего знака зодиака?', isClickable: true },
    { sender: 'bot', text: 'Ждёт ли меня болезнь в этом году?', isClickable: true },
    { sender: 'bot', text: 'Чего стоит избегать завтра?', isClickable: true },
    { sender: 'bot', text: 'Ждёт ли меня повышение на работе?', isClickable: true },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    if (!userName || !zodiacSign) {
      console.warn("Данные пользователя отсутствуют. Проверьте userName и zodiacSign.");
    }
  }, [userName, zodiacSign]);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch(`https://strology.vercel.app/api/config`);
        if (!response.ok) {
          throw new Error('Сеть не отвечает');
        }
        const data = await response.json();
        setApiKey(data.apiKey);
      } catch (error) {
        console.error('Ошибка при получении API Key:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApiKey();
  }, []);

  const handleSendMessage = async (message) => {
    const finalMessage = message || inputMessage;
    const fullMessage = `Тебя зовут Стеша. Ты астролог. Меня зовут: ${userName || "Неизвестный пользователь"}, Знак зодиака: ${zodiacSign || "Неизвестный знак"}. Вопрос: ${finalMessage}`;

    if (!apiKey) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: 'Ошибка: API Key отсутствует. Пожалуйста, обратитесь к администратору.' },
      ]);
      return;
    }

    if (finalMessage.trim() === '') return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text: finalMessage },
    ]);
    setBotTyping(true);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [{ role: 'user', content: fullMessage }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${apiKey}`,
          },
        }
      );

      const botMessage = response.data.choices?.[0]?.message?.content || 'Ошибка: нет ответа.';
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: botMessage, isClickable: false },
      ]);
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: 'Ошибка при получении ответа от API. Проверьте ключ или доступ к API.', isClickable: false },
      ]);
    } finally {
      setBotTyping(false);
    }

    setInputMessage('');
  };

  const handleQuestionClick = (question) => {
    if (remainingQuestions > 0) {
      decrementQuestions();
      handleSendMessage(question);
    } else {
      handleSendMessage(question);
    }
  };

  useEffect(() => {
    tg.ready();
  }, [tg]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Спроси Стешу</h2>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <img
              src={message.sender === 'user' ? '/img/user-avatar.png' : '/img/menu/BotAvatar.png'}
              alt={message.sender}
              className="avatar"
            />
            <div className="message-text">
              {message.isQuestionHeader ? (
                <div className="question-header">{message.text}</div>
              ) : message.isClickable ? (
                <button
                  className="question-button"
                  onClick={() => handleQuestionClick(message.text)}
                >
                  {message.text}
                </button>
              ) : (
                message.text
              )}
            </div>
          </div>
        ))}
        {botTyping && <div className="typing-indicator">Chat bot Стеша печатает...</div>}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Задай вопрос звездам..."
        />
        <button onClick={() => handleSendMessage(inputMessage)}>Отправить</button>
      </div>

      <div className="tabs-and-content">
        <div className="menu">
          <Link to="/main">
            <img src="img/menu/Union.png" alt="Главная" />
            <span>Главная</span>
          </Link>
          <Link to="/chat">
            <img src="img/menu/chat.png" alt="Чат" />
            <span>Чат</span>
          </Link>
          <Link to="/profile">
            <img src="img/menu/profile.png" alt="Профиль" />
            <span>Профиль</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
