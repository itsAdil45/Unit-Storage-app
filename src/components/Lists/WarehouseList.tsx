import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGet } from '../../hooks/useGet';
import { useDelete } from '../../hooks/useDelete';
import { lightColors, darkColors } from '../../constants/color';
import AddWarehouseModal from '../modals/AddWarehouseModal';
import EditWarehouseModal from '../modals/EditWarehouseModal';
import AnimatedDeleteWrapper, { useAnimatedDelete } from '../Reusable/AnimatedDeleteWrapper';
import Pagination from '../Reusable/Pagination';
import WarehouseItem from '../Items/WarehouseItem';
import {Warehouse } from '../../types/Warehouses';



const WarehouseList: React.FC = () => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const { get } = useGet();
  const { del: deleteRequest } = useDelete();

  // Use the custom hook for animated delete
  const { removingId, handleDelete } = useAnimatedDelete<Warehouse>(deleteRequest, '/warehouses');

  useEffect(() => {
    fetchWarehouses(page);
  }, [page]);

  const fetchWarehouses = async (pg: number) => {
    setLoading(true);
    setWarehouses([]);
    
    try {
      const endpoint = `/warehouses?page=${pg}&limit=20`;
      const res = await get(endpoint);
      
      if (res?.status === 'success') {
        const warehousesData = res.data?.warehouses || [];
        setWarehouses(Array.isArray(warehousesData) ? warehousesData : []);
        setTotalPages(parseInt(res.data?.pagination?.totalPages) || 1);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      setWarehouses([]);
      setTotalPages(1);
    }
    
    setLoading(false);
    if (initialLoad) {
      setInitialLoad(false);
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
  };

  const updateWarehouse = (updated: Warehouse) => {
    setWarehouses((prev) =>
      prev.map((warehouse) => (warehouse.id === updated.id ? { ...warehouse, ...updated } : warehouse))
    );
  };

  const addWarehouse = (newWarehouse: Warehouse) => {
    setWarehouses((prev) => [newWarehouse, ...prev]);
  };

  const displayWarehouses = useMemo(() => {
    return warehouses || [];
  }, [warehouses]);

  const handlePreviousPage = () => {
    if (page > 1 && !loading) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages && !loading) {
      setPage(page + 1);
    }
  };

  const renderWarehouseCard = ({ item, index }: { item: Warehouse; index: number }) => (
    <AnimatedDeleteWrapper
      itemId={item.id}
      removingId={removingId}
      onDelete={(id) => handleDelete(id, setWarehouses)}
      deleteTitle="Delete Warehouse"
      itemName={item.name}
      animationDuration={300}
      slideDistance={-500}
    >
      <WarehouseItem
        item={item}
        index={index}
        colors={colors}
        dark={dark}
        onEdit={handleEdit}
        onDeletePress={() => {}} // This will be overridden by AnimatedDeleteWrapper
      />
    </AnimatedDeleteWrapper>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="warehouse" size={64} color={colors.subtext} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No warehouses available
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
        Add some warehouses to get started
      </Text>
    </View>
  );

  if (initialLoad) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />
        <View style={styles.initialLoadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading warehouses...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />
      
      {/* Header with Add Button */}
      <View style={[styles.headerContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Warehouses</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Add Warehouse</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={displayWarehouses}
        renderItem={renderWarehouseCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        scrollEnabled={!loading}
        showsVerticalScrollIndicator={false}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading...
          </Text>
        </View>
      )}

      {/* Pagination Component */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        loading={loading}
        colors={colors}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />

      {/* Add Modal */}
      <AddWarehouseModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaveSuccess={(newWarehouse) => {
          addWarehouse(newWarehouse);
          setShowAddModal(false);
        }}
      />

      {/* Edit Modal */}
      {editingWarehouse && (
        <EditWarehouseModal
          visible={true}
          warehouse={editingWarehouse}
          onClose={() => setEditingWarehouse(null)}
          onSaveSuccess={(updated) => {
            updateWarehouse(updated);
            setEditingWarehouse(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  warehouseCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },  
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default WarehouseList;