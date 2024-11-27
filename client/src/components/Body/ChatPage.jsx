import React, { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import axios from 'axios';
import { Link,useNavigate } from 'react-router-dom';
import './ChatPage.css';
import './Body.css';  
const ChatPage = ({ remainingQuestions, decrementQuestions, zodiacSign, userName, telegramId }) => {
  const { user, tg } = useTelegram();
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [botTyping, setBotTyping] = useState(false);
  const navigate = useNavigate(); 
  const initialQuestions = [
    'Какие особенности моего знака зодиака?',
    'Ждёт ли меня болезнь в этом году?',
    'Чего стоит избегать завтра?',
    'Ждёт ли меня повышение на работе?',
  ];
  const [questions, setQuestions] = useState(initialQuestions);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Вот несколько вопросов, которые вы можете задать:', isQuestionHeader: true },
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
    }
    handleSendMessage(question);
  };

  useEffect(() => {
    tg.ready();
  }, [tg]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  const getAvatarUrl = (user) => {  
    return user && user.photo_url ? user.photo_url : 'https://via.placeholder.com/100';  
};  

  return (
    <div className="chat-container">
                  <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer'}} className='body-test'>  
          <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none">  
            <circle cx="11.5" cy="11.5" r="11" stroke="white"/>  
            <path d="M7.64645 11.6464C7.45118 11.8417 7.45118 12.1583 7.64645 12.3536L10.8284 15.5355C11.0237 15.7308 11.3403 15.7308 11.5355 15.5355C11.7308 15.3403 11.7308 15.0237 11.5355 14.8284L8.70711 12L11.5355 9.17157C11.7308 8.97631 11.7308 8.65973 11.5355 8.46447C11.3403 8.2692 11.0237 8.2692 10.8284 8.46447L7.64645 11.6464ZM16 11.5L8 11.5V12.5L16 12.5V11.5Z" fill="white"/>  
          </svg>  
        </button> 
      <div className="chat-header">
        <h2>Спроси Стешу</h2>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="avatar-container">
              <img
                src={message.sender === 'user' ? getAvatarUrl(user) : '/img/menu/BotAvatar.png'}
                alt={message.sender}
                className="avatar"
              />
              <span className="avatar-label">
                {message.sender === 'user' ? 'Вы' : 'ChatBot Стеша'}
              </span>
            </div>
            <div className="message-text">
              {message.isQuestionHeader ? (
                <div className="question-header">
                  {message.text}
                  <div className="questions-list">
                    {questions.map((question, index) => (
                      <button
                        key={index}
                        className="question-button"
                        onClick={() => handleQuestionClick(question)}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>{message.text}</div>
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
