const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const fs = require('fs');
const path = require('path');
const env = require('./env');

const initFirebase = () => {
  try {
    if (getApps().length > 0) return; // Prevent duplicate init

    const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log('🔥 Firebase Admin SDK initialized from file.');
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log('🔥 Firebase Admin SDK initialized from environment variable.');
    } else {
      console.warn('⚠️ Firebase Service Account key not found. Push notifications disabled.');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  }
};

const sendPushNotification = async (tokens, title, body, data = {}) => {
  if (getApps().length === 0 || !tokens || tokens.length === 0) return false;
  
  const message = {
    notification: {
      title,
      body
    },
    data,
    tokens // Multicast message
  };

  try {
    const response = await getMessaging().sendEachForMulticast(message);
    if (response.failureCount > 0) {
      console.warn(`⚠️ Firebase Push: ${response.failureCount} messages failed to send.`);
    }
    return true;
  } catch (error) {
    console.error('❌ Error sending Firebase push notification:', error);
    return false;
  }
};

module.exports = {
  initFirebase,
  sendPushNotification,
};
