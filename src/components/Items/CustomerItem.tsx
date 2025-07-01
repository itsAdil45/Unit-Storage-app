import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CustomerItemProps } from '../../types/Customers';
import styles from './Styles/CustomerItem';



const CustomerItem: React.FC<CustomerItemProps> = ({
  item: user,
  index,
  colors,
  dark,
  onEdit,
  onEmail,
  onDeletePress,
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
      style={[
        styles.userCard,
        { backgroundColor: dark ? colors.card : 'white', borderWidth: 0 },
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.card }]}>
              {getInitials(fullName)}
            </Text>
          </View>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: getStatusColor(user.deleted),
                borderColor: colors.card,
              },
            ]}
          />
        </View>

        <View style={styles.userInfo}>
          <Text
            style={[styles.userName, { color: colors.text }]}
            numberOfLines={1}
          >
            {fullName}
          </Text>
          <Text
            style={[styles.userEmail, { color: colors.subtext }]}
            numberOfLines={1}
          >
            {user.email}
          </Text>
          <Text style={[styles.lastSeen, { color: colors.subtext }]}>
            Phone: {user.phone}
          </Text>
          <Text style={[styles.lastSeen, { color: colors.subtext }]}>
            Inquiry #: {user.inquiry}
          </Text>
          <Text style={[styles.lastSeen, { color: colors.subtext }]}>
            Address: {user.address}
          </Text>
          <Text style={[styles.lastSeen, { color: colors.subtext }]}>
            Created At: {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: dark ? colors.border : '#f8f9fa' },
            ]}
            onPress={() => onEdit(user)}
          >
            <MaterialIcons name="edit" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: dark ? colors.border : '#f8f9fa' },
            ]}
            onPress={onDeletePress}
          >
            <MaterialIcons
              name="delete"
              size={20}
              color={colors.notification}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: dark ? colors.border : '#f8f9fa' },
            ]}
            onPress={() => onEmail(user.id)}
          >
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(user.deleted) + '20' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(user.deleted) }]}
          >
            {status}
          </Text>
        </View>
        <Text style={[styles.userId, { color: colors.subtext }]}>
          ID: {user.id}
        </Text>
      </View>
    </TouchableOpacity>
  );
};


export default CustomerItem;
