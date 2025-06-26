import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from "../constants/color"
import { StorageUnit } from '../types/Types';
import { Item } from '../types/Types';
import { floors, warehouses, occupancyFilters } from '../Utils/Filters';

const units: StorageUnit[] = [
  { id: 'G-401', percentage: 43, customers: 1, warehouse: 'Warehouse 4B', floor: 'Ground' },
  { id: 'G-402', percentage: 100, customers: 3, warehouse: 'Warehouse 4B', floor: 'Ground' },
  { id: 'G-403', percentage: 100, customers: 1, warehouse: 'Warehouse 4B', floor: 'Ground' },
  { id: 'G-404', percentage: 100, customers: 1, warehouse: 'Warehouse 4B', floor: 'Ground' },
  { id: 'G-405', percentage: 100, customers: 1, warehouse: 'Warehouse 4B', floor: 'Ground' },
  { id: 'G-406', percentage: 100, customers: 1, warehouse: 'Warehouse 4B', floor: 'Ground' },
  { id: 'G-407', percentage: 100, customers: 1, warehouse: 'Warehouse 4B', floor: 'Ground' },
  { id: 'G-408', percentage: 100, customers: 1, warehouse: 'Warehouse 4B', floor: 'Ground' },
  { id: 'G-409', percentage: 85, customers: 1, warehouse: 'Warehouse 4B', floor: 'Ground' },
  { id: 'G-410', percentage: 60, customers: 1, warehouse: 'Warehouse 4B', floor: 'Ground' },
  { id: 'G-411', percentage: 90, customers: 1, warehouse: 'Warehouse 4B', floor: 'Ground' },
  { id: 'G-412', percentage: 75, customers: 1, warehouse: 'Warehouse 4B', floor: 'Ground' },
  { id: 'G-413', percentage: 50, customers: 1, warehouse: 'Warehouse 4B', floor: 'Ground' },
  { id: 'G-414', percentage: 100, customers: 1, warehouse: 'Warehouse 4B', floor: 'Ground' },
  { id: 'G-415', percentage: 65, customers: 1, warehouse: 'Warehouse 4B', floor: 'Ground' },
  { id: 'G-416', percentage: 80, customers: 1, warehouse: 'Warehouse 4B', floor: 'Ground' },
  { id: 'G-418', percentage: 45, customers: 1, warehouse: 'Warehouse 4C', floor: 'Ground' },
  { id: 'F-501', percentage: 70, customers: 2, warehouse: 'Warehouse 4B', floor: 'First' },
  { id: 'F-502', percentage: 55, customers: 1, warehouse: 'Warehouse 4B', floor: 'First' },
  { id: 'F-503', percentage: 90, customers: 2, warehouse: 'Warehouse 4B', floor: 'First' },
];

const UnitList = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  const [selectedFloor, setSelectedFloor] = useState('All');
  const [selectedOccupancy, setSelectedOccupancy] = useState('All');
  const [sortBy, setSortBy] = useState<keyof Item>('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<StorageUnit | null>(null);
  const { dark } = useTheme();

  // Theme-based colors
  const colors = dark ? darkColors : lightColors;
  
  const filteredAndSortedUnits = useMemo(() => {
    let filtered = units.filter((unit) => {
      // Warehouse filter
      if (selectedWarehouse !== 'All' && unit.warehouse !== selectedWarehouse) {
        return false;
      }
      
      // Floor filter
      if (selectedFloor !== 'All' && unit.floor !== selectedFloor) {
        return false;
      }
      
      // Occupancy filter
      if (selectedOccupancy !== 'All') {
        const occupancyFilter = occupancyFilters.find(f => f.label === selectedOccupancy);
        if (occupancyFilter && (unit.percentage < occupancyFilter.min || unit.percentage > occupancyFilter.max)) {
          return false;
        }
      }
      return true;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'id') {
        aValue = a.id;
        bValue = b.id;
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [units, selectedWarehouse, selectedFloor, selectedOccupancy, sortBy, sortDirection]);

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return '#FF3B30'; // Red - Full
    if (percentage >= 80) return '#FF9500'; // Orange - High
    if (percentage >= 50) return '#FFCC00'; // Yellow - Moderate
    return '#34C759'; // Green - Available
  };

  const getStatusText = (percentage: number) => {
    if (percentage >= 100) return 'FULL';
    if (percentage >= 80) return 'HIGH';
    if (percentage >= 50) return 'MODERATE';
    return 'AVAILABLE';
  };

  const renderFilterChip = (label: string, isSelected: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={label}
      onPress={onPress}
      style={[
        styles.filterChip,
        {
          backgroundColor: isSelected ? colors.primary : (dark ? colors.border : '#F2F2F7'),
          borderColor: isSelected ? colors.primary : colors.border
        }
      ]}
    >
      <Text style={[
        styles.filterChipText,
        {
          color: isSelected ? '#FFFFFF' : colors.text
        }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderRightActions = (item: StorageUnit, close: () => void) => (
    <View style={[styles.actionsContainer, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.actionButton, styles.editButton]}
        onPress={() => {
          close();
          alert(`Edit ${item.id}`);
        }}
      >
        <Text style={styles.actionText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() => {
          close();
          alert(`Delete ${item.id}`);
        }}
      >
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStorageUnit = ({ item, index }: { item: StorageUnit; index: number }) => {
    let swipeableRow: Swipeable | null;
    const closeSwipe = () => swipeableRow?.close();

    return (
      <Swipeable 
        ref={(ref) => { swipeableRow = ref; }}
        renderRightActions={() => renderRightActions(item, closeSwipe)}
        overshootRight={false}
      >
        <Animated.View
          entering={FadeInRight.delay(index * 50)}
          exiting={FadeOutLeft}
        >
          <TouchableOpacity
            onPress={() => setSelectedUnit(selectedUnit?.id === item.id ? null : item)}
            style={[
              styles.unitCard,
              {
                backgroundColor: colors.card,
                borderColor: selectedUnit?.id === item.id ? colors.primary : 'transparent',
                shadowColor: dark ? '#000' : '#000'
              },
              selectedUnit?.id === item.id && styles.unitCardSelected
            ]}
          >
            <View style={styles.unitCardLeft}>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.percentage) }]} />
              <View style={styles.unitInfo}>
                <Text style={[styles.unitId, { color: colors.text }]}>{item.id}</Text>
                <Text style={[styles.unitLocation, { color: colors.subtext }]}>
                  {item.warehouse} • {item.floor} Floor
                </Text>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerIcon}>👥</Text>
                  <Text style={[styles.customerText, { color: colors.subtext }]}>
                    {item.customers} Customer{item.customers !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.unitCardRight}>
              <View style={styles.percentageContainer}>
                <Text style={[styles.percentageText, { color: getStatusColor(item.percentage) }]}>
                  {item.percentage}%
                </Text>
                <Text style={[styles.statusText, { color: getStatusColor(item.percentage) }]}>
                  {getStatusText(item.percentage)}
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${item.percentage}%`,
                        backgroundColor: getStatusColor(item.percentage)
                      }
                    ]}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Swipeable>
    );
  };

  const renderHeader = () => (
    <View style={[styles.headerContainer, { backgroundColor: colors.card }]}>
      {/* Quick Filters */}
      <View style={styles.quickFiltersContainer}>
        <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Occupancy</Text>
        <View style={styles.filterChipsContainer}>
          {occupancyFilters.map((filter) =>
            renderFilterChip(
              filter.label,
              selectedOccupancy === filter.label,
              () => setSelectedOccupancy(filter.label)
            )
          )}
        </View>
      </View>

      {/* Advanced Filters Toggle */}
      <TouchableOpacity
        onPress={() => setShowFilters(!showFilters)}
        style={styles.advancedFiltersToggle}
      >
        <Text style={[styles.advancedFiltersText, { color: colors.primary }]}>
          {showFilters ? '▼' : '▶'} Advanced Filters
        </Text>
      </TouchableOpacity>

      {/* Advanced Filters */}
      {showFilters && (
        <View style={styles.advancedFiltersContainer}>
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Warehouse:</Text>
            <View style={styles.filterChipsContainer}>
              {warehouses.map((warehouse) =>
                renderFilterChip(
                  warehouse,
                  selectedWarehouse === warehouse,
                  () => setSelectedWarehouse(warehouse)
                )
              )}
            </View>
          </View>

          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Floor:</Text>
            <View style={styles.filterChipsContainer}>
              {floors.map((floor) =>
                renderFilterChip(
                  floor,
                  selectedFloor === floor,
                  () => setSelectedFloor(floor)
                )
              )}
            </View>
          </View>

          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Sort by:</Text>
            <View style={styles.sortContainer}>
              <TouchableOpacity
                onPress={() => setSortBy('id')}
                style={[
                  styles.sortButton,
                  {
                    backgroundColor: sortBy === 'id' ? colors.primary : (dark ? colors.border : '#F2F2F7'),
                    borderColor: sortBy === 'id' ? colors.primary : colors.border
                  }
                ]}
              >
                <Text style={[
                  styles.sortButtonText,
                  { color: sortBy === 'id' ? '#FFFFFF' : colors.text }
                ]}>
                  ID
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSortBy('percentage')}
                style={[
                  styles.sortButton,
                  {
                    backgroundColor: sortBy === 'percentage' ? colors.primary : (dark ? colors.border : '#F2F2F7'),
                    borderColor: sortBy === 'percentage' ? colors.primary : colors.border
                  }
                ]}
              >
                <Text style={[
                  styles.sortButtonText,
                  { color: sortBy === 'percentage' ? '#FFFFFF' : colors.text }
                ]}>
                  Occupancy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSortBy('customers')}
                style={[
                  styles.sortButton,
                  {
                    backgroundColor: sortBy === 'customers' ? colors.primary : (dark ? colors.border : '#F2F2F7'),
                    borderColor: sortBy === 'customers' ? colors.primary : colors.border
                  }
                ]}
              >
                <Text style={[
                  styles.sortButtonText,
                  { color: sortBy === 'customers' ? '#FFFFFF' : colors.text }
                ]}>
                  Customers
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Results Summary */}
      <View style={[styles.resultsSummary, { borderTopColor: colors.border }]}>
        <Text style={[styles.resultsText, { color: colors.subtext }]}>
          {filteredAndSortedUnits.length} unit{filteredAndSortedUnits.length !== 1 ? 's' : ''} found
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.appHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.appTitle, { color: colors.text }]}>Storage Units</Text>
      </View>

      <FlatList
        data={filteredAndSortedUnits}
        renderItem={renderStorageUnit}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        style={[styles.flatList, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No units found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
              Try adjusting your filters or search criteria
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    fontSize: 18,
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickFiltersContainer: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  advancedFiltersToggle: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  advancedFiltersText: {
    fontSize: 14,
    fontWeight: '500',
  },
  advancedFiltersContainer: {
    marginBottom: 16,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  sortButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  sortDirectionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortDirectionText: {
    fontSize: 16,
  },
  resultsSummary: {
    paddingTop: 8,
    borderTopWidth: 1,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  unitCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 2,
  },
  unitCardSelected: {
    shadowOpacity: 0.2,
  },
  unitCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  unitInfo: {
    flex: 1,
  },
  unitId: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  unitLocation: {
    fontSize: 14,
    marginBottom: 6,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  customerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  unitCardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 80,
  },
  percentageContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  progressBarContainer: {
    width: 60,
  },
  progressBarBackground: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4CD964',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UnitList;