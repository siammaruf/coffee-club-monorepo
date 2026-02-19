# Native Starter 🚀

A modern, feature-rich React Native starter template built with Expo Router, TypeScript, NativeWind (Tailwind CSS), and Redux Toolkit. This template provides a solid foundation for building cross-platform mobile applications with modern development practices and best-in-class developer experience.

## ✨ Features

### 🎨 **Styling & UI**
- **NativeWind (Tailwind CSS)** - Utility-first CSS framework for React Native
- **Themed Components** - Dark/light mode support with custom themed components
- **Parallax Scroll Views** - Beautiful animated scroll effects
- **Safe Area Context** - Proper safe area handling across all devices
- **Expo Image** - Optimized image component with advanced features

### 🧭 **Navigation**
- **Expo Router v6** - File-based routing with typed routes
- **Tab Navigation** - Bottom tab navigation with haptic feedback
- **Modal Support** - Built-in modal navigation patterns
- **Deep Linking** - URL scheme support for deep linking

### 🏗️ **Architecture & State Management**
- **Redux Toolkit** - Modern Redux with simplified boilerplate
- **Redux Persist** - Persist state across app sessions
- **TypeScript** - Full type safety throughout the application
- **Path Aliases** - Clean imports with `@/` prefix

### 🛠️ **Developer Experience**
- **ESLint** - Code linting with Expo configuration
- **Prettier** - Code formatting with Tailwind plugin
- **Hot Reloading** - Fast refresh during development
- **React Compiler** - Experimental React compiler support
- **New Architecture** - React Native new architecture enabled

### 📱 **Cross-Platform Support**
- **iOS** - iPad support included
- **Android** - Edge-to-edge display, adaptive icons
- **Web** - Static output with Metro bundler

### 🔧 **Utilities & Services**
- **HTTP Service** - Axios-based API service layer
- **Storage Service** - MMKV for fast local storage
- **Logger Service** - Comprehensive logging utilities
- **Reanimated** - Smooth 60fps animations
- **Gesture Handler** - Advanced gesture recognition

## 📂 Project Structure

```
native-starter/
├── src/
│   ├── app/                    # Expo Router pages
│   │   ├── (tabs)/            # Tab navigation routes
│   │   │   ├── index.tsx      # Home screen
│   │   │   ├── explore.tsx    # Explore screen
│   │   │   └── _layout.tsx    # Tab layout
│   │   ├── _layout.tsx        # Root layout
│   │   └── modal.tsx          # Modal screen
│   ├── components/            # Reusable components
│   │   ├── navigation/        # Navigation components
│   │   ├── ui/               # UI components
│   │   ├── themed-text.tsx   # Themed text component
│   │   ├── themed-view.tsx   # Themed view component
│   │   └── parallax-scroll-view.tsx
│   ├── constants/            # App constants
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Library configurations
│   ├── redux/               # Redux store and slices
│   ├── services/            # API and utility services
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── assets/                  # Static assets
├── global.css              # Global Tailwind styles
├── tailwind.config.js      # Tailwind configuration
├── metro.config.js         # Metro bundler config
└── app.json               # Expo configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd native-starter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on specific platforms**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 📱 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run on web browser
- `npm run lint` - Run ESLint
- `npm run reset-project` - Reset to clean project structure

## 🎨 Styling with NativeWind

This project uses NativeWind for styling, which brings Tailwind CSS to React Native:

```tsx
// Example usage
<View className="flex-1 bg-white dark:bg-gray-900">
  <Text className="text-lg font-bold text-gray-800 dark:text-white">
    Hello World
  </Text>
</View>
```

### Custom Themed Components

Use the provided themed components for automatic dark/light mode support:

```tsx
<ThemedView className="flex-row items-center gap-2">
  <ThemedText type="title">Welcome!</ThemedText>
</ThemedView>
```

## 🏗️ State Management

Redux Toolkit is configured with persistence:

```tsx
// Example slice
import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'user',
  initialState: { name: '', email: '' },
  reducers: {
    setUser: (state, action) => {
      state.name = action.payload.name
      state.email = action.payload.email
    }
  }
})
```

## 🌐 API Services

HTTP service is pre-configured with Axios:

```tsx
import { httpService } from '@/services/httpService'

// GET request
const data = await httpService.get('/api/users')

// POST request
const result = await httpService.post('/api/users', userData)
```

## 📱 Navigation

File-based routing with Expo Router:

```tsx
// Navigate programmatically
import { router } from 'expo-router'

router.push('/profile')
router.back()
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_APP_ENV=development
```

### Customizing Themes
Edit `src/constants/theme.ts` to customize colors and themes.

### Path Aliases
The project is configured with path aliases in `tsconfig.json`:

```tsx
// Instead of ../../components/Button
import Button from '@/components/Button'
```

## 🚢 Deployment

### Building for Production

```bash
# iOS
npx expo build:ios

# Android
npx expo build:android

# Web
npx expo export:web
```

### App Store Deployment
Follow the [Expo deployment guide](https://docs.expo.dev/deploy/build-project/) for detailed instructions.

## 🧪 Testing

The project is ready for testing setup. Consider adding:
- Jest for unit testing
- Detox for E2E testing
- React Native Testing Library for component testing

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [NativeWind](https://www.nativewind.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Native](https://reactnative.dev/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Expo team for the amazing development platform
- NativeWind team for bringing Tailwind to React Native
- React Native community for the ecosystem

---

**Happy coding!** 🎉
