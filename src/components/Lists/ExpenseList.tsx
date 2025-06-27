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
import Pagination from './../Reusable/Pagination';
import AnimatedDeleteWrapper, { useAnimatedDelete } from './../Reusable/AnimatedDeleteWrapper';
import { useTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useGet } from '../../hooks/useGet';
import { useDelete } from '../../hooks/useDelete';
import { lightColors, darkColors } from '../../constants/color';
import EditExpenseModal from './../modals/EditExpenseModal';
import ExpenseItem from './../Items/ExpenseItem';
import {Expense} from '../../types/Expenses';

  const ExpenseList: React.FC = () => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  const { get } = useGet();
  const { del: deleteRequest } = useDelete();

  // Use the custom hook for animated delete
  const { removingId, handleDelete } = useAnimatedDelete<Expense>(deleteRequest, '/expenses');

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
    <AnimatedDeleteWrapper
      itemId={item.id}
      removingId={removingId}
      onDelete={(id) => handleDelete(id, setExpenses)}
      deleteTitle="Delete Expense"
      itemName={item.description}
      animationDuration={300}
      slideDistance={-500}
    >
      <ExpenseItem
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