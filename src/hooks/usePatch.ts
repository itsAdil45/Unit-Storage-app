import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://chooseandmoves.cloud/unitapi';

export const usePatch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const patch = async (endpoint: string, data = {}) => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('auth_token');

      const response = await axios.patch(`${BASE_URL}${endpoint}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (err: any) {
      setError(err);
      console.error('PATCH Error:', err?.response || err?.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { patch, loading, error };
};
