import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,

} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import {CustomerItemProps} from "../../types/Customers"



// Customer Item Component
const CustomerItem: React.FC<CustomerItemProps> = ({ 
  item: user, 
  index, 
  colors, 
  dark, 
  onEdit, 
  onEmail,
  onDeletePress
}) => {
  const getStatusColor = (deleted: number): string =>
    deleted === 0 ? '#4CAF50' : '#FF9800';

  const getInitials = (name: string): string =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const fullName = `${user.firstName} ${user.lastName}`;
  const status = user.deleted === 0 ? 'Active' : 'Inactive';

  return (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: "white", borderWidth: 0}]}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.card }]}>{getInitials(fullName)}</Text>
          </View>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(user.deleted), borderColor: colors.card },
            ]}
          />
        </View>

        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>{fullName}</Text>
          <Text style={[styles.userEmail, { color: colors.subtext }]} numberOfLines={1}>{user.email}</Text>
          <Text style={[styles.lastSeen, { color: colors.subtext }]}>Phone: {user.phone}</Text>
          <Text style={[styles.lastSeen, { color: colors.subtext }]}>Inquiry #: {user.inquiry}</Text>
          <Text style={[styles.lastSeen, { color: colors.subtext }]}>Address: {user.address}</Text>
          <Text style={[styles.lastSeen, { color: colors.subtext }]}>
            Created At: {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: dark ? colors.border : '#f8f9fa' }]}
            onPress={() => onEdit(user)}
          >
            <MaterialIcons name="edit" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: dark ? colors.border : '#f8f9fa' }]}
            onPress={onDeletePress}
          >
            <MaterialIcons name="delete" size={20} color={colors.notification} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: dark ? colors.border : '#f8f9fa' }]}
            onPress={() => onEmail(user.id)}
          >
            <MaterialCommunityIcons name="email-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.deleted) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(user.deleted) }]}>{status}</Text>
        </View>
        <Text style={[styles.userId, { color: colors.subtext }]}>ID: {user.id}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  userCard: {
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
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
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
  userInfo: {
    flex: 1,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    marginBottom: 2,
  },
  lastSeen: {
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  userId: {
    fontSize: 11,
    fontWeight: '500',
  },
  
});

export default CustomerItem;