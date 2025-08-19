import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import { useTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { lightColors, darkColors } from '../../constants/color';
import { Booking, BookingFilterType, Payment } from '../../types/Bookings';
import { useDelete } from '../../hooks/useDelete';
import { useListData } from '../../hooks/useListData';
import EditBookingModal from '../modals/EditBookingModal';
import PaymentsModal from '../modals/PaymentsModal';
import AddEditPaymentModal from '../modals/AddEditPaymentModal';
import AnimatedDeleteWrapper from '../Reusable/AnimatedDeleteWrapper';
import LoadMorePagination from '../Reusable/LoadMorePagination';
import BookingItem from '../Items/BookingItem';
import styles from './Styles/BookingList';

const BookingsList = ({ refresh }: { refresh: number }) => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;

  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingFilterType>('All');

  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedBookingForPayments, setSelectedBookingForPayments] = useState<Booking | null>(null);
  const [paymentModalState, setPaymentModalState] = useState<{
    visible: boolean;
    booking: Booking | null;
    payment?: Payment;
  }>({
    visible: false,
    booking: null,
    payment: undefined,
  });

  const { del: deleteRequest } = useDelete();

  // Use reusable list hook
  const {
    items: bookings,
    setItems: setBookings,
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
  } = useListData<Booking>({
    endpoint: '/bookings',
    searchDebounced,
    filter: statusFilter,
    filterKey: 'filterStatus',
    refresh,
    searchParam: 'search',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (text: string) => setSearch(text);
  const clearSearch = () => {
    setSearch('');
    setSearchDebounced('');
  };

  const handleStatusFilter = (filter: BookingFilterType) => setStatusFilter(filter);

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
          backgroundColor: statusFilter === value ? colors.primary : colors.card,
          borderColor: colors.border,
          zIndex: 120,
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
        <View style={[styles.colorDot, { backgroundColor: getFilterColor(value) }]} />
      )}
    </TouchableOpacity>
  );

  const handleEdit = (booking: Booking) => setEditingBooking(booking);
  const handlePayments = (booking: Booking) => setSelectedBookingForPayments(booking);

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
        setBookings((prev) =>
          prev.map((booking) => ({
            ...booking,
            payments: booking.payments.filter((p) => p.id !== payment.id),
          }))
        );
        
        // Update selectedBookingForPayments as well
        if (selectedBookingForPayments) {
          setSelectedBookingForPayments((prev) => ({
            ...prev!,
            payments: prev!.payments.filter((p) => p.id !== payment.id),
          }));
        }
        
        Toast.show({
          type: 'success',
          text1: 'Deleted',
          text2: 'Payment deleted successfully',
        });
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const updateBooking = (updated: Booking) => {
    setBookings((prev) =>
      prev.map((booking) => (booking.id === updated.id ? { ...booking, ...updated } : booking))
    );
    
    // Also update selectedBookingForPayments if it matches
    if (selectedBookingForPayments && selectedBookingForPayments.id === updated.id) {
      setSelectedBookingForPayments({ ...selectedBookingForPayments, ...updated });
    }
  };

  const handlePaymentModalSuccess = (updatedPayment: Payment) => {
    const bookingId = paymentModalState.booking?.id;
    if (!bookingId) return;

    const updateBookingPayments = (booking: Booking) => {
      if (paymentModalState.payment) {
        // Edit mode - update existing payment
        return {
          ...booking,
          payments: booking.payments.map((p) =>
            p.id === updatedPayment.id ? updatedPayment : p
          ),
        };
      } else {
        // Add mode - add new payment
        return {
          ...booking,
          payments: [...booking.payments, updatedPayment],
        };
      }
    };

    // Update bookings list
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId ? updateBookingPayments(booking) : booking
      )
    );

    // Update selectedBookingForPayments if it matches
    if (selectedBookingForPayments && selectedBookingForPayments.id === bookingId) {
      setSelectedBookingForPayments(updateBookingPayments(selectedBookingForPayments));
    }

    setPaymentModalState({ visible: false, booking: null, payment: undefined });
  };

  const displayBookings = useMemo(() => bookings, [bookings]);

  const renderBookingCard = ({ item, index }: { item: Booking; index: number }) => (
    <AnimatedDeleteWrapper
      itemId={item.id}
      removingId={removingId}
      onDelete={handleDelete}
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
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />

      {/* Search Bar */}
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

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Filter:</Text>
        <View style={styles.chipsRow}>
          {renderFilterChip('All', 'All')}
          {renderFilterChip('Active', 'active')}
          {renderFilterChip('Completed', 'completed')}
          {renderFilterChip('Cancelled', 'cancelled')}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={displayBookings}
        renderItem={renderBookingCard}
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
            currentItemCount={displayBookings.length}
          />
        }
      />

      {/* Modals */}
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