import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';
import { MaterialIcons } from '@expo/vector-icons';
import { useGet } from '../../hooks/useGet';
import { useDelete } from '../../hooks/useDelete';
import { Booking, BookingFilterType, Payment } from '../../types/Bookings';
import EditBookingModal from '../modals/EditBookingModal';
import PaymentsModal from '../modals/PaymentsModal';
import AddEditPaymentModal from '../modals/AddEditPaymentModal'; 
import AnimatedDeleteWrapper, {
  useAnimatedDelete,
} from '../Reusable/AnimatedDeleteWrapper';
import LoadMorePagination from '../Reusable/LoadMorePagination'; // Updated import
import BookingItem from '../Items/BookingItem';
import styles from './Styles/BookingList';

const BookingsList: React.FC = () => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedBookingForPayments, setSelectedBookingForPayments] =
    useState<Booking | null>(null);

  const [paymentModalState, setPaymentModalState] = useState<{
    visible: boolean;
    booking: Booking | null;
    payment?: Payment;
  }>({
    visible: false,
    booking: null,
    payment: undefined,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingFilterType>('All');
  const [searchDebounced, setSearchDebounced] = useState('');

  const { get } = useGet();
  const { del: deleteRequest } = useDelete();

  const { removingId, handleDelete } = useAnimatedDelete<Booking>(
    deleteRequest,
    '/bookings',
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!initialLoad) {
      // Reset to page 1 and clear existing data when search or filter changes
      setPage(1);
      setBookings([]);
      fetchBookings(1, false);
    }
  }, [searchDebounced, statusFilter]);

  useEffect(() => {
    if (page === 1) {
      fetchBookings(1, false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Reset and fetch fresh data when screen comes into focus
      setPage(1);
      setBookings([]);
      fetchBookings(1, false);
    }, []),
  );

  const fetchBookings = async (pg: number, isLoadMore: boolean = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      if (pg === 1) {
        setBookings([]);
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

      if (statusFilter !== 'All') {
        queryParams.append('filterStatus', statusFilter);
      }

      const endpoint = `/bookings?${queryParams.toString()}`;
      const res = await get(endpoint);

      if (res?.status === 'success') {
        const bookingsData = res.data.bookings || [];
        
        if (isLoadMore) {
          // Append new items to existing ones
          setBookings(prev => [...prev, ...bookingsData]);
        } else {
          // Replace existing items
          setBookings(bookingsData);
        }
        
        setTotalPages(parseInt(res.data.pagination.totalPages) || 1);
        setTotalItems(parseInt(res.data.pagination.total) || 0);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (!isLoadMore) {
        setBookings([]);
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
      fetchBookings(nextPage, true);
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
  };

  const handlePayments = (booking: Booking) => {
    setSelectedBookingForPayments(booking);
  };

  const handleAddPayment = (booking: Booking) => {
    setPaymentModalState({
      visible: true,
      booking,
      payment: undefined, 
    });
  };

  const handleEditPayment = (booking: Booking, payment: Payment) => {
    setPaymentModalState({
      visible: true,
      booking,
      payment, 
    });
  };

  const handleDeletePayment = async (payment: Payment) => {
    try {
      const res = await deleteRequest(`/payments/${payment.id}`);
      if (res?.status === 'success') {
        setBookings((prevBookings) =>
          prevBookings.map((booking) => ({
            ...booking,
            payments: booking.payments.filter((p) => p.id !== payment.id),
          })),
        );

        if (selectedBookingForPayments) {
          setSelectedBookingForPayments((prev) => ({
            ...prev!,
            payments: prev!.payments.filter((p) => p.id !== payment.id),
          }));
        }
        Toast.show({
          type: 'success',
          text1: 'Deleted',
          text2: `Payment deleted successfully`,
        });
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      Alert.alert('Error', 'Failed to delete payment');
    }
  };

  const updateBooking = (updated: Booking) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === updated.id ? { ...booking, ...updated } : booking,
      ),
    );
  };

  const handlePaymentModalSuccess = (updatedPayment: Payment) => {
    const bookingId = paymentModalState.booking?.id;
    if (!bookingId) return;

    if (paymentModalState.payment) {
      updatePaymentInBooking(bookingId, updatedPayment);
    } else {
      updateBookingWithPayment(bookingId, updatedPayment);
    }

    setPaymentModalState({
      visible: false,
      booking: null,
      payment: undefined,
    });
  };

  const updateBookingWithPayment = (bookingId: number, newPayment: Payment) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, payments: [...booking.payments, newPayment] }
          : booking,
      ),
    );
  };

  const updatePaymentInBooking = (
    bookingId: number,
    updatedPayment: Payment,
  ) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              payments: booking.payments.map((p) =>
                p.id === updatedPayment.id ? updatedPayment : p,
              ),
            }
          : booking,
      ),
    );

    if (selectedBookingForPayments?.id === bookingId) {
      setSelectedBookingForPayments((prev) => ({
        ...prev!,
        payments: prev!.payments.map((p) =>
          p.id === updatedPayment.id ? updatedPayment : p,
        ),
      }));
    }
  };

  const displayBookings = useMemo(() => {
    return bookings;
  }, [bookings]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
  };

  const clearSearch = () => {
    setSearch('');
    setSearchDebounced('');
  };

  const handleStatusFilter = (filter: BookingFilterType) => {
    setStatusFilter(filter);
  };

  const getFilterColor = (filter: BookingFilterType) => {
    switch (filter) {
      case 'active':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#FF5722';
      default:
        return undefined;
    }
  };

  const renderFilterChip = (label: string, value: BookingFilterType) => (
    <TouchableOpacity
      key={value}
      onPress={() => handleStatusFilter(value)}
      style={[
        styles.filterChip,
        {
          backgroundColor:
            statusFilter === value ? colors.primary : colors.card,
          borderColor: colors.border,
          zIndex: 120
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
      {getFilterColor(value) && statusFilter === value && (
        <View
          style={[styles.colorDot, { backgroundColor: getFilterColor(value) }]}
        />
      )}
    </TouchableOpacity>
  );

  const renderBookingCard = ({
    item,
    index,
  }: {
    item: Booking;
    index: number;
  }) => (
    <AnimatedDeleteWrapper
      itemId={item.id}
      removingId={removingId}
      onDelete={(id) => {
        handleDelete(id, setBookings);
        setTotalItems(prev => prev - 1);
      }}
      deleteTitle="Delete Booking"
      itemName={`Booking #${item.id} - ${item.customer.firstName} ${item.customer.lastName}`}
    >
      <BookingItem
        item={item}
        index={index}
        colors={colors}
        dark={dark}
        onEdit={handleEdit}
        onPayments={handlePayments}
        onAddPayment={handleAddPayment}
        onDeletePress={() => {}} 
      />
    </AnimatedDeleteWrapper>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="book" size={64} color={colors.subtext} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {searchDebounced ? 'No bookings found' : 'No bookings available'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
        {searchDebounced
          ? 'Try adjusting your search or filters'
          : 'Create some bookings to get started'}
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
            Loading bookings...
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
          placeholder="Search bookings..."
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
          {renderFilterChip('All', 'All')}
          {renderFilterChip('Active', 'active')}
          {renderFilterChip('Completed', 'completed')}
          {renderFilterChip('Cancelled', 'cancelled')}
        </View>
      </View>

      <FlatList
        data={displayBookings}
        renderItem={renderBookingCard}
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
            currentItemCount={displayBookings.length}
          />
        }
      />

      {editingBooking && (
        <EditBookingModal
          visible={true}
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSaveSuccess={(updated) => {
            updateBooking(updated);
            setEditingBooking(null);
          }}
          colors={colors}
          dark={dark}
        />
      )}

      {selectedBookingForPayments && (
        <PaymentsModal
          visible={true}
          booking={selectedBookingForPayments}
          onClose={() => setSelectedBookingForPayments(null)}
          onEditPayment={handleEditPayment}
          onDeletePayment={handleDeletePayment}
          colors={colors}
          dark={dark}
        />
      )}

      {paymentModalState.visible && paymentModalState.booking && (
        <AddEditPaymentModal
          visible={paymentModalState.visible}
          booking={paymentModalState.booking}
          payment={paymentModalState.payment} 
          onClose={() =>
            setPaymentModalState({
              visible: false,
              booking: null,
              payment: undefined,
            })
          }
          onSuccess={handlePaymentModalSuccess}
          colors={colors}
          dark={dark}
        />
      )}
    </View>
  );
};

export default BookingsList;