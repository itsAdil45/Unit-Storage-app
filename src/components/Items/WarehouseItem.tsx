import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import styles from './Styles/WarehouseItem';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { WarehouseItemProps } from '../../types/Warehouses';
import { formatDate } from '../../Utils/Formatters';

const WarehouseItem: React.FC<WarehouseItemProps> = ({
  item: warehouse,
  index,
  colors,
  dark,
  onEdit,
  onDeletePress,
}) => {
  const [showFloors, setShowFloors] = useState(false);
  const storageUnits = warehouse.storageUnits || [];
  const uniqueFloors = warehouse.uniqueFloors || [];

  const getWarehouseIcon = (): string => {
    return 'warehouse';
  };

  const handleViewVideo = async () => {
    if (!warehouse.videoFileLink) {
      Alert.alert('No Video', 'No video available for this warehouse');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(warehouse.videoFileLink);
      if (supported) {
        await Linking.openURL(warehouse.videoFileLink);
      } else {
        Alert.alert('Error', 'Cannot open video link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open video');
    }
  };

  const renderFloorItem = (floor: string, index: number) => (
    <View
      key={index}
      style={[styles.floorItem, { backgroundColor: colors.primary + '10' }]}
    >
      <MaterialIcons name="layers" size={14} color={colors.primary} />
      <Text style={[styles.floorText, { color: colors.primary }]}>{floor}</Text>
    </View>
  );

  return (
    <TouchableOpacity
      style={[
        styles.warehouseCard,
        { backgroundColor: dark ? colors.card : 'white', borderWidth: 0 },
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons
              name={getWarehouseIcon() as any}
              size={24}
              color="white"
            />
          </View>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: '#4CAF50', borderColor: colors.card },
            ]}
          />
        </View>

        <View style={styles.warehouseInfo}>
          <Text
            style={[styles.warehouseName, { color: colors.text }]}
            numberOfLines={1}
          >
            {warehouse.name}
          </Text>
          <Text
            style={[styles.warehouseAddress, { color: colors.subtext }]}
            numberOfLines={2}
          >
            {warehouse.address}
          </Text>
          <Text style={[styles.warehouseDetails, { color: colors.subtext }]}>
            Storage Units: {storageUnits.length}
          </Text>
          <Text style={[styles.warehouseDetails, { color: colors.subtext }]}>
            Created: {formatDate(warehouse.createdAt)}
          </Text>

          <TouchableOpacity
            style={[
              styles.videoButton,
              {
                backgroundColor: warehouse.videoFileLink
                  ? '#FF0000'
                  : colors.border,
                opacity: warehouse.videoFileLink ? 1 : 0.5,
              },
            ]}
            onPress={handleViewVideo}
            disabled={!warehouse.videoFileLink}
          >
            <MaterialIcons name="play-circle-filled" size={16} color="white" />
            <Text style={styles.videoButtonText}>View Video</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: dark ? colors.border : '#f8f9fa' },
            ]}
            onPress={() => onEdit(warehouse)}
          >
            <MaterialIcons name="edit" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: dark ? colors.border : '#f8f9fa' },
            ]}
            onPress={onDeletePress}
          >
            <MaterialIcons
              name="delete"
              size={20}
              color={colors.notification}
            />
          </TouchableOpacity>
        </View>
      </View>

      {uniqueFloors.length > 0 && (
        <View style={styles.floorsSection}>
          <TouchableOpacity
            style={styles.floorsHeader}
            onPress={() => setShowFloors(!showFloors)}
          >
            <Text style={[styles.floorsTitle, { color: colors.text }]}>
              Floors ({uniqueFloors.length})
            </Text>
            <MaterialIcons
              name={showFloors ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={20}
              color={colors.subtext}
            />
          </TouchableOpacity>

          {showFloors && (
            <View style={styles.floorsList}>
              {uniqueFloors.map((floor, index) =>
                renderFloorItem(floor, index),
              )}
            </View>
          )}
        </View>
      )}

      <View style={styles.cardFooter}>
        <View
          style={[styles.idBadge, { backgroundColor: colors.primary + '20' }]}
        >
          <Text style={[styles.idText, { color: colors.primary }]}>
            #{warehouse.id}
          </Text>
        </View>
        <Text style={[styles.updateDate, { color: colors.subtext }]}>
          Updated: {formatDate(warehouse.updatedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default WarehouseItem;
