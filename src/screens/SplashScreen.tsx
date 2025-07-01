import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  AppState,
  AppStateStatus,
  Dimensions,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const appState = useRef(AppState.currentState);

  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);

  const finishSplash = () => {
    onFinish();
  };

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    startSplashSequence();

    return () => {
      subscription?.remove();
    };
  }, []);

  const startSplashSequence = () => {
    logoOpacity.value = withTiming(1, { duration: 300 });
    logoScale.value = withSpring(1, { damping: 10, stiffness: 80 });

    titleOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    titleTranslateY.value = withDelay(
      400,
      withSpring(0, { damping: 12, stiffness: 90 }),
    );

    setTimeout(() => {
      runOnJS(finishSplash)();
    }, 2500);
  };

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#f3a222" />

      {/* Logo */}
      <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
        <View style={styles.logoBackground}>
          {/* <MaterialIcons name="security" size={60} color="#fff" /> */}
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
          />
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.Text style={[styles.title, titleAnimatedStyle]}>
        SecureApp
      </Animated.Text>

      {/* Optional Subtitle */}
      <Animated.Text style={[styles.subtitle, titleAnimatedStyle]}>
        Your Security, Our Priority
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3a222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    marginBottom: 32,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#eee',
    marginTop: 8,
    fontWeight: '300',
    textAlign: 'center',
  },
  logoImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
});

export default SplashScreen;
