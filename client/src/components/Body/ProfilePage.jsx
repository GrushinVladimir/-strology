import { Link, useNavigate } from 'react-router-dom';  
import React, { useEffect, useState } from 'react';  
import axios from 'axios';  
import { useTelegram } from '../hooks/useTelegram'; 
import './Body.css';  

const ProfilePage = ({ telegramId }) => {  
    const { user, tg } = useTelegram();  
    const [userData, setUserData] = useState(null);  
    const [zodiacSign, setZodiacSign] = useState(null);  
    const [loading, setLoading] = useState(true);  
    const [error, setError] = useState(null);  
    const [testCompleted, setTestCompleted] = useState(false);
    const [showSupportModal, setShowSupportModal] = useState(false);  // Добавим состояние для модалки
    const navigate = useNavigate();  
    const [isPaid, setIsPaid] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);  
    const [showFullDescription, setShowFullDescription] = useState(false);

    //Функции проверка по БД
    const fetchData = async () => {  
        try {  
            // Запрос на получение данных пользователя  
            const userResponse = await axios.get(`/api/users/${telegramId}`);  
            if (userResponse.data && userResponse.data.user) {  
                setUserData(userResponse.data.user);  
                setZodiacSign(userResponse.data.user.zodiacSign);  
            } else {  
                throw new Error('Данные пользователя не найдены');  
            }  

            // Запрос на проверку статуса платежа  
            const paymentResponse = await axios.get(`/api/payment/${telegramId}`);  
            if (paymentResponse.data && paymentResponse.data.paid) {  
                setPaymentStatus(true);  
            } else {  
                setPaymentStatus(false);  
            }  

            // Запрос на проверку результатов теста  
            const testResponse = await axios.get(`/api/test-results/${telegramId}`);  
            setTestCompleted(testResponse.data && testResponse.data.length > 0);  

        } catch (err) {  
            setError(err.message);  
        } finally {  
            setLoading(false); // Устанавливаем флаг загрузки как завершенный  
        }  
    };  

    useEffect(() => {  
        if (telegramId) {  
            fetchData(); // Инциализируем запрос данных при загрузке  
        }  
    }, [telegramId]);  

    
    const getAvatarUrl = (user) => {  
        return user && user.photo_url ? user.photo_url : 'https://via.placeholder.com/100';  
    };  

    if (loading) return <p>Загрузка...</p>; // Display loading indicator  
    if (error) return <p>{error}</p>; // Display error message  
    
    //Обрезка описания Знака
    const truncateDescription = (description) => {
        if (!description) return '';
        return description.length > 50 ? description.slice(0, 50) + '...' : description;
    };

    //Функция Пригласить друга
    const handleInviteClick = () => {
        const inviteLink = 'https://t.me/mygoroskopbot_lite_new_bot'; // Ссылка на ваш бот в Telegram
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=Пригласите своего друга в наше астрологическое приложение!`;
        window.open(shareUrl, '_blank');
    };

    //Поддержка
    const handleSupportClick = () => {
        setShowSupportModal(true); 
    };
    const closeModal = () => {
        setShowSupportModal(false);
    };
    
    // Функция для удаления профиля  
    const handleDeleteProfile = async () => {  
        console.log(`Удаление профиля с telegramId: ${telegramId}`);  
    
        if (!telegramId) {  
            alert('telegramId недоступен. Проверьте состояние пользователя.');  
            return;  
        }  
        const confirmDelete = window.confirm("Вы уверены, что хотите удалить свой профиль?");  
        if (confirmDelete) {  
            try {  
                // Здесь добавьте дополнительную проверку перед удалением  
                const response = await fetch(`/api/users/${telegramId}`, {  
                    method: 'DELETE',  
                    headers: {  
                        'Content-Type': 'application/json',  
                    },  
                });  
    
                if (response.ok) {  
                    console.log('Профиль успешно удален!');  
                    alert("Профиль успешно удален!");  
                    navigate('/'); // Перенаправление  
                } else {  
                    const errorData = await response.json();  
                    alert("Ошибка при удалении профиля: " + errorData.message);  
                }  
            } catch (error) {  
                console.error('Ошибка:', error);  
                alert("Произошла ошибка. Попробуйте еще раз.");  
            }  
        }  
    };  
    //Функция на оплату
    const startPayment = async (telegramId, amount, currency) => {  
        const invoiceData = {  
            chatId: String(telegramId),  
            amount: amount, // добавьте сумму  
            currency: currency // добавьте валюту  
        };  
    
        try {  
            console.log('Отправка данных для инвойса:', JSON.stringify(invoiceData));  
            const response = await fetch('https://strology.vercel.app/api/payment', {  
                method: 'POST',  
                headers: {  
                    'Content-Type': 'application/json',  
                },  
                body: JSON.stringify(invoiceData),  
            });  
    
            if (!response.ok) {  
                const errorData = await response.json();  
                throw new Error(`Ошибка при отправке инвойса: ${errorData.message || 'Неизвестная ошибка'}`);  
            }  
    
            const data = await response.json();  
            console.log('Инвойс отправлен!', data);  
    
            // Проверка успешности платежа  
            if (data.success) {  
                alert('Инвойс успешно отправлен в чат Telegram! Платеж был успешно обработан.');  
                setIsPaid(true); // Устанавливаем состояние, что платеж был выполнен  
            } else {  
                alert('Ошибка при обработке платежа. Пожалуйста, попробуйте еще раз.');  
            }  
        } catch (error) {  
            console.error('Ошибка:', error);  
            alert(`Произошла ошибка: ${error.message}`);  
        }  
    };    

    return (  
        <div className='Prof'>  
            <div className='body-profile'>  
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer'}} className='body-test'>  
          <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none">  
            <circle cx="11.5" cy="11.5" r="11" stroke="white"/>  
            <path d="M7.64645 11.6464C7.45118 11.8417 7.45118 12.1583 7.64645 12.3536L10.8284 15.5355C11.0237 15.7308 11.3403 15.7308 11.5355 15.5355C11.7308 15.3403 11.7308 15.0237 11.5355 14.8284L8.70711 12L11.5355 9.17157C11.7308 8.97631 11.7308 8.65973 11.5355 8.46447C11.3403 8.2692 11.0237 8.2692 10.8284 8.46447L7.64645 11.6464ZM16 11.5L8 11.5V12.5L16 12.5V11.5Z" fill="white"/>  
          </svg>  
        </button> 
                <div className="header-profile">  
                    <div className='phead'>
        
                    <div className="line-profile">  
                        <div className='top-profile-left'>  
                            <div style={{ width: '60px', height: '60px' }}>  
                                <img src={getAvatarUrl(user)} alt="Профиль" />  
                            </div>  
                            {userData ? (  
                                <div>  
                                    <p>{userData.name}</p>  
                                    <p>{userData. birthDate}</p>  
                                </div>  
                            ) : (  
                                <p>Пользователь не найден</p>  
                            )}  
                        </div>  
                          {/**<div className='top-profile-right'>0,00</div>*/}
                          <div className="top-profile-right active">  
                            {paymentStatus === null ? (
                                <span>...</span>
                            ) : paymentStatus ? (
                                <span className='yesoplata'>Активный</span>
                            ) : (
                                <span onClick={() => startPayment(telegramId)} className='nooplata'>Неактивный</span>
                            )}
                        </div> 
                    </div>  
                    {userData && (  
                        <div className="profile-desk">  
                            <h4 style={{fontWeight: '200'}}>О вашем знаке: <span style={{textTransform: 'uppercase'}}>{zodiacSign || 'Не найден'}</span></h4>  
                            <div style={{ overflow: 'hidden', transition: 'max-height 0.5s ease', maxHeight: showFullDescription ? '500px' : '0', position: 'relative' }}>
                        <p style={{ margin: 0 }}>
                            {showFullDescription ? userData.zodiacDescription : truncateDescription(userData.zodiacDescription)}
                        </p>
                    </div>
                    <span 
                        onClick={() => setShowFullDescription(!showFullDescription)} 
                        style={{ cursor: 'pointer', right: '15px', position: 'absolute', bottom: '0' }}
                    >
                        <img 
                            src={showFullDescription ? "aru.png" : "ard.png"} 
                            alt="" 
                            style={{ width: '25px', borderRadius: '50%', background: '#322369', padding: '5px' }} 
                        />
                    </span>
                        </div>  
                    )}  


                    </div>
                    <div className="center-profile">  
                        <div className="profile-block">  
                            <p>Пройти тест на знак зодиака</p>  
                            {testCompleted ? (  
                                <p style={{ color:'#7da97d', fontSize: '1rem' }}>Тест выполнен!</p>  
                            ) : (  
                                <Link to="/test">  
                                    <button className='button na' style={{ position: 'absolute', margin: '2vh auto auto', display: 'block', left: 'unset', transform: 'none', padding: '6px 15px', bottom: '10px', transform: 'translateX(-50%)', left: '50%', width: '115px', fontSize: '15px' }}>  
                                        Летс гоу  
                                    </button>  
                                </Link>  
                            )}  
                        </div>  
                       {/**  <div className="profile-block">  
                            <p>Проходи ежедневные задания и получай приятные бонусы</p>  
                            <Link to="/zadaniya">  
                                <button className='button na' style={{ position: 'absolute', margin: '2vh auto auto', display: 'block', left: 'unset', transform: 'none', padding: '6px 15px', bottom: '0', transform: 'translateX(-50%)', left: '50%', width: '115px', fontSize: '15px' }}>  
                                    Летс гоу  
                                </button>  
                            </Link>  
                        </div>  */}
                    </div>  
                    <div className="bottom-profile"> 
                        <div>  
                            <Link to="/faq" style={{textDecoration: 'auto'}}>  
                                <p style={{ cursor: 'pointer' }}>Часто задаваемые вопросы</p>  
                            </Link>  
                        </div>
                        <div>  
                            <p onClick={handleInviteClick} style={{ cursor: 'pointer' }}>Пригласить друга</p>  
                            </div>  
                        <div>  
                             <p onClick={handleSupportClick} style={{ cursor: 'pointer' }}>Поддержка</p> {/* Кнопка открытия модалки */} 
                        </div>  
                        <div>  
                            <p onClick={handleDeleteProfile} style={{ cursor: 'pointer',color:'red'}}>  
                                Удалить профиль  
                            </p>  
                        </div>
                    </div>  
                </div>  
            </div>  

            {/* Модальное окно для поддержки */}
            {showSupportModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>Контакты поддержки</h2>
                        <p>Email: support@example.com</p>
                        <p>Телефон: +123456789</p>
                    </div>
                </div>
            )}

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
                    <img src="img/menu/profile.png" style={{ width: '13px' }} alt="Профиль" />  
                    <span style={{color:'white', opacity: '1'}}>Профиль</span>  
                </Link>  
            </div>  
        </div>  
    );  
};  

export default ProfilePage;  