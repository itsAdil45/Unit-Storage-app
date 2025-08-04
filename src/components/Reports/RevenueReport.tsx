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
import LoadMorePagination from '../Reusable/LoadMorePagination'; // Changed from Pagination
import styles from './Styles/CustomerReport';
import generateRevenueReportContent from './PdfStructures/revenueReportContent';
import { generateRevenueExcelWorkbook } from './ExcelStructures/revenueExcelWorkbook';
import { generateAndSharePDF } from '../Reusable/GenerateAndSharePDF';
import { generateAndShareExcel } from '../Reusable/GenerateAndShareExcel';
import { RevenueReportData, ApiResponse } from '../../types/RevenueReport';
import RevenueReportItem from '../Items/RevenueReportItem';
import { formatAEDCurrency } from '../../Utils/Formatters';
import { fetchReportHelper } from '../../Utils/ReportFetcher';
import {
  createHandleLoadMore,
  useTotalPages,
} from '../../Utils/PaginationUtils';
import LoadingModal from '../Reusable/LoadingModal';
import EmptyList from '../Reusable/EmptyList';

const RevenueReport: React.FC = () => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;

  const [reportData, setReportData] = useState<RevenueReportData[]>([]);
  const [displayData, setDisplayData] = useState<RevenueReportData[]>([]); // Added for load-more
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // Added for load-more
  const [initialLoad, setInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);

  const { get } = useGet();
  const itemsPerPage = 10; // Increased for better load-more UX

  const fetchReportData = () => {
    fetchReportHelper<RevenueReportData>({
      get,
      endpoint: '/reports/revenue',
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

  const handleLoadMore = createHandleLoadMore<RevenueReportData>({
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
      generateHTML: generateRevenueReportContent,
      setLoading: setGeneratingPDF,
      title: 'Revenue Report',
    });
  };

  const handleGenerateExcel = () => {
    generateAndShareExcel({
      generateWorkbook: () => generateRevenueExcelWorkbook(reportData),
      setLoading: setGeneratingExcel,
      title: 'Revenue Report Excel',
      filenamePrefix: 'revenue_report',
    });
  };

  const renderEmptyList = () => {
   return EmptyList(styles, colors, "Revenue");
  };


  const renderPDFLoadingOverlay = () => {
    return LoadingModal(generatingPDF, "PDF", colors);
  };

  const renderExcelLoadingOverlay = () => {
        return LoadingModal(generatingExcel, "Excel", colors);

  }

  return initialLoad ? (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* <StatusBar
        barStyle={dark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.card}
      /> */}
      <View style={styles.initialLoadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading revenue reports...
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
          Revenue Reports
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
        renderItem={({ item }) => (
          <RevenueReportItem item={item} formatCurrency={formatAEDCurrency} />
        )}
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

export default RevenueReport;
