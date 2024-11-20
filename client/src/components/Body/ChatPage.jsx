import React, { useState, useEffect } from 'react';  
import { useTelegram } from '../hooks/useTelegram';  
import axios from 'axios';  
import { Link } from 'react-router-dom';  

const ChatPage = ({ remainingQuestions, decrementQuestions })  => {  
  const { tg } = useTelegram();  
  const [apiKey, setApiKey] = useState(null);  
  const [loading, setLoading] = useState(true);  
  const [messages, setMessages] = useState([  
    { sender: 'bot', text: 'Вот вопросы, которые вы можете задать:', isQuestionHeader: true },  
    { sender: 'bot', text: 'Какие особенности моего знака зодиака?' },  
    { sender: 'bot', text: 'Ждёт ли меня болезнь в этом году?' },  
    { sender: 'bot', text: 'Чего стоит избегать завтра?' },  
    { sender: 'bot', text: 'Ждёт ли меня повышение на работе?' },  
  ]);  
  const [inputMessage, setInputMessage] = useState('');  

  // Вытаскиваем API ключ  
  useEffect(() => {  
    const fetchApiKey = async () => {  
      try {  
        const response = await fetch(`/api/config`);  
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

    if (!apiKey) {  
      console.error('API Key отсутствует. Проверьте настройки.');  
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

    try {  
      const response = await axios.post(  
        'https://api.openai.com/v1/chat/completions',  
        {  
          model: 'gpt-4',  
          messages: [{ role: 'user', content: finalMessage }],  
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
        { sender: 'bot', text: botMessage },  
      ]);  
    } catch (error) {  
      console.error('Ошибка при отправке сообщения:', error);  
      setMessages((prevMessages) => [  
        ...prevMessages,  
        { sender: 'bot', text: 'Ошибка при получении ответа от API. Проверьте ключ или доступ к API.' },  
      ]);  
    }  

    setInputMessage('');  
  };  

  const handleQuestionClick = (question) => {  
    if (remainingQuestions > 0) {  
      console.log("Вопрос задан, оставшиеся вопросы:", remainingQuestions); // Для отладки  
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
        <button onClick={() => handleQuestionClick()}>Отправить</button>  
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