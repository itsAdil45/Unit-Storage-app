import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useGet } from '../../hooks/useGet';
import { lightColors, darkColors } from '../../constants/color';
import { ExpenseReportData } from '../../types/ExpenseReport';
import styles from './Styles/CustomerReport';
import { generateExpenseExcelWorkbook } from './ExcelStructures/expenseExcelWorkbook';
import generateExpenseReportContent from './PdfStructures/expenseReportContent';
import LoadMorePagination from '../Reusable/LoadMorePagination';
import { generateAndSharePDF } from '../Reusable/GenerateAndSharePDF';
import { generateAndShareExcel } from '../Reusable/GenerateAndShareExcel';
import ExpenseReportItem from '../Items/ExpenseReportItem';
import { fetchReportHelper } from '../../Utils/ReportFetcher';
import {
  createHandleLoadMore,
  useTotalPages,
} from '../../Utils/PaginationUtils';
import LoadingModal from '../Reusable/LoadingModal';
import EmptyList from '../Reusable/EmptyList';

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

  const fetchReportData = () => {
    fetchReportHelper<ExpenseReportData>({
      get,
      endpoint: '/reports/expense',
      dataKey: 'reportDataResult',
      itemsPerPage,
      setReportData,
      setDisplayData,
      setLoading,
      initialLoad,
      setInitialLoad,
    });
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReportData();
      setPage(1);
    }, []),
  );
  const handleLoadMore = createHandleLoadMore<ExpenseReportData>({
    loading,
    loadingMore,
    page,
    itemsPerPage,
    setDisplayData,
    setPage,
    setLoadingMore,
    reportData,
  });

  const totalPages = useTotalPages(reportData, itemsPerPage);

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

  const renderEmptyList = () => {
   return EmptyList(styles, colors, "Expense");
  };


  const renderPDFLoadingOverlay = () => {
    return LoadingModal(generatingPDF, "PDF", colors);
  };

  const renderExcelLoadingOverlay = () => {
        return LoadingModal(generatingExcel, "Excel", colors);

  }

  return initialLoad ? (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={dark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.card}
      />
      <View style={styles.initialLoadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading expense reports...
        </Text>
      </View>
    </View>
  ) : (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={dark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.card}
      />

      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Expense Reports
        </Text>
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
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading...
          </Text>
        </View>
      )}

      {renderPDFLoadingOverlay()}
      {renderExcelLoadingOverlay()}
    </View>
  );
};

export default ExpenseReport;
