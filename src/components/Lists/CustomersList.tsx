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
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useGet } from '../../hooks/useGet';
import { useDelete } from '../../hooks/useDelete';
import { lightColors, darkColors } from '../../constants/color';
import { FilterType } from '../../types/Types';
import EmailLogModal from '../modals/EmailLogModal';
import EditCustomerModal from '../modals/EditCustomerModal';
import AnimatedDeleteWrapper, { useAnimatedDelete } from '../Reusable/AnimatedDeleteWrapper';
import Pagination from '../Reusable/Pagination';
import CustomerItem from '../Items/CustomerItem';
import {Customer} from "../../types/Customers"

const CustomersList: React.FC = () => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('All');
  const [searchDebounced, setSearchDebounced] = useState('');

  const { get } = useGet();
  const { del: deleteRequest } = useDelete();
  
  // Use the custom hook for animated delete
  const { removingId, handleDelete } = useAnimatedDelete<Customer>(
    deleteRequest,
    '/customers'
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!initialLoad) {
      setPage(1);
    }
  }, [searchDebounced, statusFilter]);

  useEffect(() => {
    fetchCustomers(page);
  }, [page, searchDebounced, statusFilter]);

  const fetchCustomers = async (pg: number) => {
    setLoading(true);
    setCustomers([]);
    
    try {
      const queryParams = new URLSearchParams({
        page: pg.toString(),
        limit: '20',
      });

      if (searchDebounced.trim()) {
        queryParams.append('search', searchDebounced.trim());
      }

      if (statusFilter !== 'All') {
        const statusValue = statusFilter === 'Active' ? '0' : '1';
        queryParams.append('filterStatus', statusValue);
      }

      const endpoint = `/customers?${queryParams.toString()}`;
      const res = await get(endpoint);
      
      if (res?.status === 'success') {
        setCustomers(res.data.customers || []);
        setTotalPages(parseInt(res.data.pagination.totalPages) || 1);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      setTotalPages(1);
    }
    
    setLoading(false);
    if (initialLoad) {
      setInitialLoad(false);
    }
  };

  const handleEmailModal = (userId: number) => {
    setSelectedUserId(userId);
    setEmailModalVisible(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
  };

  const updateCustomer = (updated: Customer) => {
    setCustomers((prev) =>
      prev.map((customer) => (customer.id === updated.id ? { ...customer, ...updated } : customer))
    );
  };

  const displayCustomers = useMemo(() => {
    return customers;
  }, [customers]);

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

  const renderFilterChip = (label: string, value: FilterType, color?: string) => (
    <TouchableOpacity
      key={value}
      onPress={() => handleStatusFilter(value)}
      style={[
        styles.filterChip,
        {
          backgroundColor: statusFilter === value ? colors.primary : colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[
        styles.filterText,
        { color: statusFilter === value ? '#fff' : colors.text }
      ]}>
        {label}
      </Text>
      {color && statusFilter === value && (
        <View style={[styles.colorDot, { backgroundColor: color }]} />
      )}
    </TouchableOpacity>
  );

  const renderUserCard = ({ item, index }: { item: Customer; index: number }) => (
    <AnimatedDeleteWrapper
      itemId={item.id}
      removingId={removingId}
      onDelete={(id) => handleDelete(id, setCustomers)}
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
        onDeletePress={() => {}} // This will be overridden by AnimatedDeleteWrapper
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
        {searchDebounced ? 'Try adjusting your search or filters' : 'Add some customers to get started'}
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
            Loading customers...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />
      
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
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

      {/* Search Indicator */}
      {searchDebounced && (
        <View style={styles.searchIndicator}>
          <Text style={[styles.searchIndicatorText, { color: colors.subtext }]}>
            Searching for: "{searchDebounced}"
          </Text>
        </View>
      )}

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Filter:</Text>
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
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            {searchDebounced ? 'Searching...' : 'Loading...'}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  searchIndicator: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  searchIndicatorText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  filtersContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 4,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
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

export default CustomersList;