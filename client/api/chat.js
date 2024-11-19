// pages/api/chat.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { message } = req.body;

    // Логика для обращения к OpenAI API
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer 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`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message }],
        }),
      });

      const data = await response.json();
      res.status(200).json({ reply: data.choices[0].message.content });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при обращении к OpenAI API' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
