import { GoogleGenAI } from '@google/genai';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get('/', (req, res) => { res.send('AI Assistant is running!') })
app.post('/api/ai-assistant', async (req, res) => {
  try {
    const { mode, motorcycle, goal, notes, selectedParts } = req.body;

    let prompt = '';

    if (mode === 'recommendation') {
      prompt = `
    You are an elite Master Motorcycle Mechanic and Performance Tuning Engineer with over 20 years of hands-on experience in motorcycle diagnostics, engine block modifications, CVT setup, electrical systems, and safety engineering.

    Target Vehicle: ${motorcycle}
    Rider Goal/Setup: ${goal}
    Additional Request Notes: ${notes || 'None'}

    Your Task:
    Recommend exactly 10 highly accurate, realistic, and optimized parts or upgrades specifically tailored for the target motorcycle and rider goal.

    Strict Evaluation Criteria:
    1. Compatibility Score (0 - 100):
       - Calculate exact mechanical fitment based on OEM specs, engine displacement tolerances, electrical load, and frame geometry.
       - 90-100: Direct bolt-on / plug-and-play fitment with zero major modifications.
       - 70-89: Highly compatible, but requires proper mechanic tuning (e.g., roller weight matching, ECU remapping, re-jetting, or belt clearance adjustments).
       - Below 70: Requires minor custom fabrication or supporting upgrades to function safely.

    2. Precise Safety Note (safetyNote):
       - State clearly if it is Safe, Requires Caution, or High Stress.
       - Provide actionable technical insight (e.g., heat limits, complementary mods like clutch springs or fuel ratio adjustments, installation hazards, or structural impact).

    Output Constraint:
    Return ONLY a valid raw JSON object matching this exact schema:
    {
      "type": "recommendation",
      "suggestions": [
        {
          "name": "Specific Part Name & Spec",
          "compatibility": 95,
          "safetyNote": "Technical classification - Concrete mechanical advice and installation warning"
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
      model: 'gemini-3.8-flash',
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