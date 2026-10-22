import { GoogleGenAI } from '@google/genai';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get('/', (req,res)=>{res.send('AI Assistant is running!')})
app.post('/api/ai-assistant', async (req, res) => {
  try {
    const { mode, motorcycle, goal, notes, selectedParts } = req.body;

    let prompt = '';

    if (mode === 'recommendation') {
      prompt = `
        You are an expert motorcycle mechanic AI.
        Motorcycle: ${motorcycle}
        Rider Goal: ${goal}
        Additional Request Notes: ${notes || 'None'}

        Suggest 10 suitable parts or upgrades. Return JSON matching this structure:
        {
          "type": "recommendation",
          "suggestions": [
            {
              "name": "Part or Upgrade Name",
              "compatibility": 95,
              "safetyNote": "Safe - Explanation note"
            }
          ]
        }
      `;
    } else {
      prompt = `
        You are an expert motorcycle mechanic AI.
        Motorcycle: ${motorcycle}
        Selected Parts to Install: ${selectedParts.join(', ')}

        Evaluate this setup for safety and mechanical compatibility. Return JSON matching this structure:
        {
          "type": "evaluation",
          "status": "based on your analysis, the selected parts are compatible and safe to install.", 
          "compatibility": "based on your analysis",
          "recommendations": [
            "Recommendation or installation advice 1",
            "Recommendation or installation advice 2"
          ]
        }
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsedResult = JSON.parse(response.text);

   
    if (mode === 'evaluation') {
      parsedResult.selectedParts = selectedParts;
    }

    return res.status(200).json({
      success: true,
      result: parsedResult,
    });
  } catch (error) {
    console.error('AI Endpoint Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process AI analysis.',
    });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));