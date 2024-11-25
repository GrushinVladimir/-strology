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

    const fetchUserData = async () => {  
        try {  
            const response = await axios.get(`/api/users/${telegramId}`);  
            if (response.data && response.data.user) {  
                setUserData(response.data.user);  
                setZodiacSign(response.data.user.zodiacSign);  
            } else {  
                setError('Данные пользователя не найдены');  
            }  
        } catch (err) {  
            setError('Ошибка при получении данных пользователя');  
        } finally {  
            fetchTestResults();  
        }  
    };  

    const fetchTestResults = async () => {  
        try {  
            const response = await axios.get(`/api/test-results/${telegramId}`);  
            setTestCompleted(response.data && response.data.length > 0);  
        } catch (err) {  
            setTestCompleted(false);  
        } finally {  
            setLoading(false); // Mark loading as finished here  
        }  
    };  

    useEffect(() => {  
        if (!telegramId) return;  
        fetchUserData(); // Initiate fetching user data  
    }, [telegramId]);  

    const getAvatarUrl = (user) => {  
        return user && user.photo_url ? user.photo_url : 'https://via.placeholder.com/100';  
    };  

    if (loading) return <p>Загрузка...</p>; // Display loading indicator  
    if (error) return <p>{error}</p>; // Display error message  

    const handleInviteClick = () => {
        const inviteLink = 'https://t.me/mygoroskopbot_lite_new_bot'; // Ссылка на ваш бот в Telegram
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=Пригласите своего друга в наше астрологическое приложение!`;

        // Открываем ссылку для обмена
        window.open(shareUrl, '_blank');
    };

    const handleSupportClick = () => {
        setShowSupportModal(true); // Показываем модальное окно
    };

    const closeModal = () => {
        setShowSupportModal(false); // Закрываем модальное окно
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
    const startPayment = async (telegramId) => {  
        const invoiceData = {  
            chatId: telegramId // Передаем только идентификатор чата  
        };  
    
        try {  
            console.log('Invoice Data перед отправкой:', JSON.stringify(invoiceData, null, 2)); // Логирование для отладки  
            const response = await fetch('/api/stripe', {   
                method: 'POST',  
                headers: {  
                    'Content-Type': 'application/json',  
                },  
                body: JSON.stringify(invoiceData),  
            });  
    
            if (!response.ok) {  
                const errorText = await response.text();  
                throw new Error(`Ошибка при отправке инвойса: ${response.status} ${errorText}`);  
            }  
    
            const data = await response.json();  
            console.log('Инвойс отправлен!', data);  
            alert('Инвойс успешно отправлен в чат Telegram!');  
        } catch (error) {  
            console.error('Ошибка:', error);  
            alert(`Произошла ошибка: ${error.message}`);  
        }  
    };  
    return (  
        <div className='Prof'>  
            <div className='body-profile'>  
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer'}}>  
                    {/* SVG for back button */}  
                </button>  
                <div className="header-profile">  
                    <div className="line-profile">  
                        <div className='top-profile-left'>  
                            <div style={{ width: '60px', height: '60px' }}>  
                                <img src={getAvatarUrl(user)} alt="Профиль" />  
                            </div>  
                            {userData ? (  
                                <div>  
                                    <p>{userData.name}</p>  
                                </div>  
                            ) : (  
                                <p>Пользователь не найден</p>  
                            )}  
                        </div>  
                        <div className='top-profile-right'>0,00</div>
                        <div className="top-profile-right active"  onClick={() => startPayment(telegramId)}>Оплатить </div>   
                    </div>  
                    {userData && (  
                        <div className="profile-desk">  
                            <h4 style={{fontWeight: '200'}}>О вашем знаке: {zodiacSign || 'Не найден'}</h4>  
                            <p>{userData.zodiacDescription}</p>  
                        </div>  
                    )}  
                    <div className="center-profile">  
                        <div className="profile-block">  
                            <p>Пройти тест на знак зодиака</p>  
                            {testCompleted ? (  
                                <p style={{ color: 'green' }}>Тест выполнен!</p>  
                            ) : (  
                                <Link to="/test">  
                                    <button className='button na' style={{ position: 'absolute', margin: '2vh auto auto', display: 'block', left: 'unset', transform: 'none', padding: '6px 15px', bottom: '0', transform: 'translateX(-50%)', left: '50%', width: '115px', fontSize: '15px' }}>  
                                        Летс гоу  
                                    </button>  
                                </Link>  
                            )}  
                        </div>  
                        <div className="profile-block">  
                            <p>Проходи ежедневные задания и получай приятные бонусы</p>  
                            <Link to="/zadaniya">  
                                <button className='button na' style={{ position: 'absolute', margin: '2vh auto auto', display: 'block', left: 'unset', transform: 'none', padding: '6px 15px', bottom: '0', transform: 'translateX(-50%)', left: '50%', width: '115px', fontSize: '15px' }}>  
                                    Летс гоу  
                                </button>  
                            </Link>  
                        </div>  
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
                    <span>Профиль</span>  
                </Link>  
            </div>  
        </div>  
    );  
};  

export default ProfilePage;  