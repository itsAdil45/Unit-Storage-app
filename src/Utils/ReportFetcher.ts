import { Alert } from 'react-native';

interface FetchReportParams<T> {
  get: (endpoint: string, params?: object) => Promise<any>;
  endpoint: string;
  dataKey: string;
  itemsPerPage: number;
  setReportData: (data: T[]) => void;
  setDisplayData: (data: T[]) => void;
  setLoading: (value: boolean) => void;
  initialLoad: boolean;
  setInitialLoad: (value: boolean) => void;
}

export async function fetchReportHelper<T>({
  get,
  endpoint,
  dataKey,
  itemsPerPage,
  setReportData,
  setDisplayData,
  setLoading,
  initialLoad,
  setInitialLoad,
}: FetchReportParams<T>): Promise<void> {
  setLoading(true);
  try {
    const res = await get(endpoint);
    if (res?.status === 'success') {
      const data: T[] = res.data[dataKey] || [];
      setReportData(data);
      setDisplayData(data.slice(0, itemsPerPage));
    } else {
      throw new Error('Invalid response');
    }
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    Alert.alert('Error', `Failed to fetch report`);
    setReportData([]);
    setDisplayData([]);
  }
  setLoading(false);
  if (initialLoad) setInitialLoad(false);
}
