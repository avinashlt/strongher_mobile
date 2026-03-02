# STRONG - Fitness Tracking App

## Overview
STRONG is a comprehensive fitness and health tracking mobile application built with React Native (Expo) and Express.js backend.

## Architecture
- **Frontend**: Expo React Native with Expo Router (file-based routing)
- **Backend**: Express.js (TypeScript) on port 5000
- **State Management**: AsyncStorage for persistence, React Context for shared state, React Query for API calls
- **AI**: OpenAI GPT-5 Vision API for food calorie analysis (requires OPENAI_API_KEY)

## Features
1. **Animated Splash Screen** - Custom Reanimated splash with pulsing rings, floating particles, gradient progress bar, and STRONG branding
2. **Dashboard** - Daily overview with progress rings for calories and steps
3. **AI Food Scanner** - Take/pick food photos, AI analyzes and estimates calories + macros
4. **Step Tracker** - Pedometer integration with manual input fallback, weekly chart
5. **Menstrual Cycle Tracker** - Period logging, phase tracking, symptom logging (female users only)
6. **Premium Content** - Gated workout plans, meal guides, and wellness content
7. **User Profiles** - Onboarding flow, customizable daily goals, free/premium tiers

## Key Files
- `components/AnimatedSplash.tsx` - Animated splash screen with Reanimated (pulse rings, particles, progress bar)
- `app/_layout.tsx` - Root layout with providers (QueryClient, UserProvider, fonts, splash)
- `app/onboarding.tsx` - User onboarding (name + gender selection)
- `app/(tabs)/index.tsx` - Home dashboard
- `app/(tabs)/calories.tsx` - Food calorie tracking with camera
- `app/(tabs)/steps.tsx` - Step tracker with pedometer
- `app/(tabs)/cycle.tsx` - Menstrual cycle tracker
- `app/(tabs)/profile.tsx` - Profile settings and goals
- `app/premium.tsx` - Premium content screen
- `app/food-detail.tsx` - Food nutritional detail modal
- `contexts/UserContext.tsx` - User state management
- `lib/storage.ts` - AsyncStorage data layer
- `server/routes.ts` - API routes (food analysis, premium content)
- `constants/colors.ts` - Theme colors (emerald green primary, orange accent)

## Dependencies
- expo-crypto (UUIDs), expo-sensors (pedometer), expo-image-picker (camera/gallery)
- expo-haptics, expo-image, expo-linear-gradient, expo-blur
- @expo-google-fonts/outfit (custom typography)
- openai (server-side food analysis)
- @react-native-async-storage/async-storage (local persistence)

## Environment Variables
- `OPENAI_API_KEY` - Required for AI food photo analysis
- `SESSION_SECRET` - Session management
