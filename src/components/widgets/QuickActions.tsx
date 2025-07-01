import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import {
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';

const actions = [
  { title: 'Add Unit', icon: 'add', color: '#f39c12', lib: 'MaterialIcons' },
  { title: 'Customer', icon: 'people', color: '#f39c12', lib: 'MaterialIcons' },
  {
    title: 'Booking',
    icon: 'archive-outline',
    color: '#00bcd4',
    lib: 'MaterialCommunityIcons',
  },
  {
    title: 'Cust Report',
    icon: 'account-group',
    color: '#4caf50',
    lib: 'MaterialCommunityIcons',
  },
  {
    title: 'Expense',
    icon: 'archive-outline',
    color: '#3f51b5',
    lib: 'MaterialCommunityIcons',
  },
  {
    title: 'Revenue',
    icon: 'money-bill-wave',
    color: '#f44336',
    lib: 'FontAwesome5',
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const renderIcon = (action: (typeof actions)[0]) => {
  const size = 22;
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

const ActionItem: React.FC<{
  item: (typeof actions)[0];
  onPress?: () => void;
}> = ({ item, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withSpring(0.95))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={onPress}
      style={[
        styles.actionButton,
        { backgroundColor: item.color },
        animatedStyle,
      ]}
    >
      {renderIcon(item)}
      <Text style={styles.actionText}>{item.title}</Text>
    </AnimatedPressable>
  );
};

const QuickActions: React.FC<{
  onActionPress?: (action: (typeof actions)[0]) => void;
}> = ({ onActionPress }) => {
  const { dark } = useTheme();
  const backgroundColor = dark ? darkColors.card : lightColors.card;
  const headerColor = dark ? darkColors.text : lightColors.text;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.header, { color: headerColor }]}>Quick Actions</Text>
      <FlatList
        data={actions}
        horizontal
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <ActionItem item={item} onPress={() => onActionPress?.(item)} />
        )}
        contentContainerStyle={styles.listContainer}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    paddingVertical: 16,
    elevation: 3,
  },
  header: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 10,
  },
  listContainer: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  actionButton: {
    width: 90,
    height: 90,
    borderRadius: 16,
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
});

export default QuickActions;
