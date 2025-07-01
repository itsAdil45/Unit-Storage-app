import {
  StyleSheet,
} from 'react-native';

const  styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookingId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerInfo: {
    marginBottom: 12,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  customerEmail: {
    fontSize: 12,
    marginLeft: 8,
  },
  customerPhone: {
    fontSize: 12,
    marginLeft: 8,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentsContainer: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  paymentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentsTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentsCount: {
    fontSize: 12,
  },
  paymentsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentStat: {
    flex: 1,
    alignItems: 'center',
  },
  paymentStatLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  paymentStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 2,
  },
  pdfButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default  styles;