import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useThemeContext } from './src/context/ThemeContext';
import CustomToast from './src/components/CustomToast';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/context/AuthContext';

const AppInner = () => {
  const { theme } = useThemeContext();

  return (
    <>
    <NavigationContainer theme={theme}>
      <AuthProvider>
      <AppNavigator />
      </AuthProvider>
    </NavigationContainer>
          <Toast
        position="top"
        bottomOffset={40}
        config={{
          success: (props) => <CustomToast {...props} type="success" />,
          error: (props) => <CustomToast {...props} type="error" />,
          info: (props) => <CustomToast {...props} type="info" />,
        }}
      />
    </>
    
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
