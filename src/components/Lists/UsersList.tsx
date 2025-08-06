import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';
import { MaterialIcons } from '@expo/vector-icons';
import { useGet } from '../../hooks/useGet';
import { useDelete } from '../../hooks/useDelete';
import { usePatch } from '../../hooks/usePatch';
import { User, UserFilterType } from '../../types/Users';
import AnimatedDeleteWrapper, {
  useAnimatedDelete,
} from '../Reusable/AnimatedDeleteWrapper';
import LoadMorePagination from '../Reusable/LoadMorePagination';
import UserItem from '../Items/UserItem';
import AddEditUserModal from '../modals/AddEditUserModal';
import styles from './Styles/BookingList'; // You may want to rename this file to UsersList

// Add these styles to your stylesheet or create them inline
const additionalStyles = {
  addUserButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 52,
  },
  addUserButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500' as const,
    marginLeft: 4,
  },
};

const UsersList = ({ refresh }: { refresh: number }) => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<UserFilterType>(0);
  const [searchDebounced, setSearchDebounced] = useState('');

  const { get } = useGet();
  const { del: deleteRequest } = useDelete();
  const { patch } = usePatch();

  const { removingId, handleDelete } = useAnimatedDelete<User>(
    deleteRequest,
    '/users',
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
      setUsers([]);
      fetchUsers(1, false);
    }
  }, [searchDebounced, filterStatus, refresh]);

  useEffect(() => {
    if (page === 1) {
      fetchUsers(1, false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      setUsers([]);
      fetchUsers(1, false);
    }, []),
  );

  const fetchUsers = async (pg: number, isLoadMore: boolean = false, isRefresh: boolean = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
      if (pg === 1) {
        setUsers([]);
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

      if (filterStatus !== undefined) {
        queryParams.append('filterStatus', filterStatus.toString());
      }

      const endpoint = `/users?${queryParams.toString()}`;
      const res = await get(endpoint);

      if (res?.status === 'success') {
        const usersData = res.data.users || [];

        if (isLoadMore) {
          setUsers((prev) => [...prev, ...usersData]);
        } else {
          // Replace existing items (for refresh or initial load)
          setUsers(usersData);
        }

        setTotalPages(parseInt(res.data.pagination.totalPages) || 1);
        setTotalItems(parseInt(res.data.pagination.total) || 0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (!isLoadMore) {
        setUsers([]);
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

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setPage(1);
    fetchUsers(1, false, true);
  }, [searchDebounced, filterStatus]);

  const handleLoadMore = () => {
    if (page < totalPages && !loading && !loadingMore && !refreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUsers(nextPage, true);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowAddEditModal(true);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowAddEditModal(true);
  };

  const handleModalClose = () => {
    setShowAddEditModal(false);
    setEditingUser(null);
  };

  const handleUserSuccess = (user: User) => {
    if (editingUser) {
      // Update existing user
      updateUser(user);
    } else {
      // Add new user
      setUsers(prev => [user, ...prev]);
      setTotalItems(prev => prev + 1);
    }
  };

  const handleStatusToggle = async (user: User) => {
    try {
      const newDeletedStatus = user.deleted === 0 ? 1 : 0;
      const statusText = newDeletedStatus === 0 ? 'active' : 'inactive';
      
      const response = await patch(`/users/${user.id}`, { 
        deleted: newDeletedStatus 
      });

      if (response?.status === 'success') {
        // Update the user in the local state
        const updatedUser = { ...user, deleted: newDeletedStatus };
        updateUser(updatedUser);
        
        Toast.show({
          type: 'success',
          text1: 'Status Updated',
          text2: `User is now ${statusText}`,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to update user status',
        });
      }
    } catch (error: any) {
      console.error('Error updating user status:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update user status',
      });
    }
  };

  const updateUser = (updated: User) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === updated.id ? { ...user, ...updated } : user,
      ),
    );
  };

  const displayUsers = useMemo(() => {
    return users;
  }, [users]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
  };

  const clearSearch = () => {
    setSearch('');
    setSearchDebounced('');
  };

  const handleStatusFilter = (filter: UserFilterType) => {
    setFilterStatus(filter);
  };

  const getFilterColor = (filter: UserFilterType) => {
    switch (filter) {
      case 0:
        return '#4CAF50'; // Green for Active
      case 1:
        return '#FF5722'; // Red for Inactive
      default:
        return undefined;
    }
  };

  const renderFilterChip = (label: string, value: UserFilterType) => (
    <TouchableOpacity
      key={value}
      onPress={() => handleStatusFilter(value)}
      style={[
        styles.filterChip,
        {
          backgroundColor:
            filterStatus === value ? colors.primary : colors.card,
          borderColor: colors.border,
          zIndex: 120,
        },
      ]}
    >
      <Text
        style={[
          styles.filterText,
          { color: filterStatus === value ? '#fff' : colors.text },
        ]}
      >
        {label}
      </Text>
      {getFilterColor(value) && filterStatus === value && (
        <View
          style={[styles.colorDot, { backgroundColor: getFilterColor(value) }]}
        />
      )}
    </TouchableOpacity>
  );

  const renderUserCard = ({
    item,
    index,
  }: {
    item: User;
    index: number;
  }) => (
    <AnimatedDeleteWrapper
      itemId={item.id}
      removingId={removingId}
      onDelete={(id) => {
        handleDelete(id, setUsers);
        setTotalItems((prev) => prev - 1);
      }}
      deleteTitle="Delete User"
      itemName={`${item.firstName} ${item.lastName}`}
    >
      <UserItem
        item={item}
        index={index}
        colors={colors}
        dark={dark}
        onEdit={handleEdit}
        onDeletePress={() => {}}
        onStatusToggle={handleStatusToggle}
      />
    </AnimatedDeleteWrapper>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="people" size={64} color={colors.subtext} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {searchDebounced ? 'No users found' : 'No users available'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
        {searchDebounced
          ? 'Try adjusting your search or filters'
          : 'Add some users to get started'}
      </Text>
    </View>
  );

  if (initialLoad) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.initialLoadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading users...
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
          placeholder="Search users..."
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

      <View style={styles.filtersContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Filter:
        </Text>
        <View style={styles.chipsRow}>
       
              {renderFilterChip('Active', 0)}
              {renderFilterChip('Inactive', 1)}

          <View>
              <TouchableOpacity
                onPress={handleAddUser}
                style={[
                  { ...styles, ...additionalStyles }.addUserButton,
                  { backgroundColor: colors.primary }
                ]}
              >
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text style={additionalStyles.addUserButtonText}>Add User</Text>
              </TouchableOpacity>
            </View>
        </View>
      </View>

      <FlatList
        data={displayUsers}
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
            currentItemCount={displayUsers.length}
          />
        }
      />

      <AddEditUserModal
        visible={showAddEditModal}
        onClose={handleModalClose}
        onSuccess={handleUserSuccess}
        editingUser={editingUser}
        colors={colors}
        dark={dark}
      />
    </View>
  );
};

export default UsersList;