import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai/node';

const app = express();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post('/api/chat', async (req, res) => {
  const { conversation } = req.body;
  try {
    if (!conversation || !Array.isArray(conversation)) {
      throw new Error('Invalid conversation format. Expected an array of messages.');
    }

    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }]
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 0.9,
        systemInstruction: 'You are a helpful assistant that provides concise and accurate answers to user queries.'
      }
    });
    res.json({ result: response.text });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: error.message || 'An error occurred while generating the response.' });
  }
});