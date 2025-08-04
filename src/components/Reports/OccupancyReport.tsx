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
import OccupancyReportItem from '../Items/OccupancyReportItem';
import generateOccupancyPDFContent from './PdfStructures/OccupancyReportContent';
import { generateAndSharePDF } from '../Reusable/GenerateAndSharePDF';
import { generateAndShareExcel } from '../Reusable/GenerateAndShareExcel';
import { generateOccupancyExcelWorkbook } from './ExcelStructures/occupancyExcelWorkbook';
import {
  OccupancyReportData,
  OccupancyReportResponse,
} from '../../types/OccupancyReport';
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

const OccupancyReport: React.FC = () => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;

  const [reportData, setReportData] = useState<OccupancyReportData[]>([]);
  const [displayData, setDisplayData] = useState<OccupancyReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedBookings, setExpandedBookings] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedPayments, setExpandedPayments] = useState<{
    [key: string]: boolean;
  }>({});

  const { get } = useGet();
  const itemsPerPage = 10;

  const fetchReportData = () => {
    fetchReportHelper<OccupancyReportData>({
      get,
      endpoint: '/reports/occupancy',
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
  const handleLoadMore = createHandleLoadMore<OccupancyReportData>({
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

  const toggleUnitExpansion = (unitId: number) => {
    const key = `${unitId}`;
    setExpandedUnits((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleBookingExpansion = (unitId: number, bookingId: number) => {
    const key = `${unitId}-${bookingId}`;
    setExpandedBookings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePaymentExpansion = (unitId: number, bookingId: number) => {
    const key = `${unitId}-${bookingId}-payments`;
    setExpandedPayments((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGeneratePDF = () => {
    generateAndSharePDF({
      data: reportData,
      generateHTML: generateOccupancyPDFContent,
      setLoading: setGeneratingPDF,
      title: 'Occupancy Report',
    });
  };

  const handleGenerateExcel = () => {
    generateAndShareExcel({
      generateWorkbook: () => generateOccupancyExcelWorkbook(reportData),
      setLoading: setGeneratingExcel,
      title: 'Occupancy Report Excel',
      filenamePrefix: 'occupancy_report',
    });
  };

  // Calculate overall statistics from all report data
  const overallStats = useMemo(() => {
    if (reportData.length === 0) return null;

    const totalUnits = reportData.reduce(
      (sum, report) => sum + report.totalUnits,
      0,
    );
    const totalOccupied = reportData.reduce(
      (sum, report) => sum + report.occupiedUnits,
      0,
    );
    const totalAvailable = reportData.reduce(
      (sum, report) => sum + report.availableUnits,
      0,
    );
    const avgOccupancyRate =
      reportData.reduce((sum, report) => sum + report.occupancyRate, 0) /
      reportData.length;

    return {
      totalUnits,
      totalOccupied,
      totalAvailable,
      avgOccupancyRate,
    };
  }, [reportData]);

  const renderEmptyList = () => {
   return EmptyList(styles, colors, "Occupancy");
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
          Loading occupancy reports...
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
          Occupancy Reports
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

      {/* Overall Statistics Summary */}
      {overallStats && (
        <View
          style={[
            styles.customerCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              margin: 16,
            },
          ]}
        >
          <View style={styles.customerHeader}>
            <Text style={[styles.customerName, { color: colors.text }]}>
              Overall Statistics
            </Text>
            <Text style={[styles.customerInfo, { color: colors.subtext }]}>
              Average Occupancy Rate: {overallStats.avgOccupancyRate.toFixed(2)}
              %
            </Text>
          </View>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                {overallStats.totalUnits}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.subtext }]}>
                Total Units
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                {overallStats.totalOccupied}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.subtext }]}>
                Occupied
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#FF9800' }]}>
                {overallStats.totalAvailable}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.subtext }]}>
                Available
              </Text>
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={displayData}
        renderItem={({ item }) => (
          <OccupancyReportItem
            item={item}
            formatCurrency={formatAEDCurrency}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            getPaymentMethodDisplay={getPaymentMethodDisplay}
            expandedUnits={expandedUnits}
            expandedBookings={expandedBookings}
            expandedPayments={expandedPayments}
            toggleUnitExpansion={toggleUnitExpansion}
            toggleBookingExpansion={toggleBookingExpansion}
            togglePaymentExpansion={togglePaymentExpansion}
          />
        )}
        keyExtractor={(item, index) => `${item.date}-${index}`}
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

export default OccupancyReport;
