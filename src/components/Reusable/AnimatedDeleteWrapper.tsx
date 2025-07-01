import React, { useRef, useEffect } from 'react';
import { Animated, Alert } from 'react-native';

interface AnimatedDeleteWrapperChildProps {
  onDeletePress: () => void;
  [key: string]: any;
}
interface AnimatedDeleteWrapperProps {
  children: React.ReactElement<AnimatedDeleteWrapperChildProps>;
  itemId: number;
  removingId: number | null;
  onDelete: (id: number) => void;
  deleteTitle?: string;
  deleteMessage?: string;
  itemName?: string;
  animationDuration?: number;
  slideDistance?: number;
}

const AnimatedDeleteWrapper: React.FC<AnimatedDeleteWrapperProps> = ({
  children,
  itemId,
  removingId,
  onDelete,
  deleteTitle = 'Delete Item',
  deleteMessage = 'Are you sure you want to delete this item?',
  itemName,
  animationDuration = 300,
  slideDistance = -500,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (removingId === itemId) {
      Animated.timing(slideAnim, {
        toValue: slideDistance,
        duration: animationDuration,
        useNativeDriver: true,
      }).start();
    }
  }, [removingId, itemId, slideAnim, animationDuration, slideDistance]);

  const handleDeleteConfirmation = () => {
    const message = itemName
      ? `Are you sure you want to delete "${itemName}"?`
      : deleteMessage;

    Alert.alert(deleteTitle, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(itemId) },
    ]);
  };

  return (
    <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
      {React.isValidElement(children)
        ? React.cloneElement(children, {
            onDeletePress: handleDeleteConfirmation,
          })
        : children}
    </Animated.View>
  );
};

// Custom hook for managing delete state and operations
export const useAnimatedDelete = <T extends { id: number }>(
  deleteRequest: (endpoint: string) => Promise<any>,
  endpoint: string,
) => {
  const [removingId, setRemovingId] = React.useState<number | null>(null);

  const handleDelete = async (
    id: number,
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
  ) => {
    setRemovingId(id);

    // Wait for animation to start
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Remove from UI immediately
    setItems((prev) => prev.filter((item) => item.id !== id));

    try {
      // Make API call
      await deleteRequest(`${endpoint}/${id}`);
    } catch (error) {
      console.error('Delete failed:', error);
      // Optionally restore item on failure
      // You could add error handling logic here
    }

    setRemovingId(null);
  };

  return {
    removingId,
    handleDelete,
  };
};

export default AnimatedDeleteWrapper;
