# NutriPadi

NutriPadi is a premium, AI-powered African food analysis and tracking mobile application. Designed with a modern, high-contrast "Uber-like" aesthetic, NutriPadi helps users scan meals, analyze nutritional value, log their dietary intake, and maintain a healthy lifestyle tailored to African cuisine.

## 🚀 Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (SDK 54)
- **Language:** TypeScript
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Icons:** [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native)
- **Typography:** [Expo Google Fonts (Plus Jakarta Sans)](https://github.com/expo/google-fonts)
- **State Management & Storage:** React hooks & [Async Storage](https://react-native-async-storage.github.io/async-storage/)
- **Animations:** [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) & [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- **Hardware Integration:** Expo Camera & Image Picker

## 📸 Core Features

- **AI Food Scanner:** Use the camera to scan and identify African dishes, retrieving accurate nutritional insights.
- **Meal Logging:** Easily log breakfasts, lunches, dinners, and snacks.
- **Nutrition History:** Track caloric intake and macros over time with an intuitive dashboard.
- **Onboarding & Authentication:** Seamless and sleek sign-up and login flows.
- **Personalized Profile:** Manage dietary preferences, goals, and user settings.
- **Offline Storage:** Secure and fast local data persistence using Async Storage.

## 🛠️ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm
- Expo Go app on your physical device OR an iOS/Android emulator installed.

### Installation

1. Clone the repository and navigate to the project directory:

   ```bash
   cd nutripaddi
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Supabase Integration

Authentication and app data now use Supabase. Copy `.env.example` to `.env`, set your Supabase URL/key, then run the SQL files in `supabase/`. Cloudinary uploads go through the `upload-image` Supabase Edge Function described in `docs/backend-setup.md`.

### Running on a Device/Emulator

- **Physical Device:** Download the **Expo Go** app from the App Store (iOS) or Google Play (Android) and scan the QR code displayed in your terminal.
- **iOS Simulator:** Press `i` in the terminal to launch on the iOS simulator (requires Xcode).
- **Android Emulator:** Press `a` in the terminal to launch on the Android emulator (requires Android Studio).

## 📂 Project Structure

- `app/` - Contains all screens and routing logic using Expo Router.
  - `(tabs)/` - Bottom tab navigation screens (Dashboard, Scan, History, Profile).
  - `(auth)/` - Authentication flows (Login, Sign up).
  - `(onboarding)/` - Initial app onboarding screens.
- `components/` - Reusable UI components (Buttons, Cards, Inputs, Modals).
- `constants/` - Theme colors, standard dimensions, and configuration.
- `data/` - Mock data for testing and offline development.
- `utils/` - Helper functions and AI integration logic.
- `assets/` - Static files like images and fonts.

## 🤝 Contributing

Contributions are welcome! Please follow standard code formatting practices, utilize the established color palette and typography (Plus Jakarta Sans), and ensure that all new icons use `lucide-react-native`.

## 📄 License

This project is proprietary and confidential. Unauthorized copying of this file, via any medium, is strictly prohibited.
