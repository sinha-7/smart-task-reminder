import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import api from '../api/axios';

export const registerPushNotifications = async () => {
  if (Capacitor.getPlatform() !== 'android' && Capacitor.getPlatform() !== 'ios') {
    console.log('Push notifications are only supported on native mobile platforms.');
    return;
  }

  try {
    // Request permission to use push notifications
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('User denied push notification permission');
      return;
    }

    // Register with Apple/Google to receive token
    await PushNotifications.register();

    // Register event listeners
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);
      try {
        // Send token to our backend to associate with the current user
        await api.post('/auth/fcm-token', { token: token.value });
        console.log('FCM token saved to backend successfully.');
      } catch (err) {
        console.error('Failed to save FCM token to backend:', err);
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on push registration: ', JSON.stringify(error));
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received: ', JSON.stringify(notification));
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ', JSON.stringify(notification));
    });

  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
};
