# 🚀 anganstay Setup Guide

## 📦 Prerequisites

Make sure you have installed:

- Node.js
- npm or yarn
- Expo CLI
- Android Studio / Emulator
- ADB (Android Debug Bridge)
- Ngrok
- EAS CLI

Install EAS CLI:

```bash
npm install -g eas-cli
```

---

# 🖥️ Frontend Setup (React Native - Expo)

```bash
cd frontend
```

## ▶️ Start Development Server

```bash
npx expo start --dev-client
npm run start:dev
```

## 🔄 Clean & Rebuild Native Code

```bash
npx expo prebuild --clean
```

## 📱 Build APK (EAS)

### Preview Build

```bash
eas build --platform android --profile preview
```

### Development Build

```bash
eas build --profile development --platform android
```

## 🔗 Deep Linking Debug

```bash
npx uri-scheme list
```

---

# 🤖 Android Debugging (ADB)

```bash
adb kill-server
adb start-server
adb devices
```

---

# ⚙️ Backend Setup (NestJS)

```bash
cd backend
```

## 🔌 Connect Mobile Device to Local Backend

```bash
adb reverse tcp:3000 tcp:3000
adb reverse tcp:9090 tcp:9090
```

---

## 🌐 Expose Backend via Ngrok

```bash
npx ngrok http 3000
```

👉 Use generated URL in frontend API calls

---

## 🧪 Seed Dummy Data

### Generate Properties

```bash
node generate_dummy_properties.js
```

### Insert Properties into DB

```bash
node insert_properties.js
```

---

# ⚡ Common Issues & Fixes

## ❌ Device Not Detected

```bash
adb devices
```

- Enable USB Debugging
- Reconnect device

---

## ❌ Backend Not Reachable

- Ensure ngrok is running
- Update API URL in frontend

---

## ❌ Expo Deep Linking Issues

Verify scheme in `app.json`:

```json
{
  "expo": {
    "scheme": "rentstoreapp"
  }
}
```

---

## ❌ Payment / Redirect Issues

- Ensure backend is accessible via ngrok
- Verify redirect URI matches app scheme

---

# 📌 Notes

- Always restart ADB if connection issues occur
- Use development builds for native modules
- Keep ngrok running during testing

---

# 🧠 Developer Tips

- Use `.env` for secrets instead of hardcoding
- Monitor backend logs during payment flow
- Prefer real device testing over emulator
