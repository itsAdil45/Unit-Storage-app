import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';
import { UnitData } from '../../types/Types';
import { warehouses } from '../../Utils/Filters';
import { useGet } from '../../hooks/useGet';
import { useDelete } from '../../hooks/useDelete';
import { useAnimatedDelete } from '../Reusable/AnimatedDeleteWrapper';
import EditUnitModal from '../modals/EditUnitModal';
import LoadMorePagination from '../Reusable/LoadMorePagination';
import UnitItem, { StorageUnit } from '../Items/UnitItem';
import UnitStatsCards from '../UnitStatsCards';
import styles from './Styles/UnitList';

type WarehouseGroup = {
  [warehouseName: string]: StorageUnit[];
};

type UnitOverviewData = {
  checkingOut: number;
  empty: number;
  occupied: number;
  overdue: number;
  total: number;
};

const UnitList = ({ refresh }: { refresh: number }) => {
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  const [sortBy, setSortBy] = useState<
    'unitNumber' | 'percentage' | 'customers'
  >('unitNumber');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<StorageUnit | null>(null);

  const [allUnits, setAllUnits] = useState<StorageUnit[]>([]);
  const [warehouseGroups, setWarehouseGroups] = useState<WarehouseGroup>({});
  const [unitOverviewData, setUnitOverviewData] =
    useState<UnitOverviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [editingUnit, setEditingUnit] = useState<UnitData | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [displayedUnits, setDisplayedUnits] = useState<StorageUnit[]>([]);
  const itemsPerPage = 20;

  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;

  const { get } = useGet();
  const { del: deleteRequest } = useDelete();

  const { removingId, handleDelete: baseHandleDelete } =
    useAnimatedDelete<StorageUnit>(deleteRequest, '/storage-units');

  // Reset pagination when warehouse changes
  useEffect(() => {
    setCurrentPage(1);
    setDisplayedUnits([]);
  }, [selectedWarehouse]);

  useEffect(() => {
    fetchAllUnits();
    fetchUnitsOverview();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      fetchAllUnits();
      fetchUnitsOverview();
    }, []),
  );

  const fetchUnitsOverview = async () => {
    try {
      const endpoint = `/dashboard/storageOverview`;
      const res = await get(endpoint);

      if (res?.status === 'success') {
        setUnitOverviewData(res.data);
      }
    } catch (error) {
      console.error('Error fetching unit overview:', error);
      setUnitOverviewData(null);
    }
  };

  const fetchAllUnits = async () => {
    setLoading(true);
    try {
      const endpoint = `/storage-units?limit=1000`;
      const res = await get(endpoint);

      if (res?.status === 'success') {
        const processedUnits = res.data.units.map(
          (apiUnit: any): StorageUnit => {
            const totalBookings = apiUnit.bookings?.length || 0;
            const totalCustomers = new Set(
              apiUnit.bookings?.map((b: any) => b.customerId) || [],
            ).size;
            const occupancyPercentage = apiUnit.totalSpaceOccupied
              ? Math.round((apiUnit.totalSpaceOccupied / apiUnit.size) * 100)
              : 0;

            return {
              ...apiUnit,
              percentage: occupancyPercentage,
              customers: totalCustomers,
            };
          },
        );

        setAllUnits(processedUnits);

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

  const { sortedUnits, totalUnits, totalPages } = useMemo(() => {
    let unitsToDisplay: StorageUnit[] = [];

    if (selectedWarehouse === 'All') {
      unitsToDisplay = allUnits;
    } else {
      unitsToDisplay = warehouseGroups[selectedWarehouse] || [];
    }

    const sorted = [...unitsToDisplay].sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const total = sorted.length;
    const pages = Math.ceil(total / itemsPerPage);

    return {
      sortedUnits: sorted,
      totalUnits: total,
      totalPages: pages,
    };
  }, [
    allUnits,
    warehouseGroups,
    selectedWarehouse,
    sortBy,
    sortDirection,
    itemsPerPage,
  ]);

  // Update displayed units when sorted units change
  useEffect(() => {
    if (sortedUnits.length > 0) {
      const initialUnits = sortedUnits.slice(0, itemsPerPage);
      setDisplayedUnits(initialUnits);
      setCurrentPage(1);
    } else {
      setDisplayedUnits([]);
    }
  }, [sortedUnits]);

  const handleLoadMore = useCallback(() => {
    if (currentPage >= totalPages || loadingMore) return;

    setLoadingMore(true);

    // Simulate loading delay (remove in production if not needed)
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newUnits = sortedUnits.slice(startIndex, endIndex);

      setDisplayedUnits((prevUnits) => [...prevUnits, ...newUnits]);
      setCurrentPage(nextPage);
      setLoadingMore(false);
    }, 50);
  }, [currentPage, totalPages, loadingMore, sortedUnits, itemsPerPage]);

  const handleEdit = (unit: StorageUnit) => {
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
    setAllUnits((prev) =>
      prev.map((unit) =>
        unit.id === updatedUnit.id
          ? {
              ...unit,
              unitNumber: updatedUnit.unitNumber,
              size: updatedUnit.size,
              floor: updatedUnit.floor,
              status: updatedUnit.status,
            }
          : unit,
      ),
    );

    setWarehouseGroups((prev) => {
      const newGroups = { ...prev };
      Object.keys(newGroups).forEach((warehouseName) => {
        newGroups[warehouseName] = newGroups[warehouseName].map((unit) =>
          unit.id === updatedUnit.id
            ? {
                ...unit,
                unitNumber: updatedUnit.unitNumber,
                size: updatedUnit.size,
                floor: updatedUnit.floor,
                status: updatedUnit.status,
              }
            : unit,
        );
      });
      return newGroups;
    });

    // Update displayed units as well
    setDisplayedUnits((prev) =>
      prev.map((unit) =>
        unit.id === updatedUnit.id
          ? {
              ...unit,
              unitNumber: updatedUnit.unitNumber,
              size: updatedUnit.size,
              floor: updatedUnit.floor,
              status: updatedUnit.status,
            }
          : unit,
      ),
    );
  };

  const handleUnitDelete = (unitId: number) => {
    setAllUnits((prev) => prev.filter((unit) => unit.id !== unitId));
    setDisplayedUnits((prev) => prev.filter((unit) => unit.id !== unitId));
    setWarehouseGroups((prev) => {
      const newGroups = { ...prev };
      Object.keys(newGroups).forEach((warehouseName) => {
        newGroups[warehouseName] = newGroups[warehouseName].filter(
          (unit) => unit.id !== unitId,
        );
      });
      return newGroups;
    });
  };

  const renderFilterChip = (
    label: string,
    isSelected: boolean,
    onPress: () => void,
  ) => {
    const count =
      label === 'All' ? allUnits.length : warehouseGroups[label]?.length || 0;

    return (
      <TouchableOpacity
        key={label}
        onPress={onPress}
        style={[
          styles.filterChip,
          {
            backgroundColor: isSelected
              ? colors.primary
              : dark
                ? colors.border
                : '#F2F2F7',
            borderColor: isSelected ? colors.primary : colors.border,
            zIndex: 120,
          },
        ]}
      >
        <Text
          style={[
            styles.filterChipText,
            {
              color: isSelected ? '#FFFFFF' : colors.text,
            },
          ]}
        >
          {label} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  const handleDelete = async (id: number) => {
    await baseHandleDelete(id, setAllUnits);
    handleUnitDelete(id);
  };

  const handleUnitPress = (unit: StorageUnit) => {
    setSelectedUnit(selectedUnit?.id === unit.id ? null : unit);
  };

  const renderStorageUnit = ({
    item,
    index,
  }: {
    item: StorageUnit;
    index: number;
  }) => (
    <UnitItem
      item={item}
      index={index}
      colors={colors}
      dark={dark}
      selectedUnit={selectedUnit}
      removingId={removingId}
      onUnitPress={handleUnitPress}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );

  const renderStatsCards = () => {
    if (!unitOverviewData) return null;

    const statsData = [
      {
        label: 'Total Units',
        value: unitOverviewData.total,
        iconColor: '#397AF9',
      },
      {
        label: 'Available Units',
        value: unitOverviewData.empty,
        iconColor: '#00B8D9',
      },
      {
        label: 'Occupied Units',
        value: unitOverviewData.occupied,
        iconColor: '#FFAB00',
      },
    ];

    return (
      <FlatList
        data={statsData}
        horizontal
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => (
          <UnitStatsCards
            label={item.label}
            value={item.value}
            iconColor={item.iconColor}
          />
        )}
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
      />
    );
  };

  const renderHeader = () => (
    <View style={[styles.headerContainer, { backgroundColor: colors.card }]}>
      {renderStatsCards()}

      <View style={styles.filterContainer}>
        <Text style={[styles.filterSectionTitle, { color: colors.text }]}>
          Warehouse
        </Text>
        <View style={styles.filterChipsContainer}>
          {renderFilterChip('All', selectedWarehouse === 'All', () =>
            setSelectedWarehouse('All'),
          )}
          {warehouses.map((warehouse) =>
            renderFilterChip(warehouse, selectedWarehouse === warehouse, () =>
              setSelectedWarehouse(warehouse),
            ),
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setShowFilters(!showFilters)}
        style={styles.advancedFiltersToggle}
      >
        <Text style={[styles.advancedFiltersText, { color: colors.primary }]}>
          {showFilters ? '▼' : '▶'} Sort Options
        </Text>
      </TouchableOpacity>

      {showFilters && (
        <View style={styles.advancedFiltersContainer}>
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>
              Sort by:
            </Text>
            <View style={styles.sortContainer}>
              <TouchableOpacity
                onPress={() => setSortBy('unitNumber')}
                style={[
                  styles.sortButton,
                  {
                    backgroundColor:
                      sortBy === 'unitNumber'
                        ? colors.primary
                        : dark
                          ? colors.border
                          : '#F2F2F7',
                    borderColor:
                      sortBy === 'unitNumber' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    {
                      color: sortBy === 'unitNumber' ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  Unit Number
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSortBy('percentage')}
                style={[
                  styles.sortButton,
                  {
                    backgroundColor:
                      sortBy === 'percentage'
                        ? colors.primary
                        : dark
                          ? colors.border
                          : '#F2F2F7',
                    borderColor:
                      sortBy === 'percentage' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    {
                      color: sortBy === 'percentage' ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  Occupancy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSortBy('customers')}
                style={[
                  styles.sortButton,
                  {
                    backgroundColor:
                      sortBy === 'customers'
                        ? colors.primary
                        : dark
                          ? colors.border
                          : '#F2F2F7',
                    borderColor:
                      sortBy === 'customers' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    { color: sortBy === 'customers' ? '#FFFFFF' : colors.text },
                  ]}
                >
                  Customers
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>
              Direction:
            </Text>
            <TouchableOpacity
              onPress={() =>
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
              }
              style={[
                styles.sortDirectionButton,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.sortDirectionText}>
                {sortDirection === 'asc' ? 'up' : 'down'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={[styles.resultsSummary, { borderTopColor: colors.border }]}>
        <Text style={[styles.resultsText, { color: colors.subtext }]}>
          {totalUnits} total units • Showing {displayedUnits.length} units
        </Text>
      </View>
    </View>
  );

  if (initialLoad) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <View
          style={[
            styles.appHeader,
            { backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <Text style={[styles.appTitle, { color: colors.text }]}>
            Storage Units
          </Text>
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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.appHeader,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.appTitle, { color: colors.text }]}>
          Storage Units
        </Text>
      </View>

      <FlatList
        data={displayedUnits}
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
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No units found
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
              Try adjusting your filters or search criteria
            </Text>
          </View>
        }
        ListFooterComponent={() => (
          <LoadMorePagination
            currentPage={currentPage}
            totalPages={totalPages}
            loading={loading}
            loadingMore={loadingMore}
            colors={colors}
            onLoadMore={handleLoadMore}
            showItemCount={true}
            totalItems={totalUnits}
            currentItemCount={displayedUnits.length}
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

export default UnitList;
