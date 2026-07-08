# dnPeople Mobile

**Phase 3 MVP · Production-ready scaffold (7 Jul 2026)**

React Native / Expo for iOS & Android.

## Setup

```bash
cd mobile
cp .env.example .env
npm install
npm start
```

Set `EXPO_PUBLIC_API_URL` to your API (default `http://localhost:3000/api/v1`).

## Features

- ✅ Login with ERP JWT
- ✅ SecureStore token persistence (survives app restart)
- ✅ Dashboard: sales stats + analytics insights
- ✅ EAS build profiles (`eas.json`) — staging + production

## Production build

```bash
cd mobile
eas build --profile production   # requires Expo account
eas submit --profile production
```

## Roadmap (post-MVP)

- Offline sync
- Push notifications
- Biometric auth
- Full module parity with web

**Owned by:** [dntech.id](https://dntech.id) — PT. Dozer Napitupulu Technology
