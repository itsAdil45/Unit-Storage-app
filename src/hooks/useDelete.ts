import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://chooseandmoves.cloud/unitapi';

export const useDelete = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const del = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await axios.delete(`${BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err: any) {
      setError(err);
      console.error('DELETE Error:', err?.response || err?.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { del, loading, error };
};
