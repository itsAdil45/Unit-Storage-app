import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  FlatList,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { lightColors, darkColors } from '../../constants/color';
import { FilterType } from '../../types/Types';
import EmailLogModal from '../modals/EmailLogModal';
import EditCustomerModal from '../modals/EditCustomerModal';
import AnimatedDeleteWrapper, {
} from '../Reusable/AnimatedDeleteWrapper';
import LoadMorePagination from '../Reusable/LoadMorePagination';
import CustomerItem from '../Items/CustomerItem';
import { Customer } from '../../types/Customers';
import styles from './Styles/CustomersList';
import { useListData } from '../../hooks/useListData';
const CustomersList = ({ refresh }: { refresh: number }) => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('All');
  const [searchDebounced, setSearchDebounced] = useState('');

  const {
    items: customers,
    setItems: setCustomers,
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
  } = useListData<Customer>({
    endpoint: '/customers',
    searchDebounced,
    filter: statusFilter === 'Inactive' ? '1' : statusFilter === 'Active' ? '0' : undefined,
    refresh,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 50);
    return () => clearTimeout(timer);
  }, [search]);


  const handleEmailModal = (userId: number) => {
    setSelectedUserId(userId);
    setEmailModalVisible(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
  };

  const updateCustomer = (updated: Customer) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === updated.id ? { ...customer, ...updated } : customer,
      ),
    );
  };

  const displayCustomers = useMemo(() => {
    return customers;
  }, [customers]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
  };

  const clearSearch = () => {
    setSearch('');
    setSearchDebounced('');
  };

  const handleStatusFilter = (filter: FilterType) => {
    setStatusFilter(filter);
  };

  const renderFilterChip = (
    label: string,
    value: FilterType,
    color?: string,
  ) => (
    <TouchableOpacity
      key={value}
      onPress={() => handleStatusFilter(value)}
      style={[
        styles.filterChip,
        {
          backgroundColor:
            statusFilter === value ? colors.primary : colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.filterText,
          { color: statusFilter === value ? '#fff' : colors.text },
        ]}
      >
        {label}
      </Text>
      {color && statusFilter === value && (
        <View style={[styles.colorDot, { backgroundColor: color }]} />
      )}
    </TouchableOpacity>
  );

  const renderUserCard = ({
    item,
    index,
  }: {
    item: Customer;
    index: number;
  }) => (
    <AnimatedDeleteWrapper
      itemId={item.id}
      removingId={removingId}
      onDelete={handleDelete}
      deleteTitle="Delete Customer"
      itemName={`${item.firstName} ${item.lastName}`}
    >
      <CustomerItem
        item={item}
        index={index}
        colors={colors}
        dark={dark}
        onEdit={handleEdit}
        onEmail={handleEmailModal}
        onDeletePress={() => {}} 
      />
    </AnimatedDeleteWrapper>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="people-outline" size={64} color={colors.subtext} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {searchDebounced ? 'No customers found' : 'No customers available'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
        {searchDebounced
          ? 'Try adjusting your search or filters'
          : 'Add some customers to get started'}
      </Text>
    </View>
  );

  if (initialLoad) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>

        <View style={styles.initialLoadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading customers...
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
          styles.searchContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <MaterialIcons name="search" size={20} color={colors.subtext} />
        <TextInput
          value={search}
          onChangeText={handleSearchChange}
          placeholder="Search customers..."
          placeholderTextColor={colors.subtext}
          style={[styles.searchInput, { color: colors.text }]}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <MaterialIcons name="clear" size={20} color={colors.subtext} />
          </TouchableOpacity>
        )}
      </View>

      {searchDebounced && (
        <View style={styles.searchIndicator}>
          <Text style={[styles.searchIndicatorText, { color: colors.subtext }]}>
            Searching for: "{searchDebounced}"
          </Text>
        </View>
      )}

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Filter:
        </Text>
        <View style={styles.chipsRow}>
          {renderFilterChip('All', 'All')}
          {renderFilterChip('Active', 'Active', '#4CAF50')}
          {renderFilterChip('Inactive', 'Inactive', '#FF9800')}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={displayCustomers}
        renderItem={renderUserCard}
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
            currentItemCount={displayCustomers.length}
          />
        }
      />

      {/* Edit Modal */}
      {editingCustomer && (
        <EditCustomerModal
          visible={true}
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSaveSuccess={(updated) => {
            updateCustomer(updated);
            setEditingCustomer(null);
          }}
        />
      )}

      {/* Email Modal */}
      {emailModalVisible && selectedUserId && (
        <EmailLogModal
          visible={emailModalVisible}
          userId={selectedUserId}
          onClose={() => {
            setEmailModalVisible(false);
            setSelectedUserId(null);
          }}
        />
      )}
    </View>
  );
};

export default CustomersList;