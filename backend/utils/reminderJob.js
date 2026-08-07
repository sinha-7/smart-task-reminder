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

      let processedCount = 0;
      while (processedCount < 50) { // Limit batch size to avoid long runs
        // Atomically find ONE task and mark it as sent so no other instance (e.g. dev server) grabs it
        const task = await Task.findOneAndUpdate(
          {
            reminderAt: { $lte: now },
            reminderSent: false,
            completed: false,
          },
          { $set: { reminderSent: true } },
          { new: true }
        );

        if (!task) break; // No more tasks to process

        processedCount++;
        
        try {
          // Get the user's email
          const user = await User.findById(task.userId);
          if (!user) {
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
        } catch (emailError) {
          console.error(`❌ Failed to send reminder for task ${task._id}: ${emailError.message}`);
        }
      }
      
      if (processedCount > 0) {
        console.log(`⏰ Processed ${processedCount} reminder(s).`);
      }
    } catch (error) {
      console.error(`❌ Reminder job error: ${error.message}`);
    }
  });

  console.log('⏰ Reminder cron job started (runs every minute)');
};

module.exports = startReminderJob;
