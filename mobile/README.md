# CareerAI Mobile

Cross-platform mobile client for CareerAI, built with Expo and React Native so one codebase can run on Android and iOS.

## Stack

- Expo SDK 57
- React Native 0.86
- TypeScript
- React Navigation
- TanStack Query
- Zustand with Expo SecureStore
- Axios API client

## Local Setup

```bash
cd mobile
npm install
npm start
```

Run on Android:

```bash
npm run android
```

Run on iOS:

```bash
npm run ios
```

## Backend URL

By default, the mobile API client points to:

- Android emulator: `http://10.0.2.2:8000/api/v1`
- iOS simulator: `http://localhost:8000/api/v1`

For a physical phone, use your machine's LAN IP:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:8000/api/v1 npm start
```

## Migration Plan

The existing Kotlin app in `frontend/` remains untouched. Use it as a behavior and UI reference while moving production mobile work into `mobile/`.

Suggested next slices:

1. Complete register, OTP, forgot password, and onboarding flows.
2. Port assessment quiz and result screens.
3. Add resume upload with Expo document picker.
4. Add streaming RAG chat if the backend WebSocket/SSE contract is stable.
5. Move mature shared request/response types into a generated API client.
