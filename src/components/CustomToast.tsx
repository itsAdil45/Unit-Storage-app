import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import type { BaseToastProps } from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

interface CustomToastProps extends BaseToastProps {
  type?: ToastType;
}

const toastColors: Record<ToastType, string> = {
  success: '#10b981',
  error: '#ef4444',
  info: '#3b82f6',
};

const icons: Record<ToastType, keyof typeof MaterialIcons.glyphMap> = {
  success: 'check-circle',
  error: 'error',
  info: 'info',
};

export default function CustomToast({
  text1,
  text2,
  type = 'info',
}: CustomToastProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutDown.duration(300)}
      style={[styles.toast, { borderLeftColor: toastColors[type] }]}
    >
      <MaterialIcons
        name={icons[type]}
        size={24}
        color={toastColors[type]}
        style={{ marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        {text1 && <Text style={styles.title}>{text1}</Text>}
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 5,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontWeight: 'bold',
    color: '#111827',
    fontSize: 16,
  },
  message: {
    color: '#4b5563',
    fontSize: 14,
    marginTop: 4,
  },
});
