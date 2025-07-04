import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useGet } from '../../hooks/useGet';
import { lightColors, darkColors } from '../../constants/color';
import Pagination from '../Reusable/Pagination';
import styles from './Styles/CustomerReport';
import CustomerReportItem from '../Items/CustomerReportItem';
import generateCustomerPDFContent from './PdfStructures/customerPDFContent';
import { generateAndSharePDF } from '../Reusable/GenerateAndSharePDF';
import { generateAndShareExcel } from '../Reusable/GenerateAndShareExcel';
import { generateCustomerExcelWorkbook } from './ExcelStructures/customerExcelContent';
import { CustomerReportData, ApiResponse } from '../../types/CustomerReport';

const CustomerReport: React.FC = () => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;

  const [reportData, setReportData] = useState<CustomerReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);
  const [expandedBookings, setExpandedBookings] = useState<{ [key: string]: boolean }>({});
  const [expandedPayments, setExpandedPayments] = useState<{ [key: string]: boolean }>({});

  const { get } = useGet();
  const itemsPerPage = 5;
  const totalPages = Math.ceil(reportData.length / itemsPerPage);

  const displayData = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return reportData.slice(startIndex, startIndex + itemsPerPage);
  }, [reportData, page]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res: ApiResponse = await get('/reports/customer');
      if (res?.status === 'success') {
        setReportData(res.data.reportData || []);
      }
    } catch (error) {
      console.error('Error fetching customer report:', error);
      Alert.alert('Error', 'Failed to fetch customer report');
      setReportData([]);
    }
    setLoading(false);
    if (initialLoad) setInitialLoad(false);
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReportData();
    }, [])
  );

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `AED ${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#FF5722';
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      default: return colors.subtext;
    }
  };

  const getPaymentMethodDisplay = (method: string | null) =>
    method ? method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not specified';

  const toggleBookingExpansion = (email: string, bookingId: number) => {
    const key = `${email}-${bookingId}`;
    setExpandedBookings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePaymentExpansion = (email: string, bookingId: number) => {
    const key = `${email}-${bookingId}-payments`;
    setExpandedPayments(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGeneratePDF = () => {
    generateAndSharePDF({
      data: reportData,
      generateHTML: generateCustomerPDFContent,
      setLoading: setGeneratingPDF,
      title: 'Customer Report',
    });
  };

  const handleGenerateExcel = () => {
    generateAndShareExcel({
      generateWorkbook: () => generateCustomerExcelWorkbook(reportData),
      setLoading: setGeneratingExcel,
      title: 'Customer Report Excel',
      filenamePrefix: 'customer_report',
    });
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="assessment" size={64} color={colors.subtext} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No customer reports available</Text>
      <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
        Customer reports will appear here once data is available
      </Text>
    </View>
  );

  const renderPDFLoadingOverlay = () => (
    <Modal visible={generatingPDF} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.pdfOverlay}>
        <View style={[styles.pdfLoadingContainer, { backgroundColor: colors.card }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.pdfLoadingText, { color: colors.text }]}>Generating PDF...</Text>
          <Text style={[styles.pdfLoadingSubtext, { color: colors.subtext }]}>
            Please wait while we prepare your report
          </Text>
        </View>
      </View>
    </Modal>
  );

  const renderExcelLoadingOverlay = () => (
    <Modal visible={generatingExcel} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.pdfOverlay}>
        <View style={[styles.pdfLoadingContainer, { backgroundColor: colors.card }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.pdfLoadingText, { color: colors.text }]}>Generating Excel...</Text>
          <Text style={[styles.pdfLoadingSubtext, { color: colors.subtext }]}>
            Please wait while we prepare your Excel file
          </Text>
        </View>
      </View>
    </Modal>
  );

  return initialLoad ? (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />
      <View style={styles.initialLoadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading customer reports...</Text>
      </View>
    </View>
  ) : (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />

      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Customer Reports</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: '#4CAF50' }]}
            onPress={handleGenerateExcel}
            disabled={generatingExcel || reportData.length === 0}
          >
            <MaterialIcons name="table-chart" size={20} color="#fff" />
            <Text style={styles.exportButtonText}>Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: colors.primary }]}
            onPress={handleGeneratePDF}
            disabled={generatingPDF || reportData.length === 0}
          >
            <MaterialIcons name="picture-as-pdf" size={20} color="#fff" />
            <Text style={styles.exportButtonText}>PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={displayData}
        renderItem={({ item }) => (
          <CustomerReportItem
            item={item}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            getPaymentMethodDisplay={getPaymentMethodDisplay}
            expandedBookings={expandedBookings}
            expandedPayments={expandedPayments}
            toggleBookingExpansion={toggleBookingExpansion}
            togglePaymentExpansion={togglePaymentExpansion}
          />
        )}
        keyExtractor={(item, index) => `${item.email}-${index}`}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        scrollEnabled={!loading}
        showsVerticalScrollIndicator={false}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        loading={loading}
        colors={colors}
        onPreviousPage={() => setPage(p => Math.max(p - 1, 1))}
        onNextPage={() => setPage(p => Math.min(p + 1, totalPages))}
      />

      {renderPDFLoadingOverlay()}
      {renderExcelLoadingOverlay()}
    </View>
  );
};

export default CustomerReport;
