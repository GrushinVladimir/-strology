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
    // Очищаем поле ввода после отправки сообщения  
    setInputMessage('');  
    if (!apiKey) {  
        setMessages((prevMessages) => [  
            ...prevMessages,  
            { sender: 'bot', text: 'Ошибка: API Key отсутствует. Пожалуйста, обратитесь к администратору.' },  
        ]);  
        return;  
    }  

    if (finalMessage.trim() === '') return;  

    // Добавляем сообщение пользователя в список сообщений  
    setMessages((prevMessages) => [  
        ...prevMessages,  
        { sender: 'user', text: finalMessage },  
    ]);  
    setBotTyping(true);  

    try {  
        const response = await axios.post('https://strology.vercel.app/api/chat', { message: fullMessage });  

        const botMessage = response.data.message || 'Ошибка: нет ответа.';  
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
    <img src="send.png" alt="Отправить" className="ico-send" />
  </button>
</div>

    {/* Вкладки */}
    <div className="tabs-and-content">
    <div className="menu">
          <Link to="/main">
          <img src="home.png" alt="Главная" className='ico-home' />  
            <span >Главная</span>
          </Link>
          <Link to="/chat">
          <img src="chat.png" alt="Чат"  className='ico-chat'  style={{opacity: '1'}}/>  
            <span  style={{opacity: '1'}}>Чат</span>
          </Link>
          <Link to={`/profile?telegramId=${telegramId}`}>
          <img src="user.png" alt="Профиль" className='ico-profile'/> 
        <span>Профиль</span>
      </Link>
        </div>
    </div>
  </div>
);
};

export default ChatPage;