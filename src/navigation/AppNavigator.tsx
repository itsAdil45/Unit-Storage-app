import React, { useEffect, useState } from 'react';
import DrawerNavigator from './DrawerNavigator';
import LoginScreen from '../screens/LoginScreen';
import SplashScreen from '../screens/SplashScreen';
import { useAuth } from '../context/AuthContext';

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  if (!isSplashFinished) {
    return <SplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  return isAuthenticated ? <DrawerNavigator /> : <LoginScreen />;
};

export default AppNavigator;
