import { Alert, InteractionManager } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type GeneratePDFParams<T> = {
  data: T[];
  generateHTML: (data: T[]) => string;
  setLoading: (loading: boolean) => void;
  title?: string;
};

export const generateAndSharePDF = <T>({
  data,
  generateHTML,
  setLoading,
  title = 'Generated Report',
}: GeneratePDFParams<T>) => {
  setLoading(true);

  InteractionManager.runAfterInteractions(() => {
    setTimeout(async () => {
      if (data.length === 0) {
        Alert.alert('No Data', 'No data available to generate PDF');
        setLoading(false);
        return;
      }

      try {
        const htmlContent = generateHTML(data);
        const { uri } = await Print.printToFileAsync({ html: htmlContent });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: title,
          });
        } else {
          Alert.alert('Success', 'PDF generated successfully');
        }
      } catch (error) {
        console.error('Error generating PDF:', error);
        Alert.alert('Error', 'Failed to generate PDF');
      }

      setLoading(false);
    }, 300);
  });
};
