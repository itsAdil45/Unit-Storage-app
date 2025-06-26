import { useCallback } from 'react';

const BASE_URL = 'https://chooseandmoves.cloud/unitapi';

interface ApiResponse<T = any> {
  status: string;
  message?: string;
  data?: T;
  [key: string]: any;
}

export const usePost = () => {
  const post = useCallback(async <T = any>(
    endpoint: string,
    payload: any,
    token?: string
  ): Promise<ApiResponse<T> | null> => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.message || 'Unknown API error');
      }

      return data;
    } catch (error) {
      console.error('usePost error:', error);
      return null;
    }
  }, []);

  return { post };
};
