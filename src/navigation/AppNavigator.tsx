import React, { useEffect, useState } from 'react';
import DrawerNavigator from './DrawerNavigator';
import LoginScreen from '../screens/LoginScreen';
import SplashScreen from '../screens/SplashScreen';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();
  const { isThemeLoaded } = useThemeContext();
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  // Wait for both splash screen to finish AND theme to load
  const isAppReady = isSplashFinished && isThemeLoaded;

  if (!isAppReady) {
    return <SplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  return isAuthenticated ? <DrawerNavigator /> : <LoginScreen />;
};

export default AppNavigator;
