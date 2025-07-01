import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://chooseandmoves.cloud/unitapi';

export const useGet = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const get = async (endpoint: string, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('auth_token');

      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (err: any) {
      setError(err);
      console.error('GET Error:', err?.response || err?.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { get, loading, error };
};
