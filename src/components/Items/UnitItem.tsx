import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import AnimatedDeleteWrapper from '../Reusable/AnimatedDeleteWrapper';
import styles from './Styles/UnitItem';



export type StorageUnit = {
  id: number;
  warehouseId: number;
  warehouseName: string;
  unitNumber: string;
  size: number;
  floor: string;
  status: 'available' | 'maintenance';
  pricePerDay: number | null;
  totalSpaceOccupied: number;
  bookings: any[]; 
  percentage: number; 
  customers: number; 
};

interface UnitItemProps {
  item: StorageUnit;
  index: number;
  colors: any;
  dark: boolean;
  selectedUnit: StorageUnit | null;
  removingId: number | null;
  onUnitPress: (unit: StorageUnit) => void;
  onEdit: (unit: StorageUnit) => void;
  onDelete: (id: number) => void;
}

const UnitItem: React.FC<UnitItemProps> = ({
  item,
  index,
  colors,
  dark,
  selectedUnit,
  removingId,
  onUnitPress,
  onEdit,
  onDelete,
}) => {
  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return '#FF3B30'; 
    if (percentage >= 80) return '#FF9500'; 
    if (percentage >= 50) return '#FFCC00';
    return '#34C759';
  };

  const renderRightActions = (closeSwipe: () => void) => (
    <View
      style={[styles.actionsContainer, { backgroundColor: colors.background }]}
    >
      <TouchableOpacity
        style={[styles.actionButton, styles.editButton]}
        onPress={() => {
          closeSwipe();
          onEdit(item);
        }}
      >
        <Text style={styles.actionText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() => {
          closeSwipe();
          onDelete(item.id);
        }}
      >
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  let swipeableRow: Swipeable | null;
  const closeSwipe = () => swipeableRow?.close();

  return (
    <AnimatedDeleteWrapper
      itemId={item.id}
      removingId={removingId}
      onDelete={(id) => onDelete(id)}
      deleteTitle="Delete Storage Unit"
      itemName={item.unitNumber}
    >
      <Swipeable
        ref={(ref) => {
          swipeableRow = ref;
        }}
        renderRightActions={() => renderRightActions(closeSwipe)}
        overshootRight={false}
      >
        <Animated.View
          // entering={FadeInRight.delay(index * 50)}
          //exiting={FadeOutLeft}
        >
          <TouchableOpacity
            onPress={() => onUnitPress(item)}
            style={[
              styles.unitCard,
              {
                backgroundColor: colors.card,
                borderColor:
                  selectedUnit?.id === item.id
                    ? colors.primary
                    : 'transparent',
                shadowColor: dark ? '#000' : '#000',
              },
              selectedUnit?.id === item.id && styles.unitCardSelected,
            ]}
          >
            <View style={styles.unitCardLeft}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: getStatusColor(item.percentage) },
                ]}
              />
              <View style={styles.unitInfo}>
                <Text style={[styles.unitId, { color: colors.text }]}>
                  {item.unitNumber}
                </Text>
                <Text
                  style={[styles.unitLocation, { color: colors.subtext }]}
                >
                  {item.warehouseName} • {item.floor} Floor • {item.size} sqft
                </Text>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerIcon}>👥</Text>
                  <Text
                    style={[styles.customerText, { color: colors.subtext }]}
                  >
                    {item.customers} Customer{item.customers !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.unitCardRight}>
              <View style={styles.percentageContainer}>
                <Text
                  style={[
                    styles.percentageText,
                    { color: getStatusColor(item.percentage) },
                  ]}
                >
                  {item.percentage}%
                </Text>
                <Text
                  style={[
                    styles.statusText,
                  ]}
                >
                  {(item.status).toUpperCase()}
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarBackground,
                    { backgroundColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${item.percentage}%`,
                        backgroundColor: getStatusColor(item.percentage),
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Swipeable>
    </AnimatedDeleteWrapper>
  );
};


export default UnitItem;