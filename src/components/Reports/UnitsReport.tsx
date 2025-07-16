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
import LoadMorePagination from '../Reusable/LoadMorePagination';
import styles from './Styles/CustomerReport';
import UnitsReportItem from '../Items/UnitsReportItem';
import generateUnitPDFContent from './PdfStructures/UnitPDFContent';
import { generateUnitExcelWorkbook } from './ExcelStructures/UnitExcelWorkbook';
import { generateAndSharePDF } from '../Reusable/GenerateAndSharePDF';
import { generateAndShareExcel } from '../Reusable/GenerateAndShareExcel';
import { UnitReportData, ApiResponse } from '../../types/StorageUnitsReport';
import {
  formatDate,
  getStatusColor,
  formatAEDCurrency,
} from '../../Utils/Formatters';
import { fetchReportHelper } from '../../Utils/ReportFetcher';
import {
  createHandleLoadMore,
  useTotalPages,
} from '../../Utils/PaginationUtils';
import LoadingModal from '../Reusable/LoadingModal';
import EmptyList from '../Reusable/EmptyList';

const UnitsReport: React.FC = () => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;

  const [reportData, setReportData] = useState<UnitReportData[]>([]);
  const [displayData, setDisplayData] = useState<UnitReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);
  const [expandedBookings, setExpandedBookings] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedPayments, setExpandedPayments] = useState<{
    [key: string]: boolean;
  }>({});

  const { get } = useGet();
  const itemsPerPage = 10;

  const fetchReportData = () => {
    fetchReportHelper<UnitReportData>({
      get,
      endpoint: '/reports/storage-units',
      dataKey: 'reportData',
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

  const handleLoadMore = createHandleLoadMore<UnitReportData>({
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

  const getPaymentMethodDisplay = (method: string | null) =>
    method
      ? method.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      : 'Not specified';

  const toggleBookingExpansion = (email: string, bookingId: number) => {
    const key = `${email}-${bookingId}`;
    setExpandedBookings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePaymentExpansion = (email: string, bookingId: number) => {
    const key = `${email}-${bookingId}-payments`;
    setExpandedPayments((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGeneratePDF = () => {
    generateAndSharePDF({
      data: reportData,
      generateHTML: generateUnitPDFContent,
      setLoading: setGeneratingPDF,
      title: 'Units Report',
    });
  };

  const handleGenerateExcel = () => {
    generateAndShareExcel({
      generateWorkbook: () => generateUnitExcelWorkbook(reportData),
      setLoading: setGeneratingExcel,
      title: 'Unit Report Excel',
      filenamePrefix: 'Units_Report',
    });
  };

  const renderEmptyList = () => {
   return EmptyList(styles, colors, "Units");
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
          Loading units reports...
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
          Units Reports
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
          <UnitsReportItem
            item={item}
            formatCurrency={formatAEDCurrency}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            getPaymentMethodDisplay={getPaymentMethodDisplay}
            expandedBookings={expandedBookings}
            expandedPayments={expandedPayments}
            toggleBookingExpansion={toggleBookingExpansion}
            togglePaymentExpansion={togglePaymentExpansion}
          />
        )}
        keyExtractor={(item, index) => `${item.unitId}-${index}`}
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

export default UnitsReport;
