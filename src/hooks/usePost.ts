import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://chooseandmoves.cloud/unitapi';

interface ApiResponse<T = any> {
  status: string;
  message?: string;
  data?: T;
  [key: string]: any;
}

export const usePost = () => {
  const post = useCallback(
    async <T = any>(
      endpoint: string,
      payload: any,
      token?: string,
    ): Promise<ApiResponse<T> | null> => {
      try {
        // If token not passed, try to fetch it from AsyncStorage
        const authToken = token || (await AsyncStorage.getItem('auth_token'));

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
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
        console.error('usePost error:', error);
        return null;
      }
    },
    [],
  );

  return { post };
};
