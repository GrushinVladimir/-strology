import React, { useState, useEffect, useRef} from 'react';
import { useTelegram } from '../hooks/useTelegram';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './ChatPage.css';

const ChatPage = ({ remainingQuestions, decrementQuestions, zodiacSign, userName, telegramId }) => {
  const { user, tg } = useTelegram();
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [botTyping, setBotTyping] = useState(false);
  const navigate = useNavigate(); 
  const messagesEndRef = useRef(null); // Реф для конца списка сообщений
  const [error, setError] = useState(null);  
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
    // Скроллится к последнему сообщению
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, botTyping]); // Скроллится при изменении сообщений или статуса печати бота


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
      setError(err.message); 
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
    return (
        <div className="loading-overlay">
            <div className="loader"></div>
        </div>
    );
}

if (error) return <p>{error}</p>;

  const getAvatarUrl = (user) => {  
    return user && user.photo_url ? user.photo_url : 'https://via.placeholder.com/100';  
};  

return (
  <div className="chat-container">
    {/* Заголовок, кнопки и другие элементы */}
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
      {/* Реф для конца сообщений */}
      <div ref={messagesEndRef} />
    </div>

    <div className="chat-input">
  <input
    type="text"
    placeholder="Задай вопрос звёздам..."
    value={inputMessage}
    onChange={(e) => setInputMessage(e.target.value)} // Обновление состояния при вводе
    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} // Отправка по Enter
  />
  <button onClick={() => handleSendMessage()}> {/* Отправка по кнопке */}
    <img src="/img/menu/ButtonSend.png" alt="Отправить" className="send-icon" />
  </button>
</div>

    {/* Вкладки */}
    <div className="tabs-and-content">
      <div className="menu">
        <Link to="/main">
          <img src="img/menu/Union.png" alt="Главная" />
          <span>Главная</span>
        </Link>
        <Link to="/chat">
          <img src="img/menu/profileActive.png" alt="Чат" />
          <span style={{color:'white',opacity: '1'}}>Чат</span>
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