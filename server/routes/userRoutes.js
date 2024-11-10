const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Проверка, зарегистрирован ли пользователь по telegramId
router.get('/:telegramId', async (req, res) => {
  const { telegramId } = req.params;

  try {
    const user = await User.findOne({ telegramId });
    if (user) {
      return res.status(200).json({ exists: true, user });
    }
    res.status(200).json({ exists: false });
  } catch (error) {
    console.error('Ошибка при проверке пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});


// Создание нового пользователя
router.post('/', async (req, res) => {
  const { telegramId, name, birthDate, birthTime, birthPlace, zodiacSign } = req.body;
  console.log('Полученные данные:', req.body);

  if (!telegramId || !name || !birthDate || !birthTime || !birthPlace || !zodiacSign) {
    return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
  }

  try {
    let user = await User.findOne({ telegramId });

    if (user) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    user = new User({
      telegramId,
      name,
      birthDate,
      birthTime,
      birthPlace,
      zodiacSign,
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Ошибка при сохранении пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
