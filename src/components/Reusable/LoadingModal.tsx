
import { Modal, View, ActivityIndicator, Text, StyleSheet } from "react-native";

  const LoadingModal = (generating:boolean, fileName:string,colors:any) => {
      return  (<Modal
      visible={generating}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.pdfOverlay}>
        <View
          style={[styles.pdfLoadingContainer, { backgroundColor: colors.card }]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.pdfLoadingText, { color: colors.text }]}>
            Generating {fileName}...
          </Text>
          <Text style={[styles.pdfLoadingSubtext, { color: colors.subtext }]}>
            Please wait while we prepare your report
          </Text>
        </View>
      </View>
    </Modal>
  )};
export default LoadingModal;
  const styles = StyleSheet.create({
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


  })