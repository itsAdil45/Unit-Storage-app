import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  FlatList,
  RefreshControl, // Add this import
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
import LoadMorePagination from '../Reusable/LoadMorePagination';
import WarehouseItem from '../Items/WarehouseItem';
import { Warehouse } from '../../types/Warehouses';
import styles from './Styles/WarehouseList';

const WarehouseList: React.FC = () => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // Add refreshing state
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
    if (page === 1) {
      fetchWarehouses(1, false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Reset and fetch fresh data when screen comes into focus
      setPage(1);
      setWarehouses([]);
      fetchWarehouses(1, false);
    }, []),
  );

  const fetchWarehouses = async (pg: number, isLoadMore: boolean = false, isRefresh: boolean = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
      if (pg === 1) {
        setWarehouses([]);
      }
    }

    try {
      const endpoint = `/warehouses?page=${pg}&limit=20`;
      const res = await get(endpoint);

      if (res?.status === 'success') {
        const warehousesData = res.data?.warehouses || [];
        const newWarehouses = Array.isArray(warehousesData)
          ? warehousesData
          : [];

        if (isLoadMore) {
          // Append new items to existing ones
          setWarehouses((prev) => [...prev, ...newWarehouses]);
        } else {
          // Replace existing items (for refresh or initial load)
          setWarehouses(newWarehouses);
        }

        setTotalPages(parseInt(res.data?.pagination?.totalPages) || 1);
        setTotalItems(parseInt(res.data?.pagination?.total) || 0);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      if (!isLoadMore) {
        setWarehouses([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    }

    if (isLoadMore) {
      setLoadingMore(false);
    } else if (isRefresh) {
      setRefreshing(false);
    } else {
      setLoading(false);
      if (initialLoad) {
        setInitialLoad(false);
      }
    }
  };

  // Add pull to refresh handler
  const onRefresh = useCallback(() => {
    setPage(1);
    fetchWarehouses(1, false, true);
  }, []);

  const handleLoadMore = () => {
    if (page < totalPages && !loading && !loadingMore && !refreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchWarehouses(nextPage, true);
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
    setTotalItems((prev) => prev + 1);
  };

  const displayWarehouses = useMemo(() => {
    return warehouses || [];
  }, [warehouses]);

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
      onDelete={(id) => {
        handleDelete(id, setWarehouses);
        setTotalItems((prev) => prev - 1);
      }}
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
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, zIndex: 120 },
        ]}
      >
        {/* <StatusBar
          barStyle={dark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.card}
        /> */}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]} // Android
            tintColor={colors.primary} // iOS
            progressBackgroundColor={colors.card} // Android background
          />
        }
        ListFooterComponent={
          <LoadMorePagination
            currentPage={page}
            totalPages={totalPages}
            loading={loading}
            loadingMore={loadingMore}
            colors={colors}
            onLoadMore={handleLoadMore}
            showItemCount={true}
            totalItems={totalItems}
            currentItemCount={displayWarehouses.length}
          />
        }
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