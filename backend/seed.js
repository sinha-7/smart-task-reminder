/**
 * Seed script to populate the database with demo data.
 * Run: node seed.js
 */
const mongoose = require('mongoose');
const env = require('./config/env');
const User = require('./models/User');
const Task = require('./models/Task');

const seedData = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create demo users
    const users = await User.create([
      { name: 'Alice Johnson', email: 'alice@example.com', password: 'password123' },
      { name: 'Bob Smith', email: 'bob@example.com', password: 'password123' },
    ]);

    console.log(`👤 Created ${users.length} demo users`);

    const now = new Date();
    const daysFromNow = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const hoursFromNow = (hours) => new Date(now.getTime() + hours * 60 * 60 * 1000);

    // Create demo tasks for Alice
    const aliceTasks = [
      {
        title: 'Prepare quarterly report',
        description: 'Compile Q3 sales data and create presentation slides for the board meeting',
        dueDate: daysFromNow(3),
        priority: 'high',
        category: 'Work',
        reminderAt: daysFromNow(2),
        userId: users[0]._id,
      },
      {
        title: 'Review pull requests',
        description: 'Review open PRs on the main repo and provide feedback',
        dueDate: daysFromNow(1),
        priority: 'medium',
        category: 'Work',
        userId: users[0]._id,
      },
      {
        title: 'Grocery shopping',
        description: 'Buy vegetables, fruits, milk, and bread for the week',
        dueDate: daysFromNow(0),
        priority: 'low',
        category: 'Personal',
        userId: users[0]._id,
      },
      {
        title: 'Study machine learning chapter 5',
        description: 'Read through neural networks fundamentals and complete exercises',
        dueDate: daysFromNow(5),
        priority: 'medium',
        category: 'Study',
        reminderAt: daysFromNow(4),
        userId: users[0]._id,
      },
      {
        title: 'Dentist appointment',
        description: 'Regular checkup at Dr. Smith, 2:30 PM',
        dueDate: daysFromNow(7),
        priority: 'medium',
        category: 'Health',
        reminderAt: daysFromNow(6),
        userId: users[0]._id,
      },
      {
        title: 'Pay electricity bill',
        description: 'Due by end of month, check online portal',
        dueDate: daysFromNow(10),
        priority: 'high',
        category: 'Finance',
        userId: users[0]._id,
      },
      {
        title: 'Call mom',
        description: "It's been a while, catch up on the weekend",
        dueDate: daysFromNow(2),
        priority: 'low',
        category: 'Personal',
        userId: users[0]._id,
      },
      {
        title: 'Deploy v2.0 to staging',
        description: 'Run integration tests, deploy to staging environment, and verify',
        dueDate: daysFromNow(1),
        priority: 'high',
        category: 'Work',
        reminderAt: hoursFromNow(2),
        userId: users[0]._id,
      },
      {
        title: 'Read "Atomic Habits"',
        description: 'Finish chapters 7-10',
        dueDate: daysFromNow(14),
        priority: 'low',
        category: 'Personal',
        completed: true,
        userId: users[0]._id,
      },
      {
        title: 'Renew gym membership',
        description: 'Annual membership expires this month',
        dueDate: daysFromNow(5),
        priority: 'medium',
        category: 'Health',
        completed: true,
        userId: users[0]._id,
      },
    ];

    // Create demo tasks for Bob
    const bobTasks = [
      {
        title: 'Design new landing page',
        description: 'Create mockups for the product launch page using Figma',
        dueDate: daysFromNow(4),
        priority: 'high',
        category: 'Work',
        userId: users[1]._id,
      },
      {
        title: 'Book flight to NYC',
        description: 'Conference on the 15th, find flights and hotel',
        dueDate: daysFromNow(6),
        priority: 'medium',
        category: 'Travel',
        reminderAt: daysFromNow(5),
        userId: users[1]._id,
      },
      {
        title: 'Update portfolio website',
        description: 'Add recent projects and update skills section',
        dueDate: daysFromNow(8),
        priority: 'low',
        category: 'Personal',
        userId: users[1]._id,
      },
      {
        title: 'Complete React Native course',
        description: 'Finish modules 8-12 on Udemy',
        dueDate: daysFromNow(10),
        priority: 'medium',
        category: 'Study',
        userId: users[1]._id,
      },
      {
        title: 'Team standup notes',
        description: 'Summarize sprint progress for weekly email',
        dueDate: daysFromNow(0),
        priority: 'medium',
        category: 'Work',
        completed: true,
        userId: users[1]._id,
      },
    ];

    const tasks = await Task.create([...aliceTasks, ...bobTasks]);
    console.log(`📋 Created ${tasks.length} demo tasks`);

    console.log('\n✅ Seed complete!');
    console.log('   Demo accounts:');
    console.log('   📧 alice@example.com / password123');
    console.log('   📧 bob@example.com   / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedData();
