const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendEmail } = require('./sendEmail');

/**
 * Start the reminder cron job.
 * Runs every minute, checks for tasks with reminderAt <= now that
 * haven't been notified yet, sends email reminders, and marks them as sent.
 */
const startReminderJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // Find tasks due for reminder
      const tasks = await Task.find({
        reminderAt: { $lte: now },
        reminderSent: false,
        completed: false,
      }).limit(50); // Process in batches to avoid overload

      if (tasks.length === 0) return;

      console.log(`⏰ Processing ${tasks.length} reminder(s)...`);

      for (const task of tasks) {
        try {
          // Get the user's email
          const user = await User.findById(task.userId);
          if (!user) {
            // Mark as sent to avoid infinite retries for deleted users
            task.reminderSent = true;
            await task.save();
            continue;
          }

          // Build the reminder email
          const dueDateStr = task.dueDate
            ? new Date(task.dueDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'No due date';

          await sendEmail({
            to: user.email,
            subject: `⏰ Reminder: ${task.title}`,
            html: `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Task Reminder</h1>
                </div>
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
                  <h2 style="color: #333; margin-top: 0;">${task.title}</h2>
                  ${task.description ? `<p style="color: #666;">${task.description}</p>` : ''}
                  <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 5px 0;"><strong>📅 Due:</strong> ${dueDateStr}</p>
                    <p style="margin: 5px 0;"><strong>🏷️ Priority:</strong> ${task.priority}</p>
                    <p style="margin: 5px 0;"><strong>📂 Category:</strong> ${task.category}</p>
                  </div>
                  <p style="color: #999; font-size: 12px; margin-top: 20px;">
                    This is an automated reminder from Smart Tasks.
                  </p>
                </div>
              </div>
            `,
          });

          // Mark as notified
          task.reminderSent = true;
          await task.save();
        } catch (emailError) {
          console.error(
            `❌ Failed to send reminder for task ${task._id}: ${emailError.message}`
          );
          // Mark as sent anyway so it doesn't infinitely loop and block other tasks
          task.reminderSent = true;
          await task.save();
        }
      }
    } catch (error) {
      console.error(`❌ Reminder job error: ${error.message}`);
    }
  });

  console.log('⏰ Reminder cron job started (runs every minute)');
};

module.exports = startReminderJob;
