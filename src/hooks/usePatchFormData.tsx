import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://chooseandmoves.cloud/unitapi';

interface ApiResponse<T = any> {
  status: string;
  message?: string;
  data?: T;
  [key: string]: any;
}

export const usePatchFormData = () => {
  const patchFormData = useCallback(
    async <T = any,>(
      endpoint: string,
      formData: FormData,
      token?: string,
    ): Promise<ApiResponse<T> | null> => {
      try {
        // If token not passed, try to fetch it from AsyncStorage
        const authToken = token || (await AsyncStorage.getItem('auth_token'));

        const headers: Record<string, string> = {};

        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        // Don't set Content-Type header for FormData - let the browser/RN set it with boundary

        const response = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'PATCH',
          headers,
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          // console.error('API Error:', data);
          // throw new Error(data.message || 'Unknown API error');
          console.error('API Error:', data);
          return {
            status: 'error',
            message: data.message || 'Unknown API error',
            error: data.message || 'Unknown API error',
          };
        }

        return {
          status: 'success',
          data: data.data,
          message: data.message,
        };
      } catch (error) {
        console.error('usePatchFormData error:', error);
        return null;
      }
    },
    [],
  );

  return { patchFormData };
};
