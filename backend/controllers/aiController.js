const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

/** @type {import('@google/generative-ai').GoogleGenerativeAI | null} */
let genAI = null;

const getGenAI = () => {
  if (!env.GEMINI_API_KEY) return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * @desc    AI suggests priority and category for a task
 * @route   POST /api/ai/suggest-priority
 * @access  Private
 */
const suggestPriority = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please set GEMINI_API_KEY.',
      });
    }

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a task management assistant. Based on the following task details, suggest:
1. Priority level: "low", "medium", or "high"
2. Category: one of "Work", "Personal", "Study", "Health", "Finance", "Shopping", "Travel", "General"
3. A brief reasoning (1 sentence)

Task Title: ${title}
${description ? `Task Description: ${description}` : ''}

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{"priority": "low|medium|high", "category": "CategoryName", "reasoning": "Brief explanation"}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Parse the JSON response — handle potential markdown wrapping
    let parsed;
    try {
      const jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      // Fallback if AI returns malformed JSON
      parsed = {
        priority: 'medium',
        category: 'General',
        reasoning: 'Could not parse AI response. Using defaults.',
      };
    }

    // Validate parsed values
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(parsed.priority)) {
      parsed.priority = 'medium';
    }

    res.json({
      success: true,
      data: {
        priority: parsed.priority,
        category: parsed.category || 'General',
        reasoning: parsed.reasoning || '',
      },
    });
  } catch (error) {
    // Don't let AI errors crash the app — return a graceful fallback
    console.error('AI suggestion error:', error.message);
    res.status(500).json({
      success: false,
      message: `Google AI Error: ${error.message}`,
      data: {
        priority: 'medium',
        category: 'General',
        reasoning: 'AI service error. Defaults applied.',
      },
    });
  }
};

module.exports = { suggestPriority };
