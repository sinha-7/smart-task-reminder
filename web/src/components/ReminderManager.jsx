import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function ReminderManager() {
  const scheduledTimeouts = useRef(new Set());
  const notifiedTasks = useRef(new Set());

  useEffect(() => {
    // Request permission for native OS notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkReminders = async () => {
      try {
        // Fetch pending tasks to see if any have upcoming reminders
        const res = await api.get('/tasks', {
          params: { completed: 'false', limit: 100 } // Fetch up to 100 pending tasks
        });
        
        const tasks = res.data.data.tasks;
        const now = new Date().getTime();

        tasks.forEach(task => {
          if (!task.reminderAt) return;
          
          const reminderTime = new Date(task.reminderAt).getTime();
          const timeUntilReminder = reminderTime - now;

          // If the reminder is in the future but within the next 24 hours, schedule it
          if (timeUntilReminder > 0 && timeUntilReminder < 86400000) {
            if (!scheduledTimeouts.current.has(task._id)) {
              scheduledTimeouts.current.add(task._id);
              
              setTimeout(() => {
                triggerNotification(task);
                scheduledTimeouts.current.delete(task._id);
              }, timeUntilReminder);
            }
          } 
          // If the reminder just passed recently (within last 5 minutes) and we haven't notified yet in this session
          else if (timeUntilReminder <= 0 && timeUntilReminder > -300000) {
            if (!notifiedTasks.current.has(task._id)) {
              triggerNotification(task);
            }
          }
        });
      } catch (err) {
        console.error('Failed to check in-app reminders:', err);
      }
    };

    const triggerNotification = (task) => {
      // Ensure we don't notify twice for the same task in one session
      if (notifiedTasks.current.has(task._id)) return;
      notifiedTasks.current.add(task._id);

      // 1. In-App Toast Notification
      toast(`⏰ Reminder: ${task.title}`, {
        duration: 8000,
        style: {
          borderRadius: '10px',
          background: '#1e1b4b',
          color: '#fff',
          border: '1px solid #4f46e5',
        },
      });

      // 2. Native OS Push Notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Smart Task Reminder', {
          body: task.title,
          icon: '/favicon.ico'
        });
      }
    };

    // Check immediately, then every 5 minutes to pick up newly created tasks
    checkReminders();
    const interval = setInterval(checkReminders, 300000);

    return () => clearInterval(interval);
  }, []);

  return null; // Invisible background component
}
