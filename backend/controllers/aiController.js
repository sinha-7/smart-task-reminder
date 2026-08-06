const env = require('../config/env');
const Task = require('../models/Task');

// Helper to call OpenRouter
const callOpenRouter = async (prompt, systemInstruction = "You are a helpful AI assistant.") => {
  if (!env.GEMINI_API_KEY) {
    throw new Error('AI service is not configured. Please set GEMINI_API_KEY.');
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.GEMINI_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.FRONTEND_URL || "http://localhost:5173",
      "X-Title": "Smart Task Reminder"
    },
    body: JSON.stringify({
      "model": "openrouter/free",
      "messages": [
        {"role": "system", "content": systemInstruction},
        {"role": "user", "content": prompt}
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
};

/**
 * @desc    AI suggests priority and category for a task
 * @route   POST /api/ai/suggest-priority
 */
const suggestPriority = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const prompt = `Based on the following task details, suggest:
1. Priority level: "low", "medium", or "high"
2. Category: one of "Work", "Personal", "Study", "Health", "Finance", "Shopping", "Travel", "General"
3. A brief reasoning (1 sentence)

Task Title: ${title}
${description ? `Task Description: ${description}` : ''}

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{"priority": "low|medium|high", "category": "CategoryName", "reasoning": "Brief explanation"}`;

    const responseText = await callOpenRouter(prompt, "You are a task management assistant.");
    
    let parsed;
    try {
      const jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = { priority: 'medium', category: 'General', reasoning: 'Could not parse AI response.' };
    }

    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(parsed.priority)) parsed.priority = 'medium';

    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('AI suggestion error:', error.message);
    res.status(500).json({
      success: false,
      message: `OpenRouter AI Error: ${error.message}`,
      data: { priority: 'medium', category: 'General', reasoning: 'AI service error. Defaults applied.' },
    });
  }
};

/**
 * @desc    AI parses natural language into task fields
 * @route   POST /api/ai/parse-task
 */
const parseTask = async (req, res, next) => {
  try {
    const { text } = req.body;
    
    // Get current date context for the AI
    const now = new Date();
    const dateContext = `Today is ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. The current time is ${now.toLocaleTimeString('en-US')}.`;

    const prompt = `${dateContext}
Parse the following natural language task into structured data.

User Input: "${text}"

Rules:
1. Extract the core task as the 'title'.
2. If a specific date/time is mentioned (like "tomorrow at 5pm"), calculate the exact ISO 8601 string for 'dueDate'. If no time is mentioned but a day is, default to 12:00 PM. If no date is mentioned, return null.
3. Determine 'priority' (low, medium, high).
4. Determine 'category' (Work, Personal, Study, Health, Finance, Shopping, Travel, General).
5. If they ask to be reminded, set 'reminderAt' to 15 minutes before the due date, or the exact time they specified. Otherwise null.

Respond ONLY with valid JSON (no markdown):
{
  "title": "String",
  "dueDate": "ISOString or null",
  "priority": "low|medium|high",
  "category": "CategoryName",
  "reminderAt": "ISOString or null"
}`;

    const responseText = await callOpenRouter(prompt, "You are a highly precise natural language parsing assistant.");
    
    let parsed;
    try {
      const jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      return res.status(400).json({ success: false, message: 'Could not parse task from input.' });
    }

    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('AI Parse error:', error.message);
    res.status(500).json({ success: false, message: `AI Error: ${error.message}` });
  }
};

/**
 * @desc    AI estimates times and builds a daily schedule from pending tasks
 * @route   GET /api/ai/daily-plan
 */
const dailyPlan = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user.id, completed: false })
      .select('title priority dueDate category')
      .sort({ dueDate: 1, createdAt: 1 })
      .limit(15);

    if (tasks.length === 0) {
      return res.json({ success: true, data: "You have no pending tasks! Enjoy your day! 🌞" });
    }

    const taskList = tasks.map(t => `- ${t.title} (Priority: ${t.priority}, Category: ${t.category})`).join('\n');

    const prompt = `Here are my pending tasks:
${taskList}

Act as an expert productivity coach.
1. Estimate a realistic duration for each task.
2. Group the tasks into a "Morning", "Afternoon", and "Evening" schedule, focusing on high priority tasks first.
3. Keep the tone highly energetic, encouraging, and use emojis!

Output a beautiful markdown format. Do not use code blocks around the entire response.`;

    const responseText = await callOpenRouter(prompt, "You are a highly energetic productivity coach.");
    res.json({ success: true, data: responseText });
  } catch (error) {
    console.error('AI Daily Plan error:', error.message);
    res.status(500).json({ success: false, message: `AI Error: ${error.message}` });
  }
};

/**
 * @desc    AI generates a weekly review of completed and pending tasks
 * @route   GET /api/ai/weekly-review
 */
const weeklyReview = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const tasks = await Task.find({ 
      userId: req.user.id,
      updatedAt: { $gte: sevenDaysAgo }
    }).select('title completed category priority updatedAt');

    const completed = tasks.filter(t => t.completed);
    const pending = tasks.filter(t => !t.completed);

    const completedList = completed.map(t => `- ${t.title} (${t.category})`).join('\n') || 'None';
    const pendingList = pending.map(t => `- ${t.title} (${t.category}, ${t.priority})`).join('\n') || 'None';

    const prompt = `Here is my task activity for the last 7 days:

COMPLETED TASKS (${completed.length}):
${completedList}

PENDING TASKS (${pending.length}):
${pendingList}

Act as an expert productivity coach. Write a 2-3 paragraph weekly review for me.
1. Start by celebrating my wins and noting any trends (e.g., "You crushed a lot of work tasks!").
2. Gently encourage me about the pending tasks.
3. Suggest a single focus or goal for next week based on what I left undone.
4. Keep the tone highly energetic, encouraging, and use emojis!

Output a beautiful markdown format. Do not use code blocks around the entire response.`;

    const responseText = await callOpenRouter(prompt, "You are a highly energetic productivity coach.");
    res.json({ success: true, data: responseText });
  } catch (error) {
    console.error('AI Weekly Review error:', error.message);
    res.status(500).json({ success: false, message: `AI Error: ${error.message}` });
  }
};

module.exports = { suggestPriority, parseTask, dailyPlan, weeklyReview };
