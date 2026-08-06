const env = require('../config/env');

/**
 * @desc    AI suggests priority and category for a task (via OpenRouter Free Gemini)
 * @route   POST /api/ai/suggest-priority
 * @access  Private
 */
const suggestPriority = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please set GEMINI_API_KEY.',
      });
    }

    const prompt = `You are a task management assistant. Based on the following task details, suggest:
1. Priority level: "low", "medium", or "high"
2. Category: one of "Work", "Personal", "Study", "Health", "Finance", "Shopping", "Travel", "General"
3. A brief reasoning (1 sentence)

Task Title: ${title}
${description ? `Task Description: ${description}` : ''}

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{"priority": "low|medium|high", "category": "CategoryName", "reasoning": "Brief explanation"}`;

    // Fetch from OpenRouter's free tier
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.GEMINI_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": env.FRONTEND_URL || "http://localhost:5173", // Optional but recommended by OpenRouter
        "X-Title": "Smart Task Reminder" // Optional but recommended
      },
      body: JSON.stringify({
        "model": "openrouter/free",
        "messages": [
          {"role": "user", "content": prompt}
        ]
      })
    });

    if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content.trim();

    // Parse the JSON response
    let parsed;
    try {
      const jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
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
    console.error('AI suggestion error:', error.message);
    res.status(500).json({
      success: false,
      message: `OpenRouter AI Error: ${error.message}`,
      data: {
        priority: 'medium',
        category: 'General',
        reasoning: 'AI service error. Defaults applied.',
      },
    });
  }
};

module.exports = { suggestPriority };
