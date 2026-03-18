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
        temperature: 0.7, // Slightly lower temperature for more predictable factual responses
        systemInstruction: `You are an expert Travel Assistant. Your job is to help users find ways to travel from their current location to a destination.
        
CRITICAL RULES:
1. You MUST ALWAYS know the user's starting point (origin). If the user asks "How do I get to Paris?" without stating where they are, you MUST ask "Where are you traveling from?" before providing any routing or recommendations.
2. Once you have both the origin and the destination, you MUST provide a structured response containing:
   - "Transportation Options": The Recommended transportation AND an Alternative option.
   - "Details": Estimated price, distance, and travel time.
   - "Local Recommendations": A recommended main course/food to eat at the destination.
   - "Surrounding Tourism": Nearby tourist spots or attractions.
3. Keep the formatting clean and easy to read using Markdown bullet points. Be enthusiastic but concise.
`
      }
    });

    res.json({ result: response.text });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: error.message || 'An error occurred while generating the response.' });
  }
});