import React,{useState} from 'react';
import { Text, View, FlatList } from 'react-native';
import ExpenseList from '../components/Lists/ExpenseList';
import FloatingQuickActions from '../components/widgets/FloatingQuickActions';
import AddUnitModal from '../components/modals/AddUnitModal';
import AddCustomerModal from '../components/modals/AddCustomerModal';
import AddBookingModal from '../components/modals/AddBookingModal';
import AddExpenseModal from '../components/modals/AddExpenseModal';
export default function Expenses() {
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
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
        // Navigate to customer report screen
        console.log('Navigate to customer report');
        break;
      case 'Revenue':
        // Navigate to revenue screen
        console.log('Navigate to revenue screen');
        break;
      default:
        break;
    }
  };
  return (
    <>
    <FlatList
      data={[]}
      keyExtractor={() => 'dummy'}
      renderItem={null}
      keyboardShouldPersistTaps="handled"
      removeClippedSubviews={false}
      ListHeaderComponent={() => (
        <View>
          <ExpenseList />
        </View>
      )}
      />

            {/* {!showAddUnitModal && !showAddCustomerModal && !showAddBookingModal && !showAddExpenseModal && (
        <FloatingQuickActions onActionPress={handleQuickAction} />
      )} */}
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
        onAdd={(b) => console.log('Booking added:', b)}
      />
      <AddExpenseModal
        visible={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        onAdd={(b) => console.log('Expense added:', b)}
      />
      </>
  );
}
