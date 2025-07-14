import { Alert, InteractionManager } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

type GenerateExcelParams = {
  generateWorkbook: () => XLSX.WorkBook;
  setLoading: (loading: boolean) => void;
  title?: string;
  filenamePrefix?: string;
  noDataCheck?: boolean;
};

export const generateAndShareExcel = ({
  generateWorkbook,
  setLoading,
  title = 'Generated Excel Report',
  filenamePrefix = 'report',
  noDataCheck = false, // Set to true if you manually handle empty data check
}: GenerateExcelParams) => {
  setLoading(true);

  InteractionManager.runAfterInteractions(() => {
    setTimeout(async () => {
      try {
        const workbook = generateWorkbook();
        const sheetNames = workbook.SheetNames;

        if (
          !noDataCheck &&
          (!sheetNames.length || !workbook.Sheets[sheetNames[0]])
        ) {
          Alert.alert('No Data', 'No data available to generate Excel file');
          setLoading(false);
          return;
        }

        const excelBuffer = XLSX.write(workbook, {
          type: 'base64',
          bookType: 'xlsx',
        });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${filenamePrefix}_${timestamp}.xlsx`;
        const fileUri = `${FileSystem.documentDirectory}${filename}`;

        await FileSystem.writeAsStringAsync(fileUri, excelBuffer, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: title,
          });
        } else {
          Alert.alert('Success', 'Excel file generated successfully');
        }
      } catch (error) {
        console.error('Error generating Excel:', error);
        Alert.alert('Error', 'Failed to generate Excel file');
      }

      setLoading(false);
    }, 300);
  });
};
