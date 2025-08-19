import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTheme } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { lightColors, darkColors } from '../../constants/color';
import AddWarehouseModal from '../modals/AddWarehouseModal';
import EditWarehouseModal from '../modals/EditWarehouseModal';
import AnimatedDeleteWrapper from '../Reusable/AnimatedDeleteWrapper';
import LoadMorePagination from '../Reusable/LoadMorePagination';
import WarehouseItem from '../Items/WarehouseItem';
import { Warehouse } from '../../types/Warehouses';
import styles from './Styles/WarehouseList';
import { useListData } from '../../hooks/useListData';

const WarehouseList: React.FC = () => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;

  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const {
    items: warehouses,
    setItems: setWarehouses,
    page,
    totalPages,
    totalItems,
    loading,
    loadingMore,
    refreshing,
    initialLoad,
    removingId,
    handleLoadMore,
    onRefresh,
    handleDelete,
    addItem: addWarehouse,
    updateItem: updateWarehouse,
    resetAndFetch,
  } = useListData<Warehouse>({
    endpoint: '/warehouses',
    limit: 20, 
    dataKey: 'warehouses', 
  });

  useFocusEffect(
    useCallback(() => {
      resetAndFetch();
    }, [resetAndFetch])
  );

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
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
      onDelete={handleDelete}
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
        data={warehouses}
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
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.card}
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
            currentItemCount={warehouses.length}
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