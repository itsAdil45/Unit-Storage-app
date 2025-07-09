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
import LoadMorePagination from '../Reusable/LoadMorePagination';
import styles from './Styles/CustomerReport';
import { generateExpenseExcelWorkbook } from './ExcelStructures/expenseExcelWorkbook';
import generateExpenseReportContent from './PdfStructures/expenseReportContent';
import { generateAndSharePDF } from '../Reusable/GenerateAndSharePDF';
import { generateAndShareExcel } from '../Reusable/GenerateAndShareExcel';
import { ExpenseReportData, ApiResponse } from '../../types/ExpenseReport';
import ExpenseReportItem from '../Items/ExpenseReportItem';

const ExpenseReport: React.FC = () => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;

  const [reportData, setReportData] = useState<ExpenseReportData[]>([]);
  const [displayData, setDisplayData] = useState<ExpenseReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);

  const { get } = useGet();
  const itemsPerPage = 10;

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res: ApiResponse = await get('/reports/expense');
      if (res?.status === 'success') {
        setReportData(res.data.reportDataResult || []);
        // Initially show first page of data
        setDisplayData(res.data.reportDataResult?.slice(0, itemsPerPage) || []);
      }
    } catch (error) {
      console.error('Error fetching expense report:', error);
      Alert.alert('Error', 'Failed to fetch expense report');
      setReportData([]);
      setDisplayData([]);
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
            setPage(1);

    }, [])
  );

  const handleLoadMore = () => {
    if (loading || loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * itemsPerPage;
    const newData = reportData.slice(startIndex, startIndex + itemsPerPage);
    
    if (newData.length > 0) {
      setDisplayData(prev => [...prev, ...newData]);
      setPage(nextPage);
    }
    
    setLoadingMore(false);
  };

  const totalPages = useMemo(() => {
    return Math.ceil(reportData.length / itemsPerPage);
  }, [reportData]);

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `AED ${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const handleGeneratePDF = () => {
    generateAndSharePDF({
      data: reportData,
      generateHTML: generateExpenseReportContent,
      setLoading: setGeneratingPDF,
      title: 'Expense Report',
    });
  };

  const handleGenerateExcel = () => {
    generateAndShareExcel({
      generateWorkbook: () => generateExpenseExcelWorkbook(reportData),
      setLoading: setGeneratingExcel,
      title: 'Expense Report Excel',
      filenamePrefix: 'expense_report',
    });
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="assessment" size={64} color={colors.subtext} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No expense reports available</Text>
      <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
        Expense reports will appear here once data is available
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
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading expense reports...</Text>
      </View>
    </View>
  ) : (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />

      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Expense Reports</Text>
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
        renderItem={({ item }) => <ExpenseReportItem item={item} />}
        keyExtractor={(item, index) => `${index}`}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        scrollEnabled={!loading}
        showsVerticalScrollIndicator={false}

        ListFooterComponent={
          <LoadMorePagination
            currentPage={page}
            totalPages={totalPages}
            loading={loading}
            loadingMore={loadingMore}
            colors={colors}
            onLoadMore={handleLoadMore}
            showItemCount={true}
            totalItems={reportData.length}
            currentItemCount={displayData.length}
          />
        }
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      )}

      {renderPDFLoadingOverlay()}
      {renderExcelLoadingOverlay()}
    </View>
  );
};

export default ExpenseReport;