import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  FlatList,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useListData } from '../../hooks/useListData';
import LoadMorePagination from '../Reusable/LoadMorePagination';
import AnimatedDeleteWrapper from '../Reusable/AnimatedDeleteWrapper';
import EditExpenseModal from '../modals/EditExpenseModal';
import ExpenseItem from '../Items/ExpenseItem';
import { Expense } from '../../types/Expenses';
import { lightColors, darkColors } from '../../constants/color';
import styles from './Styles/ExpenseList';

const ExpenseList = ({ refresh }: { refresh: number }) => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;

  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const {
    items: expenses,
    setItems: setExpenses,
    loading,
    loadingMore,
    refreshing,
    initialLoad,
    page,
    totalPages,
    totalItems,
    removingId,
    handleLoadMore,
    onRefresh,
    handleDelete
  } = useListData<Expense>({
    endpoint: '/expenses',
    searchDebounced,
    refresh
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
  };

  const clearSearch = () => {
    setSearch('');
    setSearchDebounced('');
  };

  // Expense management
  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const updateExpense = (updated: Expense) => {
    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === updated.id ? { ...expense, ...updated } : expense
      )
    );
  };

  const renderExpenseCard = ({ item, index }: { item: Expense; index: number }) => (
    <AnimatedDeleteWrapper
      itemId={item.id}
      removingId={removingId}
      onDelete={handleDelete}
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
        data={expenses}
        renderItem={renderExpenseCard}
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
            currentItemCount={expenses.length}
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