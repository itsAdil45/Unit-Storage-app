import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

// Remove the old QuickActions import
import QuickActions from '../components/widgets/QuickActions';
// import FloatingQuickActions from '../components/widgets/FloatingQuickActions';
import PaymentsOverview from '../components/widgets/PaymentsOverview';
import RecentExpenses from '../components/widgets/RecentExpenses';
import StorageUnitsOverview from '../components/widgets/StorageUnitsOverview';
import AvailabilityCalendar from '../components/widgets/AvailabilityCalendar';

import AddUnitModal from '../components/modals/AddUnitModal';
import AddCustomerModal from '../components/modals/AddCustomerModal';
import AddBookingModal from '../components/modals/AddBookingModal';
import AddExpenseModal from '../components/modals/AddExpenseModal';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../constants/color';
import { useGet } from '../hooks/useGet';
import {
  StorageOverviewData,
  PaymentOverviewData,
  ExpenseData,
} from '../types/Types';

const LoadingSpinner = () => {
    const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  const scale = useSharedValue(0.8);
  useEffect(() => {
    scale.value = withTiming(1, { duration: 600 });
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <View style={[styles.loadingContainer, {backgroundColor:colors.background}]}>
      <Animated.View style={[styles.simpleDot, animatedStyle]} />
    </View>
  );
};

const DashboardContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const opacity = useSharedValue(0.85);
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={[styles.contentContainer, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const AnimatedWidget: React.FC<{
  children: React.ReactNode;
  delay: number;
}> = ({ children, delay }) => {
  const opacity = useSharedValue(0.9);
  const translateY = useSharedValue(3);
  useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 500 });
      translateY.value = withTiming(0, { duration: 500 });
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay]);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  const [paymentOverview, setPaymentOverview] =
    useState<PaymentOverviewData | null>(null);
  const [storageOverview, setStorageOverview] =
    useState<StorageOverviewData | null>(null);
  const [expenses, setExpenses] = useState<ExpenseData[] | null>(null);

  const { get } = useGet();
  const loadingOpacity = useSharedValue(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, storRes, expRes] = await Promise.all([
          get('/dashboard/customerOverview'),
          get('/dashboard/storageOverview'),
          get('/expenses'), // ← Replace this endpoint if it's different
        ]);

        setPaymentOverview(custRes?.data || null);
        setStorageOverview(storRes?.data || null);
        setExpenses(expRes?.data.expenses || null);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        loadingOpacity.value = withTiming(0, { duration: 400 }, () =>
          runOnJS(setIsLoading)(false),
        );
      }
    };

    fetchData();
  }, []);

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

  const loadingStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value,
  }));

  if (isLoading) {
    return (
      <Animated.View style={[StyleSheet.absoluteFill, loadingStyle]}>
        <LoadingSpinner />
      </Animated.View>
    );
  }

  return (
    <>
      <FlatList
        data={[]}
        keyExtractor={() => 'dummy'}
        renderItem={null}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <DashboardContent>
            {/* Removed the old QuickActions widget */}
                        <AnimatedWidget delay={50}>
              <QuickActions
                onActionPress={(action) => {
                  if (action.title === 'Add Unit') setShowAddUnitModal(true);
                  else if (action.title === 'Customer')
                    setShowAddCustomerModal(true);
                  else if (action.title === 'Booking')
                    setShowAddBookingModal(true);
                }}
              />
            </AnimatedWidget>
            
            <AnimatedWidget delay={50}>
              <PaymentsOverview overview={paymentOverview} />
            </AnimatedWidget>

            <AnimatedWidget delay={100}>
              <RecentExpenses
                expenses={expenses}
                onAddExpense={() => setShowAddExpenseModal(true)}
              />
            </AnimatedWidget>

            <AnimatedWidget delay={150}>
              <StorageUnitsOverview overview={storageOverview} />
            </AnimatedWidget>

            <AnimatedWidget delay={200}>
              <AvailabilityCalendar />
            </AnimatedWidget>
          </DashboardContent>
        )}
      />

      {/* Floating Quick Actions - Hide when any modal is open */}
      {/* {!showAddUnitModal && !showAddCustomerModal && !showAddBookingModal && !showAddExpenseModal && (
        <FloatingQuickActions onActionPress={handleQuickAction} />
      )} */}

      {/* Modals - Each with proper zIndex */}
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
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  simpleDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#007bff',
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 8,
    paddingBottom: 100, // Add padding to avoid overlap with floating button
  },
});

export default Dashboard;