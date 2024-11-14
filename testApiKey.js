const axios = require('axios');

const testApiKey = async () => {
  try {
    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer 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`,
      },
    });
    console.log('API Key работает. Список доступных моделей:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Ошибка:', error.response.status, error.response.data);
    } else {
      console.log('Не удалось выполнить запрос:', error.message);
    }
  }
};

testApiKey();