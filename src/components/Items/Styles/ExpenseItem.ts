import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
  expenseCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  expenseInfo: {
    flex: 1,
    marginRight: 8,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  expenseDetails: {
    fontSize: 11,
    marginBottom: 1,
  },
  cardActions: {
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'flex-start',
  },
  actionButton: {
    padding: 6,
    borderRadius: 8,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  expenseId: {
    fontSize: 11,
    fontWeight: '500',
  },
});
export default styles;
