import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  FlatList,
  TextInput,
  Animated,
  Alert,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGet } from '../hooks/useGet';
import { useDelete } from '../hooks/useDelete';
import { lightColors, darkColors } from '../constants/color';
import { FilterType } from '../types/Types';
import EmailLogModal from './modals/EmailLogModal';
import EditCustomerModal from './modals/EditCustomerModal';
interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  inquiry: string;
  address: string;
  createdAt: string;
  deleted: 0 | 1;
}

interface CustomerItemProps {
  item: Customer;
  index: number;
  removingId: number | null;
  colors: any;
  dark: boolean;
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
    onEmail: (userId: number) => void; // Add this line

  
}

// Customer Item Component
const CustomerItem: React.FC<CustomerItemProps> = ({ 
  item: user, 
  index, 
  removingId, 
  colors, 
  dark, 
  onEdit, 
  onDelete ,
  onEmail

}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (removingId === user.id) {
      Animated.timing(slideAnim, {
        toValue: -500,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [removingId, user.id, slideAnim]);

  const getStatusColor = (deleted: number): string =>
    deleted === 0 ? '#4CAF50' : '#FF9800';

  const getInitials = (name: string): string =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const fullName = `${user.firstName} ${user.lastName}`;
  const status = user.deleted === 0 ? 'Active' : 'Inactive';

  const handleDelete = () => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(user.id) },
      ]
    );
  };

  return (
    <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
      <TouchableOpacity
        style={[styles.userCard, { backgroundColor: "white", borderWidth: 0}]}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.card }]}>{getInitials(fullName)}</Text>
            </View>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(user.deleted), borderColor: colors.card },
              ]}
            />
          </View>

          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>{fullName}</Text>
            <Text style={[styles.userEmail, { color: colors.subtext }]} numberOfLines={1}>{user.email}</Text>
            <Text style={[styles.lastSeen, { color: colors.subtext }]}>Phone: {user.phone}</Text>
            <Text style={[styles.lastSeen, { color: colors.subtext }]}>Inquiry #: {user.inquiry}</Text>
            <Text style={[styles.lastSeen, { color: colors.subtext }]}>Address: {user.address}</Text>
            <Text style={[styles.lastSeen, { color: colors.subtext }]}>
              Created At: {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: dark ? colors.border : '#f8f9fa' }]}
              onPress={() => onEdit(user)}
            >
              <MaterialIcons name="edit" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: dark ? colors.border : '#f8f9fa' }]}
              onPress={handleDelete}
            >
              <MaterialIcons name="delete" size={20} color={colors.notification} />
            </TouchableOpacity>
<TouchableOpacity
  style={[styles.actionButton, { backgroundColor: dark ? colors.border : '#f8f9fa' }]}
  onPress={() => onEmail(user.id)}
>
  <MaterialCommunityIcons name="email-outline" size={20} color={colors.primary} />
</TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.deleted) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(user.deleted) }]}>{status}</Text>
          </View>
          <Text style={[styles.userId, { color: colors.subtext }]}>ID: {user.id}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const UserList: React.FC = () => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('All');
  const [searchDebounced, setSearchDebounced] = useState('');

  const { get } = useGet();
  const { del: deleteRequest } = useDelete();

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
  const handleDelete = async (id: number) => {
    setRemovingId(id);
    await new Promise((resolve) => setTimeout(resolve, 250));
    setCustomers((prev) => prev.filter((customer) => customer.id !== id));
    await deleteRequest(`/customers/${id}`);
    setRemovingId(null);
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
  <CustomerItem
    item={item}
    index={index}
    removingId={removingId}
    colors={colors}
    dark={dark}
    onEdit={handleEdit}
    onDelete={handleDelete}
    onEmail={handleEmailModal} // Add this line
  />
);
  const renderNavigationButtons = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            {
              backgroundColor: page > 1 && !loading ? colors.primary : colors.border,
              borderColor: colors.border,
            },
          ]}
          onPress={handlePreviousPage}
          disabled={page <= 1 || loading}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name="chevron-left" 
            size={20} 
            color={page > 1 && !loading ? '#fff' : colors.subtext} 
          />
          <Text 
            style={[
              styles.navButtonText, 
              { color: page > 1 && !loading ? '#fff' : colors.subtext }
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <View style={styles.pageInfo}>
          <Text style={[styles.pageText, { color: colors.text }]}>
            Page {page} of {totalPages}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.navButton,
            {
              backgroundColor: page < totalPages && !loading ? colors.primary : colors.border,
              borderColor: colors.border,
            },
          ]}
          onPress={handleNextPage}
          disabled={page >= totalPages || loading}
          activeOpacity={0.7}
        >
          <Text 
            style={[
              styles.navButtonText, 
              { color: page < totalPages && !loading ? '#fff' : colors.subtext }
            ]}
          >
            Next
          </Text>
          <MaterialIcons 
            name="chevron-right" 
            size={20} 
            color={page < totalPages && !loading ? '#fff' : colors.subtext} 
          />
        </TouchableOpacity>
      </View>
    );
  };

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

      {renderNavigationButtons()}

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
  userCard: {
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
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
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
  userInfo: {
    flex: 1,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    marginBottom: 2,
  },
  lastSeen: {
    fontSize: 11,
    marginBottom: 1,
  },
  cardActions: {
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'flex-start',
  },
  actionButton: {
    padding: 6,
    borderRadius: 8,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  userId: {
    fontSize: 11,
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 90,
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  pageInfo: {
    flex: 1,
    alignItems: 'center',
  },
  pageText: {
    fontSize: 14,
    fontWeight: '500',
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

export default UserList;