const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/', async (req, res) => {
  const { telegramId, name, birthDate, birthTime, birthPlace, zodiacSign } = req.body;

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