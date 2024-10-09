const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Загружаем переменные окружения
dotenv.config();

const connectDB = async () => {
  try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB подключен.');
  } catch (error) {
      console.error('Ошибка подключения к MongoDB:', error.message);
      process.exit(1); // Завершаем процесс при ошибке
  }
};

module.exports = connectDB;
