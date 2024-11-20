const express = require('express');  
const TestResult = require('../models/TestResult');  
const router = express.Router();  

router.post('/', async (req, res) => {  
    const { userId, answers, dateCompleted } = req.body;  
  
    const newTestResult = new TestResult({  
        userId,  
        answers,  
        dateCompleted,  
    });  
  
    try {  
        await newTestResult.save();  
        res.status(201).json({ message: 'Результаты теста успешно сохранены' });  
    } catch (error) {  
        console.error('Ошибка при сохранении результатов теста:', error);  
        res.status(500).json({ message: 'Ошибка сервера' });  
    }  
  });  
  
  module.exports = router;  

  router.get('/:telegramId', async (req, res) => {  
    try {  
        const results = await TestResult.find({ userId: req.params.userId });  
        res.json(results);  
    } catch (error) {  
        console.error('Ошибка при получении результатов теста:', error);  
        res.status(500).json({ message: 'Ошибка сервера' });  
    }  
});  