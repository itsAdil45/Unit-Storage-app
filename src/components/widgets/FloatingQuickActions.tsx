import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import {
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const actions = [
  { title: 'Add Unit', icon: 'add', color: '#f39c12', lib: 'MaterialIcons' },
  { title: 'Customer', icon: 'people', color: '#f39c12', lib: 'MaterialIcons' },
  {
    title: 'Booking',
    icon: 'archive-outline',
    color: '#00bcd4',
    lib: 'MaterialCommunityIcons',
  },
  // {
  //   title: 'Cust Report',
  //   icon: 'account-group',
  //   color: '#4caf50',
  //   lib: 'MaterialCommunityIcons',
  // },
  {
    title: 'Expense',
    icon: 'money-bill-wave',
    color: '#3f51b5',
    lib: 'FontAwesome5',
  },
  // {
  //   title: 'Revenue',
  //   icon: 'money-bill-wave',
  //   color: '#f44336',
  //   lib: 'FontAwesome5',
  // },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const renderIcon = (action: (typeof actions)[0], size: number = 22) => {
  const color = 'white';
  switch (action.lib) {
    case 'MaterialIcons':
      return (
        <MaterialIcons name={action.icon as any} size={size} color={color} />
      );
    case 'MaterialCommunityIcons':
      return (
        <MaterialCommunityIcons
          name={action.icon as any}
          size={size}
          color={color}
        />
      );
    case 'FontAwesome5':
      return (
        <FontAwesome5 name={action.icon as any} size={size} color={color} />
      );
    default:
      return null;
  }
};

interface FloatingQuickActionsProps {
  onActionPress?: (action: (typeof actions)[0]) => void;
}

const FloatingQuickActions: React.FC<FloatingQuickActionsProps> = ({
  onActionPress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { dark } = useTheme();

  const animationProgress = useSharedValue(0);
  const fabScale = useSharedValue(1);

  const toggleExpanded = () => {
    const newState = !isExpanded;

    animationProgress.value = withSpring(newState ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });

    runOnJS(setIsExpanded)(newState);
  };

  const handleActionPress = (action: (typeof actions)[0]) => {
    // Close the menu first
    animationProgress.value = withSpring(0, {
      damping: 15,
      stiffness: 150,
    });
    runOnJS(setIsExpanded)(false);

    // Then call the action
    onActionPress?.(action);
  };

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: fabScale.value },
      {
        rotate: `${interpolate(animationProgress.value, [0, 1], [0, 45])}deg`,
      },
    ],
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animationProgress.value, [0, 1], [0, 0.3]),
    pointerEvents: animationProgress.value > 0 ? 'auto' : 'none',
  }));

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Overlay - Only visible when expanded */}
      {isExpanded && (
        <AnimatedPressable
          style={[styles.overlay, overlayAnimatedStyle]}
          onPress={toggleExpanded}
        />
      )}

      {/* Action Items */}
      {actions.map((action, index) => {
        const actionAnimatedStyle = useAnimatedStyle(() => {
          const progress = animationProgress.value;

          // Increased spacing between actions
          const translateY = interpolate(
            progress,
            [0, 1],
            [0, -(index + 1) * 60],
          );

          const scale = interpolate(progress, [0, 0.5, 1], [0, 0.8, 1]);

          const opacity = interpolate(progress, [0, 0.3, 1], [0, 0.5, 1]);

          return {
            opacity,
            transform: [{ translateY }, { scale }],
          };
        });

        const actionScale = useSharedValue(1);
        const actionAnimatedPressStyle = useAnimatedStyle(() => ({
          transform: [{ scale: actionScale.value }],
        }));

        return (
          <AnimatedPressable
            key={action.title}
            style={[
              styles.actionItem,
              { backgroundColor: action.color },
              actionAnimatedStyle,
              actionAnimatedPressStyle,
            ]}
            onPressIn={() => (actionScale.value = withSpring(0.9))}
            onPressOut={() => (actionScale.value = withSpring(1))}
            onPress={() => handleActionPress(action)}
          >
            {renderIcon(action, 15)}
            <View style={styles.labelContainer}>
              <Text style={styles.actionLabel}>{action.title}</Text>
            </View>
          </AnimatedPressable>
        );
      })}

      {/* Main FAB */}
      <AnimatedPressable
        style={[
          styles.fab,
          {
            backgroundColor: dark ? '#2196F3' : '#007AFF',
            shadowColor: dark ? '#000' : '#007AFF',
          },
          fabAnimatedStyle,
        ]}
        onPressIn={() => (fabScale.value = withSpring(0.95))}
        onPressOut={() => (fabScale.value = withSpring(1))}
        onPress={toggleExpanded}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 98,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 100, // Adjust as needed
    height: 400, // Enough to cover expanded actions
    zIndex: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 102,
  },
  actionItem: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 50, // Slightly smaller for better spacing
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 101,
  },
  labelContainer: {
    position: 'absolute',
    right: 60, // Adjusted positioning
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    textAlign: 'center',
    minWidth: 100,
    overflow: 'hidden',
  },
});

export default FloatingQuickActions;
