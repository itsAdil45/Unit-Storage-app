import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  unitCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 2,
  },
  unitCardSelected: {
    shadowOpacity: 0.2,
  },
  unitCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  unitInfo: {
    flex: 1,
  },
  unitId: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  unitLocation: {
    fontSize: 14,
    marginBottom: 6,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  customerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  unitCardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 80,
  },
  percentageContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  progressBarContainer: {
    width: 60,
  },
  progressBarBackground: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4CD964',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default styles;