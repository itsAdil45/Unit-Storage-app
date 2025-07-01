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
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTheme } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGet } from '../../hooks/useGet';
import { useDelete } from '../../hooks/useDelete';
import { lightColors, darkColors } from '../../constants/color';
import AddWarehouseModal from '../modals/AddWarehouseModal';
import EditWarehouseModal from '../modals/EditWarehouseModal';
import AnimatedDeleteWrapper, {
  useAnimatedDelete,
} from '../Reusable/AnimatedDeleteWrapper';
import Pagination from '../Reusable/Pagination';
import WarehouseItem from '../Items/WarehouseItem';
import { Warehouse } from '../../types/Warehouses';
import styles from './Styles/WarehouseList';


const WarehouseList: React.FC = () => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null,
  );
  const [showAddModal, setShowAddModal] = useState(false);

  const { get } = useGet();
  const { del: deleteRequest } = useDelete();

  const { removingId, handleDelete } = useAnimatedDelete<Warehouse>(
    deleteRequest,
    '/warehouses',
  );

  useEffect(() => {
    fetchWarehouses(page);
  }, [page]);

  useFocusEffect(
    useCallback(() => {
      fetchWarehouses(1);
    }, []),
  );

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
      prev.map((warehouse) =>
        warehouse.id === updated.id ? { ...warehouse, ...updated } : warehouse,
      ),
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

  const renderWarehouseCard = ({
    item,
    index,
  }: {
    item: Warehouse;
    index: number;
  }) => (
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
        onDeletePress={() => {}} 
      />
    </AnimatedDeleteWrapper>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="warehouse"
        size={64}
        color={colors.subtext}
      />
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
        <StatusBar
          barStyle={dark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.card}
        />
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
      <StatusBar
        barStyle={dark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.card}
      />

      <View
        style={[
          styles.headerContainer,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Warehouses
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Add Warehouse</Text>
        </TouchableOpacity>
      </View>

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

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        loading={loading}
        colors={colors}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />

      <AddWarehouseModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaveSuccess={(newWarehouse) => {
          addWarehouse(newWarehouse);
          setShowAddModal(false);
        }}
      />

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


export default WarehouseList;
