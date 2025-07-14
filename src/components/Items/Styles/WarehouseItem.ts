import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
  warehouseCard: {
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
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  warehouseInfo: {
    flex: 1,
    marginRight: 8,
  },
  warehouseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  warehouseAddress: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 18,
  },
  warehouseDetails: {
    fontSize: 12,
    marginBottom: 2,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  videoButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
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
  floorsSection: {
    marginTop: 8,
    marginBottom: 12,
  },
  floorsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  floorsTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  floorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  floorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  floorText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  idText: {
    fontSize: 11,
    fontWeight: '600',
  },
  updateDate: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default styles;
