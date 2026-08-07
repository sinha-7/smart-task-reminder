const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const env = require('./env');

const initFirebase = () => {
  try {
    const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('🔥 Firebase Admin SDK initialized successfully.');
    } else {
      console.warn('⚠️ Firebase Service Account key not found. Push notifications disabled.');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  }
};

const sendPushNotification = async (tokens, title, body, data = {}) => {
  if (!admin.apps.length || !tokens || tokens.length === 0) return false;
  
  const message = {
    notification: {
      title,
      body
    },
    data,
    tokens // Multicast message
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
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
  admin
};
