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
  withSequence,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import * as DefaultSplashScreen from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const appState = useRef(AppState.currentState);

  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);
  const titleScale = useSharedValue(0.8);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(30);
  const taglineOpacity = useSharedValue(0);
  const decorationOpacity = useSharedValue(0);
  const decorationScale = useSharedValue(0);

  const finishSplash = async() => {
    // await DefaultSplashScreen.hideAsync();
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
    logoOpacity.value = withTiming(1, { duration: 400 });
    logoScale.value = withSpring(1, { damping: 8, stiffness: 100 });
    logoRotation.value = withSequence(
      withTiming(5, { duration: 200 }),
      withTiming(0, { duration: 300 }),
    );

    decorationOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    decorationScale.value = withDelay(
      300,
      withSpring(1, { damping: 10, stiffness: 80 }),
    );

    titleOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(
      600,
      withSpring(0, { damping: 12, stiffness: 90 }),
    );
    titleScale.value = withDelay(
      600,
      withSpring(1, { damping: 10, stiffness: 80 }),
    );

    subtitleOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
    subtitleTranslateY.value = withDelay(
      900,
      withSpring(0, { damping: 12, stiffness: 90 }),
    );

    taglineOpacity.value = withDelay(1200, withTiming(1, { duration: 500 }));

    setTimeout(() => {
      runOnJS(finishSplash)();
    }, 3000);
  };

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
  }));

  const decorationAnimatedStyle = useAnimatedStyle(() => ({
    opacity: decorationOpacity.value,
    transform: [{ scale: decorationScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [
      { translateY: titleTranslateY.value },
      { scale: titleScale.value },
    ],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#f3a222" />

      <Animated.View style={[styles.decorationTop, decorationAnimatedStyle]}>
        <View style={styles.decorativeCircle} />
      </Animated.View>

      <Animated.View style={[styles.decorationBottom, decorationAnimatedStyle]}>
        <View style={styles.decorativeCircle} />
      </Animated.View>

      <View style={styles.mainContent}>
        <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
          <View style={styles.logoBackground}>
            <View style={styles.logoShadow} />
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
            />
          </View>
        </Animated.View>

        {/* <Animated.View style={[styles.textContainer, titleAnimatedStyle]}>
          <Text style={styles.title}>MoveHub</Text>
          <View style={styles.titleUnderline} />
        </Animated.View> */}

        <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
          Choose & Move 
        </Animated.Text>

        <Animated.View style={[styles.taglineContainer, taglineAnimatedStyle]}>
          <Text style={styles.tagline}>Your One-Stop Moving Solution</Text>
          <View style={styles.taglineAccent}>
            <MaterialIcons name="home" size={16} color="#fff" />
            <MaterialIcons name="arrow-forward" size={16} color="#fff" />
            <MaterialIcons name="location-on" size={16} color="#fff" />
          </View>
        </Animated.View>
      </View>

      {/* Bottom accent */}
      <Animated.View style={[styles.bottomAccent, decorationAnimatedStyle]}>
        <View style={styles.accentLine} />
      </Animated.View>
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
  decorationTop: {
    position: 'absolute',
    top: height * 0.1,
    right: width * 0.1,
  },
  decorationBottom: {
    position: 'absolute',
    bottom: height * 0.15,
    left: width * 0.1,
  },
  decorativeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    marginBottom: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  logoBackground: {
    width: 180,
    height: 180,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    position: 'relative',
  },
  logoShadow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 65,
    top: 5,
    left: 5,
    zIndex: -1,
  },
  logoImage: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: '#fff',
    marginTop: 8,
    borderRadius: 2,
    opacity: 0.8,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 24,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 3,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '300',
    textAlign: 'center',
    opacity: 0.85,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  taglineAccent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 80,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 50,
    width: width * 0.6,
    alignItems: 'center',
  },
  accentLine: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
});

export default SplashScreen;
