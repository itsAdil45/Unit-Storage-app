import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomerReport from '../components/Reports/CustomerReport';
import RevenueReport from '../components/Reports/RevenueReport';
import ExpenseReport from '../components/Reports/ExpenseReport';
import OccupancyReport from '../components/Reports/OccupancyReport';
import UnitsReport from '../components/Reports/UnitsReport';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../constants/color';
const { width } = Dimensions.get('window');
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootTabParamList } from '../types/Types';
interface ReportType {
  id: string;
  label: string;
  icon: string;
  description: string;
  component: React.ComponentType;
}

const reportTypes: ReportType[] = [
  {
    id: 'customer',
    label: 'Customer Report',
    icon: 'people-outline',
    description: 'View customer bookings and payment details',
    component: CustomerReport,
  },
  {
    id: 'revenue',
    label: 'Revenue Report',
    icon: 'trending-up-outline',
    description: 'Analyze revenue and financial performance',
    component: RevenueReport,
  },
  {
    id: 'expense',
    label: 'Expense Report',
    icon: 'cash-outline',
    description: 'Monitor business expenses and spending trends',
    component: ExpenseReport,
  },
  {
    id: 'occupancy',
    label: 'Occupancy Report',
    icon: 'business-outline',
    description: 'Track occupancy rates across units and floors',
    component: OccupancyReport,
  },
  {
    id: 'units',
    label: 'Units Report',
    icon: 'layers-outline',
    description: 'Detailed report on all storage units and their statuses',
    component: UnitsReport,
  },
];

export default function Reports() {
  type ReportsRouteProp = RouteProp<RootTabParamList, 'Reports'>;
  const route = useRoute<ReportsRouteProp>();
  const { openReport } = route.params || {};
  useEffect(() => {
    if (openReport) {
      const found = reportTypes.find((r) => r.id === openReport);
      if (found) {
        setSelectedReport(found);
      }
    }
  }, [openReport]);

  const [selectedReport, setSelectedReport] = useState<ReportType>(
    reportTypes[0],
  );
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  const handleReportSelection = (report: ReportType) => {
    setSelectedReport(report);
    setDropdownVisible(false);
  };

  const renderDropdownItem = ({ item }: { item: ReportType }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        selectedReport.id === item.id && styles.selectedDropdownItem,
        { backgroundColor: colors.card },
      ]}
      onPress={() => handleReportSelection(item)}
    >
      <View style={styles.dropdownItemContent}>
        <View style={styles.dropdownItemLeft}>
          <Ionicons
            name={item.icon as any}
            size={24}
            color={selectedReport.id === item.id ? '#007bff' : '#666'}
          />
          <View style={styles.dropdownItemText}>
            <Text
              style={[
                styles.dropdownItemLabel,
                selectedReport.id === item.id &&
                  styles.selectedDropdownItemLabel,
                { color: colors.text },
              ]}
            >
              {item.label}
            </Text>
            <Text style={styles.dropdownItemDescription}>
              {item.description}
            </Text>
          </View>
        </View>
        {selectedReport.id === item.id && (
          <Ionicons name="checkmark" size={20} color="#007bff" />
        )}
      </View>
    </TouchableOpacity>
  );

  const SelectedComponent = selectedReport.component;

  return (
    <FlatList
      data={[]}
      keyExtractor={() => 'dummy'}
      renderItem={null}
      keyboardShouldPersistTaps="handled"
      removeClippedSubviews={false}
      ListHeaderComponent={() => (
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.card }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Reports
            </Text>
            <Text style={styles.headerSubtitle}>
              Generate and view detailed reports
            </Text>
          </View>

          {/* Report Type Selector */}
          <View
            style={[styles.selectorContainer, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.selectorLabel, { color: colors.text }]}>
              Select Report Type
            </Text>

            <TouchableOpacity
              style={[styles.dropdown,{backgroundColor: colors.card}]}
              onPress={() => setDropdownVisible(true)}
            >
              <View style={[styles.dropdownContent]}>
                <View style={styles.dropdownLeft}>
                  <Ionicons
                    name={selectedReport.icon as any}
                    size={20}
                    color="#007bff"
                  />
                  <Text style={[styles.dropdownText,{color: colors.text}]}>
                    {selectedReport.label}
                  </Text>
                </View>
                <Ionicons
                  name={dropdownVisible ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#666"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Dropdown Modal */}
          <Modal
            visible={dropdownVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setDropdownVisible(false)}
          >
            <TouchableOpacity
              style={[styles.modalOverlay]}
              activeOpacity={1}
              onPress={() => setDropdownVisible(false)}
            >
              <View style={styles.dropdownModal}>
                <View style={[styles.dropdownHeader ,{ backgroundColor: colors.card }]}>
                  <Text style={[styles.dropdownHeaderText, { color: colors.text }]}>
                    Select Report Type
                  </Text>
                  <TouchableOpacity
                    onPress={() => setDropdownVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={reportTypes}
                  renderItem={renderDropdownItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Report Component */}
          <View style={styles.reportContainer}>
            <SelectedComponent />
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 0.3,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  selectorContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: width * 0.9,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  dropdownHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  dropdownItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  selectedDropdownItem: {
    backgroundColor: '#f0f7ff',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownItemText: {
    marginLeft: 12,
    flex: 1,
  },
  dropdownItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  selectedDropdownItemLabel: {
    color: '#007bff',
  },
  dropdownItemDescription: {
    fontSize: 13,
    color: '#666',
  },
  reportContainer: {
    flex: 1,
    marginTop: 20,
  },
});
