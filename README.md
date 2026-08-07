# Smart Tasks — AI-Powered Task Management

A modern, cross-platform task management application with AI-powered suggestions, email reminders, and native Android push notifications. Built with React, Node.js, MongoDB, and Capacitor.

## ✨ Features

- **Cross-Platform**: Seamless experience on Web (Responsive) and Native Android (APK).
- **AI Task Suggestions**: Automatically suggest the best priority and category for a task based on its title and description using Google's Gemini AI.
- **Smart Reminders**: Receive timely notifications for your tasks.
  - 📧 **Email Reminders**: Delivered directly to your inbox via EmailJS.
  - 📱 **Push Notifications**: Native background push notifications on Android via Firebase Cloud Messaging.
- **Secure Authentication**: JWT-based authentication with refresh tokens, plus a secure "Forgot Password" OTP flow.
- **Modern UI**: Sleek, dark-mode, glassmorphism design with responsive components and smooth animations.

## 🛠️ Technology Stack

**Frontend (Web & Mobile)**
- React 18 + Vite
- Tailwind CSS (Glassmorphism design)
- Axios (API integration)
- Capacitor (Native Android compilation & Push Notifications)

**Backend**
- Node.js & Express.js
- MongoDB & Mongoose
- Firebase Admin SDK (FCM Push Notifications)
- EmailJS (Email delivery)
- Google Generative AI (Gemini)

## 🚀 Environment Variables

Create a `.env` file in the **backend** directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_PRIVATE_KEY=your_emailjs_private_key
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGINS=http://localhost:5173,capacitor://localhost
FIREBASE_SERVICE_ACCOUNT={"type":"service_account", ... } # Stringified JSON
```

Create a `.env` file in the **web** directory:
```env
VITE_API_URL=http://localhost:5000/api
```

## 💻 Local Development Setup

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend server will start on `http://localhost:5000`. A background cron job will automatically run every minute to process due reminders.

### 2. Frontend Web Setup
```bash
cd web
npm install
npm run dev
```
The web application will be accessible at `http://localhost:5173`.

### 3. Android Mobile Setup (Capacitor)
Ensure you have Android Studio installed and configured.
```bash
cd web
npm run build
npx cap sync android
npx cap open android
```
From Android Studio, you can run the app on a physical device or emulator. *Note: Push notifications require a physical device or an emulator with Google Play Services.*

## 📱 Firebase Push Notifications

To enable push notifications on Android:
1. Create a Firebase Project and enable the **Firebase Cloud Messaging API**.
2. Add an Android app to the Firebase project with the package name `com.smarttasks.app`.
3. Download the `google-services.json` file and place it in `web/android/app/`.
4. Generate a Service Account Key from Firebase and stringify it into the `FIREBASE_SERVICE_ACCOUNT` backend environment variable.

## ⚙️ Automated CI/CD
This repository includes a GitHub Actions workflow (`.github/workflows/android-build.yml`) that automatically builds a new debug Android APK on every push to the `main` branch. You can download the generated APK from the "Actions" tab.
