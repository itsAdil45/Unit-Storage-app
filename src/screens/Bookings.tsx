import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import BookingsList from '../components/Lists/BookingsList';
import FloatingQuickActions from '../components/widgets/FloatingQuickActions';
import AddUnitModal from '../components/modals/AddUnitModal';
import AddCustomerModal from '../components/modals/AddCustomerModal';
import AddBookingModal from '../components/modals/AddBookingModal';
import AddExpenseModal from '../components/modals/AddExpenseModal';
export default function Bookings() {
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const handleQuickAction = (action: any) => {
    switch (action.title) {
      case 'Add Unit':
        setShowAddUnitModal(true);
        break;
      case 'Customer':
        setShowAddCustomerModal(true);
        break;
      case 'Booking':
        setShowAddBookingModal(true);
        break;
      case 'Expense':
        setShowAddExpenseModal(true);
        break;
      case 'Cust Report':
        console.log('Navigate to customer report');
        break;
      case 'Revenue':
        console.log('Navigate to revenue screen');
        break;
      default:
        break;
    }
  };
  const hasOpenModal =
    showAddUnitModal ||
    showAddCustomerModal ||
    showAddBookingModal ||
    showAddExpenseModal;

  return (
    <View style={styles.container}>
      <BookingsList refresh={refresh} />

      {!hasOpenModal && (
        <FloatingQuickActions onActionPress={handleQuickAction} />
      )}
      <AddUnitModal
        visible={showAddUnitModal}
        onClose={() => setShowAddUnitModal(false)}
        onAdd={(unit) => console.log('Added unit:', unit)}
      />
      <AddCustomerModal
        visible={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        onAdd={(c) => console.log('New customer:', c)}
      />
      <AddBookingModal
        visible={showAddBookingModal}
        onClose={() => setShowAddBookingModal(false)}
        onAdd={(b) => {
          setRefresh((prev) => prev + 1);
        }}
      />
      <AddExpenseModal
        visible={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        onAdd={(b) => console.log('Expense added:', b)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
