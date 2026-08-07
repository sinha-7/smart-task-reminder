# Smart Task Reminder — Developer & Architecture Guide

This document outlines the complete technology stack, system architecture, and core workflows used to develop and maintain the Smart Task Reminder application.

---

## 🏗️ 1. Complete Technology Stack

### Frontend & Mobile (Client Layer)
- **Vite**: Ultra-fast frontend build tool and development server.
- **React (v18)**: Core UI library for building the web application.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development and styling (including Glassmorphism).
- **Axios**: HTTP client for making API requests to the Node.js backend.
- **Capacitor (v6)**: Cross-platform runtime that wraps the React web app into a native Android APK and provides access to native device features (Push Notifications).
- **@capacitor/push-notifications**: Capacitor plugin to handle native Android Firebase Cloud Messaging.

### Backend (API & Business Logic Layer)
- **Node.js**: JavaScript runtime environment for the server.
- **Express.js**: Fast, unopinionated web framework for Node.js used to build the REST API.
- **Mongoose**: Elegant MongoDB object modeling for Node.js.
- **JSON Web Tokens (JWT)**: Used for secure, stateless user authentication (Access & Refresh tokens).
- **Bcrypt.js**: Cryptographic library used for securely hashing user passwords before storing them.
- **Express Rate Limit**: Middleware to protect the API from brute-force attacks and DDOS.
- **Helmet**: Secures Express apps by setting various HTTP headers.
- **Morgan**: HTTP request logger middleware.

### Cloud Services & Integrations
- **MongoDB Atlas**: Fully managed cloud database for storing users, tasks, and tokens.
- **Firebase Admin SDK**: Server-side SDK used to securely dispatch push notifications to registered Android devices via Google's infrastructure.
- **EmailJS**: Cloud service used to dispatch transactional emails (e.g., OTP for password resets) without needing a dedicated SMTP server.
- **Google Generative AI (Gemini)**: Powerful LLM integration used to automatically analyze task titles and suggest appropriate categories and priority levels.
- **Render / Vercel**: Hosting platforms for the Backend Node.js server and Frontend Web application, respectively.

### CI/CD & DevOps
- **GitHub Actions**: CI/CD pipeline configured to automatically compile the React app and build a native Android APK using Gradle on every push to the `main` branch.
- **Gradle**: Build automation tool used under the hood by Capacitor/Android Studio to compile the Java/Kotlin Android code into an APK.

---

## 🔄 2. Core Workflows

### 🔐 A. Authentication & Session Workflow
1. **Signup**: User enters details -> Backend hashes password using `bcrypt` -> Stores in MongoDB -> Returns JWT Access & Refresh tokens.
2. **Login**: User enters credentials -> Backend verifies hash -> Returns fresh JWTs.
3. **Session Management**: 
   - `accessToken` (Short-lived, e.g., 1 hour) is attached to the `Authorization` header of every Axios request via an interceptor.
   - `refreshToken` (Long-lived, e.g., 7 days) is stored in local storage and used to silently request a new `accessToken` when it expires.
4. **Password Reset (OTP)**: 
   - User requests reset -> Backend generates a 6-digit OTP -> Hashes OTP and stores in DB with 10-min expiry.
   - Backend calls EmailJS to send the plaintext OTP to the user.
   - User submits OTP + new password -> Backend hashes submitted OTP and compares -> Updates password.

### 🔔 B. Push Notification Workflow (Android)
1. **Device Registration**:
   - Upon login on an Android device, the app requests notification permissions via Capacitor.
   - The device contacts Google Play Services to generate a unique Firebase Cloud Messaging (FCM) token.
   - The Android app sends this FCM token to the backend (`/api/auth/fcm-token`).
   - The backend stores the token in the `User` document in MongoDB.
2. **Task Creation**:
   - User creates a task with a `dueDate` and `reminderAt` (converted to UTC before saving).
3. **Cron Job Dispatch**:
   - A `node-cron` job runs every minute on the Node.js server.
   - It queries MongoDB for tasks where `reminderAt` matches the current minute and `notified` is `false`.
   - For each due task, the backend queries the `User` to get their FCM tokens.
   - The backend uses the `firebase-admin` SDK to multicast a push notification payload to Google's servers.
   - Google pushes the notification directly to the user's phone, which wakes up the app (or displays a lock screen banner) via Capacitor.

### 🤖 C. AI Task Suggestion Workflow
1. **Trigger**: User types a task title (e.g., "Buy groceries") and clicks "✨ Get AI Suggestion".
2. **API Call**: Frontend sends the title/description to the backend (`/api/ai/suggest`).
3. **Prompt Construction**: Backend constructs a strict prompt asking for a JSON response containing a `priority` (low/medium/high) and `category`, along with reasoning.
4. **Gemini Processing**: Backend calls the Google Generative AI API using the `GEMINI_API_KEY`.
5. **Response Parsing**: Backend parses the LLM's text output into a valid JSON object and returns it to the frontend.
6. **Application**: Frontend displays the suggestion. If the user accepts, it automatically updates the form state.

### ⚙️ D. Continuous Integration Workflow (CI/CD)
1. **Trigger**: Developer pushes code to the `main` branch on GitHub.
2. **GitHub Actions Runner**: A fresh Ubuntu runner spins up.
3. **Web Build**: The runner installs Node.js, runs `npm install` in the `web/` directory, and compiles the Vite React app (`npm run build`).
4. **Capacitor Sync**: `npx cap sync android` copies the compiled web assets into the Android native project folder (`web/android/`).
5. **APK Compilation**: The runner installs Java 17 and executes the Gradle wrapper (`./gradlew assembleDebug`) to compile the native Android wrapper and Web assets into an `.apk` file.
6. **Artifact Upload**: The compiled `app-debug.apk` is uploaded as an artifact to the GitHub run, making it available for users to download and install.
