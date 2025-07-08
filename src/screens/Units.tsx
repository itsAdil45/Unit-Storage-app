import React, { useState, useEffect } from 'react';
import { Text, View, FlatList } from 'react-native';
import UnitList from '../components/Lists/UnitList';
import UnitStatsCards from '../components/UnitStatsCards';
import { useGet } from '../hooks/useGet';
import FloatingQuickActions from '../components/widgets/FloatingQuickActions';
import AddUnitModal from '../components/modals/AddUnitModal';
import AddCustomerModal from '../components/modals/AddCustomerModal';
import AddBookingModal from '../components/modals/AddBookingModal';
import AddExpenseModal from '../components/modals/AddExpenseModal';
export default function Units() {
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  type UnitData = {
    checkingOut: number;
    empty: number;
    occupied: number;
    overdue: number;
    total: number;
  };

  const [unitData, setUnitData] = useState<UnitData | null>(null);

  const { get } = useGet();
  const [loadings, setLoading] = useState(false);

  type StorageUnit = {
    value: number;
    title: string;
    iconColor: string;
  };

  useEffect(() => {
    fetchUnitsData();
  }, []);

  const fetchUnitsData = async () => {
    setLoading(true);
    setUnitData(null);

    try {
      const endpoint = `/dashboard/storageOverview`;
      const res = await get(endpoint);

      if (res?.status === 'success') {
        setUnitData(res.data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setUnitData(null);
    }

    setLoading(false);
  };
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
  const units: StorageUnit[] = [
    {
      value: unitData?.total || 0,
      title: 'Total Units',
      iconColor: '#397AF9',
    },
    {
      value: unitData?.empty || 0,
      title: 'Available Units',
      iconColor: '#00B8D9',
    },
    {
      value: unitData?.occupied || 0,
      title: 'Occupied Units',
      iconColor: '#FFAB00',
    },
  ];

  return (
    <>
    <FlatList
      data={[]}
      keyExtractor={() => 'dummy'}
      renderItem={null}
      ListHeaderComponent={() => (
        <View>
          <FlatList
            data={units}
            horizontal
            keyExtractor={(item) => item.title}
            renderItem={({ item }) => (
              <UnitStatsCards
              label={item.title}
              value={item.value}
                iconColor={item.iconColor}
              />
            )}
            showsHorizontalScrollIndicator={false}
          />

          {!loadings && <UnitList />}
          {loadings && <Text style={{ textAlign: 'center' }}>Loading...</Text>}
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
