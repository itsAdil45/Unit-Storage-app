import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from "../constants/color"
import { UnitData } from '../types/Types';
import { warehouses } from '../Utils/Filters';
import { useGet } from '../hooks/useGet';
import { useDelete } from '../hooks/useDelete';
import AnimatedDeleteWrapper, { useAnimatedDelete } from './Reusable/AnimatedDeleteWrapper';
import EditUnitModal from './modals/EditUnitModal';
import Pagination from './Reusable/Pagination';

// Updated StorageUnit type to match API response
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
  bookings: any[];        // Array of bookings
  percentage: number;     // Calculated occupancy percentage
  customers: number;      // Calculated number of customers
};

// Type for grouped warehouse data
type WarehouseGroup = {
  [warehouseName: string]: StorageUnit[];
};

const UnitList = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  const [sortBy, setSortBy] = useState<'unitNumber' | 'percentage' | 'customers'>('unitNumber');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<StorageUnit | null>(null);
  
  // Changed to store all units and grouped data
  const [allUnits, setAllUnits] = useState<StorageUnit[]>([]);
  const [warehouseGroups, setWarehouseGroups] = useState<WarehouseGroup>({});
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [editingUnit, setEditingUnit] = useState<UnitData | null>(null);
  
  // Pagination states - now for client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  
  const { get } = useGet();
  const { del: deleteRequest } = useDelete();
  
  // Use the custom hook for animated delete
  const { removingId, handleDelete: baseHandleDelete } = useAnimatedDelete<StorageUnit>(
    deleteRequest,
    '/storage-units'
  );

  useEffect(() => {
    fetchAllUnits();
  }, []);

  // Reset to page 1 when warehouse filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedWarehouse]);

  const fetchAllUnits = async () => {
    setLoading(true);
    try {
      // Fetch all units at once - modify this endpoint as needed
      const endpoint = `/storage-units?limit=1000`; // or `/storage-units?limit=1000` if you need to specify a large limit
      const res = await get(endpoint);
      
      if (res?.status === 'success') {
        // Process units directly from API response
        const processedUnits = res.data.units.map((apiUnit: any): StorageUnit => {
          const totalBookings = apiUnit.bookings?.length || 0;
          const totalCustomers = new Set(apiUnit.bookings?.map((b: any) => b.customerId) || []).size;
          const occupancyPercentage = apiUnit.totalSpaceOccupied ? 
            Math.round((apiUnit.totalSpaceOccupied / apiUnit.size) * 100) : 0;

          return {
            ...apiUnit,
            percentage: occupancyPercentage,
            customers: totalCustomers,
          };
        });
        
        setAllUnits(processedUnits);
        
        // Group units by warehouse
        const grouped = groupUnitsByWarehouse(processedUnits);
        setWarehouseGroups(grouped);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
      setAllUnits([]);
      setWarehouseGroups({});
    }
    
    setLoading(false);
    if (initialLoad) {
      setInitialLoad(false);
    }
  };

  // Helper function to group units by warehouse
  const groupUnitsByWarehouse = (units: StorageUnit[]): WarehouseGroup => {
    return units.reduce((groups, unit) => {
      const warehouseName = unit.warehouseName;
      if (!groups[warehouseName]) {
        groups[warehouseName] = [];
      }
      groups[warehouseName].push(unit);
      return groups;
    }, {} as WarehouseGroup);
  };

  // Get filtered and sorted units with client-side pagination
  const { paginatedUnits, totalPages, totalUnits } = useMemo(() => {
    // Get units based on selected warehouse
    let unitsToDisplay: StorageUnit[] = [];
    
    if (selectedWarehouse === 'All') {
      unitsToDisplay = allUnits;
    } else {
      unitsToDisplay = warehouseGroups[selectedWarehouse] || [];
    }

    // Sort the units
    const sorted = [...unitsToDisplay].sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Calculate pagination
    const total = sorted.length;
    const pages = Math.ceil(total / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = sorted.slice(startIndex, endIndex);

    return {
      paginatedUnits: paginated,
      totalPages: pages,
      totalUnits: total
    };
  }, [allUnits, warehouseGroups, selectedWarehouse, sortBy, sortDirection, currentPage, itemsPerPage]);

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

  const handleEdit = (unit: StorageUnit) => {
    // Transform StorageUnit to UnitData for the modal
    const unitData: UnitData = {
      id: unit.id,
      unitNumber: unit.unitNumber,
      size: unit.size,
      floor: unit.floor,
      status: unit.status,
      warehouseId: unit.warehouseId,
      warehouseName: unit.warehouseName,
      pricePerDay: unit.pricePerDay,
      totalSpaceOccupied: unit.totalSpaceOccupied,
    };
    setEditingUnit(unitData);
  };

  const updateUnit = (updatedUnit: UnitData) => {
    // Update in allUnits
    setAllUnits((prev) =>
      prev.map((unit) => 
        unit.id === updatedUnit.id 
          ? { ...unit, 
              unitNumber: updatedUnit.unitNumber,
              size: updatedUnit.size,
              floor: updatedUnit.floor,
              status: updatedUnit.status 
            }
          : unit
      )
    );
    
    // Update warehouse groups
    setWarehouseGroups((prev) => {
      const newGroups = { ...prev };
      Object.keys(newGroups).forEach(warehouseName => {
        newGroups[warehouseName] = newGroups[warehouseName].map(unit =>
          unit.id === updatedUnit.id 
            ? { ...unit, 
                unitNumber: updatedUnit.unitNumber,
                size: updatedUnit.size,
                floor: updatedUnit.floor,
                status: updatedUnit.status 
              }
            : unit
        );
      });
      return newGroups;
    });
  };

  // Custom delete handler that updates both allUnits and warehouseGroups
  const handleUnitDelete = (unitId: number) => {
    setAllUnits(prev => prev.filter(unit => unit.id !== unitId));
    setWarehouseGroups(prev => {
      const newGroups = { ...prev };
      Object.keys(newGroups).forEach(warehouseName => {
        newGroups[warehouseName] = newGroups[warehouseName].filter(unit => unit.id !== unitId);
      });
      return newGroups;
    });
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderFilterChip = (label: string, isSelected: boolean, onPress: () => void) => {
    // Show count for each warehouse
    const count = label === 'All' ? allUnits.length : (warehouseGroups[label]?.length || 0);
    
    return (
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
          {label} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  const handleDelete = async (id: number) => {
  await baseHandleDelete(id, setAllUnits);
  handleUnitDelete(id);
};
  const renderRightActions = (item: StorageUnit, close: () => void) => (
    <View style={[styles.actionsContainer, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.actionButton, styles.editButton]}
        onPress={() => {
          close();
          handleEdit(item);
        }}
      >
        <Text style={styles.actionText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() => {
          close();
  handleDelete(item.id); // Remove the second parameter
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
      <AnimatedDeleteWrapper
        itemId={item.id}
        removingId={removingId}
        onDelete={(id) => handleDelete(id)}
        deleteTitle="Delete Storage Unit"
        itemName={item.unitNumber}
      >
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
                  <Text style={[styles.unitId, { color: colors.text }]}>{item.unitNumber}</Text>
                  <Text style={[styles.unitLocation, { color: colors.subtext }]}>
                    {item.warehouseName} • {item.floor} Floor • {item.size} sqft
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
      </AnimatedDeleteWrapper>
    );
  };

  const renderHeader = () => (
    <View style={[styles.headerContainer, { backgroundColor: colors.card }]}>
      {/* Warehouse Filter */}
      <View style={styles.filterContainer}>
        <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Warehouse</Text>
        <View style={styles.filterChipsContainer}>
          {/* Add 'All' option */}
          {renderFilterChip(
            'All',
            selectedWarehouse === 'All',
            () => setSelectedWarehouse('All')
          )}
          {warehouses.map((warehouse) =>
            renderFilterChip(
              warehouse,
              selectedWarehouse === warehouse,
              () => setSelectedWarehouse(warehouse)
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
          {showFilters ? '▼' : '▶'} Sort Options
        </Text>
      </TouchableOpacity>

      {/* Sort Options */}
      {showFilters && (
        <View style={styles.advancedFiltersContainer}>
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Sort by:</Text>
            <View style={styles.sortContainer}>
              <TouchableOpacity
                onPress={() => setSortBy('unitNumber')}
                style={[
                  styles.sortButton,
                  {
                    backgroundColor: sortBy === 'unitNumber' ? colors.primary : (dark ? colors.border : '#F2F2F7'),
                    borderColor: sortBy === 'unitNumber' ? colors.primary : colors.border
                  }
                ]}
              >
                <Text style={[
                  styles.sortButtonText,
                  { color: sortBy === 'unitNumber' ? '#FFFFFF' : colors.text }
                ]}>
                  Unit Number
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

          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Direction:</Text>
            <TouchableOpacity
              onPress={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              style={[styles.sortDirectionButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.sortDirectionText}>
                {sortDirection === 'asc' ? 'up' : 'down'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Results Summary */}
      <View style={[styles.resultsSummary, { borderTopColor: colors.border }]}>
        <Text style={[styles.resultsText, { color: colors.subtext }]}>
          {totalUnits} total units • Page {currentPage} of {totalPages}
        </Text>
      </View>
    </View>
  );

  if (initialLoad) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.appHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.appTitle, { color: colors.text }]}>Storage Units</Text>
        </View>
        <View style={styles.initialLoadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading storage units...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.appHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.appTitle, { color: colors.text }]}>Storage Units</Text>
      </View>

      <FlatList
        data={paginatedUnits}
        renderItem={renderStorageUnit}
        keyExtractor={(item) => item.id.toString()}
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
        ListFooterComponent={() => (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            loading={loading}
            colors={colors}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
          />
        )}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading...
          </Text>
        </View>
      )}

      {/* Edit Modal */}
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
  filterContainer: {
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
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap:'wrap',
    gap: 8,
    flex: 2,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortDirectionButton: {
    width: 50,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortDirectionText: {
    fontSize: 16,
    color: '#FFFFFF',
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
  initialLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    fontSize: 14,
    marginLeft: 8,
  },
});

export default UnitList;