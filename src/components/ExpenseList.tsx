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
import EditExpenseModal from './modals/EditExpenseModal';

interface Expense {
  id: number;
  expenseType: string;
  amount: string;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deleted: 0 | 1;
  userId: number;
  warehouseId: number;
  warehouse: {
    name: string;
  };
  user: {
    email: string;
  };
}

interface ExpenseItemProps {
  item: Expense;
  index: number;
  removingId: number | null;
  colors: any;
  dark: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ 
  item: expense, 
  index, 
  removingId, 
  colors, 
  dark, 
  onEdit, 
  onDelete 
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (removingId === expense.id) {
      Animated.timing(slideAnim, {
        toValue: -500,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [removingId, expense.id, slideAnim]);

  const getExpenseTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'rent': return '#2196F3';
      case 'supplies': return '#4CAF50';
      default: return '#FF9800';
    }
  };

  const getExpenseIcon = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'rent': return 'home';
      case 'supplies': return 'inventory';
      default: return 'receipt';
    }
  };

  const formatAmount = (amount: string): string => {
    return `$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getInitials = (description: string): string => {
    return description
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense.description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(expense.id) },
      ]
    );
  };

  return (
    <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
      <TouchableOpacity
        style={[styles.expenseCard, { backgroundColor: "white", borderWidth: 0}]}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: getExpenseTypeColor(expense.expenseType) }]}>
              <MaterialIcons 
                name={getExpenseIcon(expense.expenseType) as any} 
                size={24} 
                color="white" 
              />
            </View>
            <View
              style={[
                styles.typeIndicator,
                { backgroundColor: getExpenseTypeColor(expense.expenseType), borderColor: colors.card },
              ]}
            />
          </View>

          <View style={styles.expenseInfo}>
            <Text style={[styles.expenseDescription, { color: colors.text }]} numberOfLines={1}>
              {expense.description}
            </Text>
            <Text style={[styles.expenseAmount, { color: getExpenseTypeColor(expense.expenseType) }]} numberOfLines={1}>
              {formatAmount(expense.amount)}
            </Text>
            <Text style={[styles.expenseDetails, { color: colors.subtext }]}>
              Category: {expense.expenseType.charAt(0).toUpperCase() + expense.expenseType.slice(1)}
            </Text>
            <Text style={[styles.expenseDetails, { color: colors.subtext }]}>
              Date: {formatDate(expense.date)}
            </Text>
            <Text style={[styles.expenseDetails, { color: colors.subtext }]}>
              Warehouse: {expense.warehouse.name}
            </Text>
            <Text style={[styles.expenseDetails, { color: colors.subtext }]}>
              Created: {formatDate(expense.createdAt)}
            </Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: dark ? colors.border : '#f8f9fa' }]}
              onPress={() => onEdit(expense)}
            >
              <MaterialIcons name="edit" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: dark ? colors.border : '#f8f9fa' }]}
              onPress={handleDelete}
            >
              <MaterialIcons name="delete" size={20} color={colors.notification} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.typeBadge, { backgroundColor: getExpenseTypeColor(expense.expenseType) + '20' }]}>
            <Text style={[styles.typeText, { color: getExpenseTypeColor(expense.expenseType) }]}>
              {expense.expenseType.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.expenseId, { color: colors.subtext }]}>ID: {expense.id}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ExpenseList: React.FC = () => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [search, setSearch] = useState('');
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
  }, [searchDebounced]);

  useEffect(() => {
    fetchExpenses(page);
  }, [page, searchDebounced]);

  const fetchExpenses = async (pg: number) => {
    setLoading(true);
    setExpenses([]);
    
    try {
      const queryParams = new URLSearchParams({
        page: pg.toString(),
        limit: '20',
      });

      if (searchDebounced.trim()) {
        queryParams.append('search', searchDebounced.trim());
      }

      const endpoint = `/expenses?${queryParams.toString()}`;
      const res = await get(endpoint);
      
      if (res?.status === 'success') {
        setExpenses(res.data.expenses || []);
        setTotalPages(parseInt(res.data.pagination.totalPages) || 1);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
      setTotalPages(1);
    }
    
    setLoading(false);
    if (initialLoad) {
      setInitialLoad(false);
    }
  };

  const handleDelete = async (id: number) => {
    setRemovingId(id);
    await new Promise((resolve) => setTimeout(resolve, 250));
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    await deleteRequest(`/expenses/${id}`);
    setRemovingId(null);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const updateExpense = (updated: Expense) => {
    setExpenses((prev) =>
      prev.map((expense) => (expense.id === updated.id ? { ...expense, ...updated } : expense))
    );
  };

  const displayExpenses = useMemo(() => {
    return expenses;
  }, [expenses]);

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

  const renderExpenseCard = ({ item, index }: { item: Expense; index: number }) => (
    <ExpenseItem
      item={item}
      index={index}
      removingId={removingId}
      colors={colors}
      dark={dark}
      onEdit={handleEdit}
      onDelete={handleDelete}
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
      <MaterialIcons name="receipt-long" size={64} color={colors.subtext} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {searchDebounced ? 'No expenses found' : 'No expenses available'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
        {searchDebounced ? 'Try adjusting your search' : 'Add some expenses to get started'}
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
            Loading expenses...
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
          placeholder="Search expenses..."
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

      {/* List */}
      <FlatList
        data={displayExpenses}
        renderItem={renderExpenseCard}
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
      {editingExpense && (
        <EditExpenseModal
          visible={true}
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSaveSuccess={(updated) => {
            updateExpense(updated);
            setEditingExpense(null);
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
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  expenseCard: {
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
  typeIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  expenseInfo: {
    flex: 1,
    marginRight: 8,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  expenseDetails: {
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
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  expenseId: {
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

export default ExpenseList;