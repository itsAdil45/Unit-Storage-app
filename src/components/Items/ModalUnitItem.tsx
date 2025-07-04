import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { UnitData } from '../../types/Types';
import styles from './Styles/ModalUnitItem';

interface UnitItemProps {
  item: UnitData;
  removingId: number | null;
  theme: any;
  onEdit: (unit: UnitData) => void;
  onDelete: (id: number) => void;
}

const ModalUnitItem: React.FC<UnitItemProps> = ({
  item,
  removingId,
  theme,
  onEdit,
  onDelete,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (removingId === item.id) {
      Animated.timing(slideAnim, {
        toValue: -500,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [removingId, item.id, slideAnim]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#10b981';
      case 'maintenance':
        return '#f59e0b';
      case 'occupied':
        return '#ef4444';
      default:
        return theme.subtext;
    }
  };

  return (
    <Animated.View
      style={[
        styles.unitCard,
        {
          backgroundColor: theme.background,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <View style={styles.unitHeader}>
        <Text style={[styles.unitNumber, { color: theme.text }]}>
          {item.unitNumber}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.unitDetails}>
        <Text style={{ color: theme.subtext }}>
          Floor: <Text style={{ color: theme.text }}>{item.floor}</Text>
        </Text>
        <Text style={{ color: theme.subtext }}>
          Size: <Text style={{ color: theme.text }}>{item.size} sq ft</Text>
        </Text>
        <Text style={{ color: theme.subtext }}>
          Warehouse:{' '}
          <Text style={{ color: theme.text }}>{item.warehouseName}</Text>
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: theme.primary }]}
          onPress={() => onEdit(item)}
        >
          <Text style={{ color: theme.primary }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: '#ef4444' }]}
          onPress={() => onDelete(item.id)}
        >
          <Text style={{ color: '#ef4444' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default ModalUnitItem;
