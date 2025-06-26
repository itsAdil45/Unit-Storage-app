import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useGet } from '../../hooks/useGet';
import { lightColors, darkColors } from '../../constants/color';
const { height: screenHeight } = Dimensions.get('window');
interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  inquiry: string;
  address: string;
  createdAt: string;
  deleted: 0 | 1;
}



interface Email {
  id: number;
  recipientEmail: string;
  userId: number;
  emailType: string;
  subject: string;
  content: string;
  senderModule: string;
  relatedEntityId: number;
  status: string;
  sentAt: string;
  deleted: number;
}

interface EmailModalProps {
  visible: boolean;
  userId: number;
  onClose: () => void;
}

const EmailLogModal: React.FC<EmailModalProps> = ({ visible, userId, onClose }) => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const { get, loading } = useGet();

  const [emails, setEmails] = useState<Email[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (visible) {
      fetchEmails();
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const fetchEmails = async (pg = 1) => {
    const response = await get(`/emails/user/${userId}?page=${pg}&limit=5`);
    if (response?.status === 'success') {
      setEmails(response.data.emails || []);
      setTotalPages(parseInt(response.data.pagination.totalPages) || 1);
      setPage(pg);
    }
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const renderEmail = ({ item }: { item: Email }) => (
    <View style={[styles.emailItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={styles.emailHeader}>
        <Text style={[styles.emailSubject, { color: colors.text }]} numberOfLines={1}>
          {item.subject}
        </Text>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: item.status === 'sent' ? '#4CAF50' : '#FF9800' + '20' }
        ]}>
          <Text style={[
            styles.statusText, 
            { color: item.status === 'sent' ? '#4CAF50' : '#FF9800' }
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={[styles.emailType, { color: colors.subtext }]}>
        Type: {item.emailType.replace(/_/g, ' ')}
      </Text>
      <Text style={[styles.emailDate, { color: colors.subtext }]}>
        Sent: {new Date(item.sentAt).toLocaleString()}
      </Text>
      <Text style={[styles.emailRecipient, { color: colors.subtext }]}>
        To: {item.recipientEmail}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <StatusBar backgroundColor="rgba(0,0,0,0.6)" barStyle={dark ? 'light-content' : 'dark-content'} />
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.emailModal,
            { backgroundColor: colors.card, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Email History</Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.background }]}
              onPress={handleClose}
            >
              <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.emailLoadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>Loading emails...</Text>
            </View>
          ) : (
            <FlatList
              data={emails}
              renderItem={renderEmail}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.emailList}
              ListEmptyComponent={
                <View style={styles.emptyEmailContainer}>
                  {/* <MaterialIcons name="email-outline" size={48} color={colors.subtext} /> */}
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No emails found</Text>
                </View>
              }
            />
          )}

          {totalPages > 1 && (
            <View style={styles.emailPaginationContainer}>
              <TouchableOpacity
                style={[
                  styles.emailNavButton,
                  { 
                    backgroundColor: page > 1 ? colors.primary : colors.border,
                    borderColor: colors.border 
                  }
                ]}
                onPress={() => fetchEmails(page - 1)}
                disabled={page <= 1 || loading}
              >
                <Text style={[
                  styles.emailNavButtonText, 
                  { color: page > 1 ? '#fff' : colors.subtext }
                ]}>
                  Previous
                </Text>
              </TouchableOpacity>

              <Text style={[styles.emailPageText, { color: colors.text }]}>
                {page} / {totalPages}
              </Text>

              <TouchableOpacity
                style={[
                  styles.emailNavButton,
                  { 
                    backgroundColor: page < totalPages ? colors.primary : colors.border,
                    borderColor: colors.border 
                  }
                ]}
                onPress={() => fetchEmails(page + 1)}
                disabled={page >= totalPages || loading}
              >
                <Text style={[
                  styles.emailNavButtonText, 
                  { color: page < totalPages ? '#fff' : colors.subtext }
                ]}>
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
},
closeButton: {
  width: 32,
  height: 32,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
},
closeButtonText: {
  fontSize: 18,
  fontWeight: 'bold',
},
    emailModal: {
  maxHeight: '80%',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingTop: 20,
  paddingBottom: 20,
},
emailList: {
  paddingHorizontal: 20,
  paddingBottom: 20,
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  marginBottom: 20,
},
overlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.6)',
  justifyContent: 'flex-end',
},

emailItem: {
  padding: 16,
  borderRadius: 12,
  marginBottom: 12,
  borderWidth: 1,
},
emailHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 8,
},
emailSubject: {
  fontSize: 16,
  fontWeight: '600',
  flex: 1,
  marginRight: 8,
},
emailType: {
  fontSize: 12,
  marginBottom: 4,
  textTransform: 'capitalize',
},
emailDate: {
  fontSize: 12,
  marginBottom: 4,
},
emailRecipient: {
  fontSize: 12,
},
emailLoadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: 40,
},
emptyEmailContainer: {
  alignItems: 'center',
  paddingVertical: 40,
},
emailPaginationContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingTop: 16,
},
emailNavButton: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 6,
  borderWidth: 1,
  minWidth: 80,
  alignItems: 'center',
},
emailNavButtonText: {
  fontSize: 14,
  fontWeight: '600',
},
emailPageText: {
  fontSize: 14,
  fontWeight: '500',
},
  loadingText: {
    fontSize: 14,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },  
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 4,
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
})

export default EmailLogModal;