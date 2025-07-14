import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { UnitData } from '../../types/Types';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';
import EditUnitModal from './EditUnitModal';
import { useGet } from '../../hooks/useGet';
import { useDelete } from '../../hooks/useDelete';
import ModalUnitItem from '../Items/ModalUnitItem';
import { formatDate } from '../../Utils/Formatters';

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
}

const { height: screenHeight } = Dimensions.get('window');

const UnitListModal: React.FC<Props> = ({ visible, onClose, selectedDate }) => {
  const { dark } = useTheme();
  const theme = dark ? darkColors : lightColors;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  const [editingUnit, setEditingUnit] = useState<UnitData | null>(null);
  const [units, setUnits] = useState<UnitData[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const { get, loading } = useGet();
  const { del: deleteRequest } = useDelete();

  useEffect(() => {
    if (visible) {
      if (selectedDate) fetchUnits();
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, selectedDate, slideAnim]);

  const fetchUnits = async () => {
    const res = await get(`/availability/${selectedDate}`);
    if (res?.status === 'success') {
      setUnits(res.data);
    }
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const uniqueWarehouses = Array.from(
    new Set(units.map((u) => u.warehouseName)),
  );
  const filteredUnits = filter
    ? units.filter((u) => u.warehouseName === filter)
    : units;

  const handleDelete = async (id: number) => {
    setRemovingId(id);
    await new Promise((res) => setTimeout(res, 250)); // wait for animation
    setUnits((prev) => prev.filter((u) => u.id !== id));
    await deleteRequest(`/storage-units/${id}`);
    setRemovingId(null);
  };

  const updateUnit = (updated: UnitData) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)),
    );
  };

  const renderUnitItem = ({ item }: { item: UnitData }) => (
    <ModalUnitItem
      item={item}
      removingId={removingId}
      theme={theme}
      onEdit={setEditingUnit}
      onDelete={handleDelete}
    />
  );

  return (
    <>
      <Modal
        visible={visible}
        animationType="fade"
        transparent
        statusBarTranslucent
      >
        <StatusBar
          backgroundColor="rgba(0,0,0,0.6)"
          barStyle={dark ? 'light-content' : 'dark-content'}
        />
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.modal,
              {
                backgroundColor: theme.card,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={[styles.title, { color: theme.text }]}>
                  Storage Units
                </Text>
                <Text style={[styles.subtitle, { color: theme.subtext }]}>
                  {formatDate(selectedDate)}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: theme.background },
                ]}
                onPress={handleClose}
              >
                <Text style={[styles.closeButtonText, { color: theme.text }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* Chip Filters */}
            {uniqueWarehouses.length > 1 && (
              <View style={styles.chipContainer}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    {
                      backgroundColor: !filter ? theme.primary : 'transparent',
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={() => setFilter(null)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: !filter ? '#fff' : theme.primary },
                    ]}
                  >
                    All ({units.length})
                  </Text>
                </TouchableOpacity>
                {uniqueWarehouses.map((wh) => {
                  const count = units.filter(
                    (u) => u.warehouseName === wh,
                  ).length;
                  return (
                    <TouchableOpacity
                      key={wh}
                      style={[
                        styles.chip,
                        {
                          backgroundColor:
                            filter === wh ? theme.primary : 'transparent',
                          borderColor: theme.primary,
                        },
                      ]}
                      onPress={() => setFilter(wh)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: filter === wh ? '#fff' : theme.primary },
                        ]}
                      >
                        {wh} ({count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            ) : (
              <FlatList
                data={filteredUnits}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                renderItem={renderUnitItem}
              />
            )}
          </Animated.View>
        </View>
      </Modal>

      {editingUnit && (
        <EditUnitModal
          visible={true}
          unit={editingUnit}
          onClose={() => setEditingUnit(null)}
          onSaveSuccess={(updated) => {
            updateUnit(updated);
            setEditingUnit(null);
          }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '90%',
    minHeight: screenHeight * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
  },
  unitCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  unitHeader: {
    marginBottom: 12,
  },
  unitInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  unitDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  editButton: {
    backgroundColor: 'transparent',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderColor: '#ef4444',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default UnitListModal;
