import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  FlatList,
  TextInput,
} from 'react-native';
import LoadMorePagination from './../Reusable/LoadMorePagination'; // Updated import
import AnimatedDeleteWrapper, {
  useAnimatedDelete,
} from './../Reusable/AnimatedDeleteWrapper';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useGet } from '../../hooks/useGet';
import { useDelete } from '../../hooks/useDelete';
import { lightColors, darkColors } from '../../constants/color';
import EditExpenseModal from './../modals/EditExpenseModal';
import ExpenseItem from './../Items/ExpenseItem';
import { Expense } from '../../types/Expenses';
import styles from './Styles/ExpenseList';

const ExpenseList: React.FC = () => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  const { get } = useGet();
  const { del: deleteRequest } = useDelete();

  const { removingId, handleDelete } = useAnimatedDelete<Expense>(
    deleteRequest,
    '/expenses',
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!initialLoad) {
      // Reset to page 1 and clear existing data when search changes
      setPage(1);
      setExpenses([]);
      fetchExpenses(1, false);
    }
  }, [searchDebounced]);

  useEffect(() => {
    if (page === 1) {
      fetchExpenses(1, false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Reset and fetch fresh data when screen comes into focus
      setPage(1);
      setExpenses([]);
      fetchExpenses(1, false);
    }, []),
  );

  const fetchExpenses = async (pg: number, isLoadMore: boolean = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      if (pg === 1) {
        setExpenses([]);
      }
    }

    try {
      const queryParams = new URLSearchParams({
        page: pg.toString(),
        limit: '10',
      });

      if (searchDebounced.trim()) {
        queryParams.append('search', searchDebounced.trim());
      }

      const endpoint = `/expenses?${queryParams.toString()}`;
      const res = await get(endpoint);

      if (res?.status === 'success') {
        const expensesData = res.data.expenses || [];
        
        if (isLoadMore) {
          // Append new items to existing ones
          setExpenses(prev => [...prev, ...expensesData]);
        } else {
          // Replace existing items
          setExpenses(expensesData);
        }
        
        setTotalPages(parseInt(res.data.pagination.totalPages) || 1);
        setTotalItems(parseInt(res.data.pagination.total) || 0);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      if (!isLoadMore) {
        setExpenses([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    }

    if (isLoadMore) {
      setLoadingMore(false);
    } else {
      setLoading(false);
      if (initialLoad) {
        setInitialLoad(false);
      }
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchExpenses(nextPage, true);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const updateExpense = (updated: Expense) => {
    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === updated.id ? { ...expense, ...updated } : expense,
      ),
    );
  };

  const displayExpenses = useMemo(() => {
    return expenses;
  }, [expenses]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
  };

  const clearSearch = () => {
    setSearch('');
    setSearchDebounced('');
  };

  const renderExpenseCard = ({
    item,
    index,
  }: {
    item: Expense;
    index: number;
  }) => (
    <AnimatedDeleteWrapper
      itemId={item.id}
      removingId={removingId}
      onDelete={(id) => {
        handleDelete(id, setExpenses);
        setTotalItems(prev => prev - 1);
      }}
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
        {searchDebounced
          ? 'Try adjusting your search'
          : 'Add some expenses to get started'}
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
            Loading expenses...
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

      {searchDebounced && (
        <View style={styles.searchIndicator}>
          <Text style={[styles.searchIndicatorText, { color: colors.subtext }]}>
            Searching for: "{searchDebounced}"
          </Text>
        </View>
      )}

      <FlatList
        data={displayExpenses}
        renderItem={renderExpenseCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        scrollEnabled={!loading}
        showsVerticalScrollIndicator={false}
        // onEndReached={handleLoadMore}
        // onEndReachedThreshold={0.5}
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
            currentItemCount={displayExpenses.length}
          />
        }
      />

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

export default ExpenseList;