import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  pdfButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  initialLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  customerCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  customerHeader: {
    marginBottom: 16,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  inquiryId: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  paymentSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  //   paymentItem: {
  //     flex: 1,
  //     alignItems: 'center',
  //   },
  paymentLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookingsList: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bookingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bookingItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bookingHeader: {
    justifyContent: 'space-between',
    marginBottom: 8,
    flexDirection: 'column',
    gap: 8,
  },
  bookingId: {
    fontSize: 14,
    fontWeight: '600',
    // flex: 1,
  },
  unitNumber: {
    fontSize: 14,
    fontWeight: '500',
    // marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bookingInfo: {
    gap: 4,
  },
  bookingDetail: {
    fontSize: 13,
    lineHeight: 18,
  },
  paymentsCount: {
    alignItems: 'flex-end',
  },
  paymentsText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 50,
  },
  bookingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },

  expandedBookingContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  // Payment section styles
  paymentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginTop: 12,
  },

  paymentsHeaderContent: {
    flex: 1,
  },

  paymentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },

  paymentsSummary: {
    flexDirection: 'row',
    gap: 12,
  },

  paymentsSummaryText: {
    fontSize: 12,
    fontWeight: '500',
  },

  paymentsContainer: {
    marginTop: 8,
    gap: 8,
  },

  // Individual payment item styles
  paymentItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },

  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  paymentId: {
    fontSize: 14,
    fontWeight: '600',
  },

  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  paymentStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  paymentDetails: {
    gap: 4,
  },

  paymentDetail: {
    fontSize: 13,
    lineHeight: 18,
  },

  // PDF Loading Overlay styles
  pdfOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  pdfLoadingContainer: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  pdfLoadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },

  pdfLoadingSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },

  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },

  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  //   // If you want to keep the old pdfButton styles for backward compatibility
  //   pdfButton: {
  //     flexDirection: 'row',
  //     alignItems: 'center',
  //     paddingHorizontal: 12,
  //     paddingVertical: 8,
  //     borderRadius: 6,
  //     gap: 4,
  //   },

  //   pdfButtonText: {
  //     color: '#fff',
  //     fontSize: 14,
  //     fontWeight: '600',
  //   },
});

export default styles;
