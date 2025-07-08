import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://chooseandmoves.cloud/unitapi';

interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  error?: string;
  [key: string]: any;
}

export const usePostFormData = () => {
  const postFormData = useCallback(
    async <T = any>(
      endpoint: string,
      formData: FormData,
      token?: string,
    ): Promise<ApiResponse<T>> => {
      try {
        const authToken = token || (await AsyncStorage.getItem('auth_token'));

        const headers: Record<string, string> = {};
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'POST',
          headers,
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
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
      } catch (error: any) {
        console.error('usePostFormData error:', error);
        return {
          status: 'error',
          error: error.message || 'Something went wrong',
        };
      }
    },
    [],
  );

  return { postFormData };
};
