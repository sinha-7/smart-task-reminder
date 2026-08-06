require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `You are a task management assistant. Based on the following task details, suggest:
1. Priority level: "low", "medium", or "high"
2. Category: one of "Work", "Personal", "Study", "Health", "Finance", "Shopping", "Travel", "General"
3. A brief reasoning (1 sentence)

Task Title: test title
Task Description: test description

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{"priority": "low|medium|high", "category": "CategoryName", "reasoning": "Brief explanation"}`;

    const result = await model.generateContent(prompt);
    console.log('Result:', result.response.text());
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
