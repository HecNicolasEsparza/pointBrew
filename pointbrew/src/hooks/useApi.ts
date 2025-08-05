import { useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<any>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
      return response.data;
    } catch (error: any) {
      let errorMessage = 'Error desconocido';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté corriendo.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Recurso no encontrado.';
      } else if (error.response?.status === 401) {
        errorMessage = 'No autorizado. Por favor inicia sesión nuevamente.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Timeout de conexión. Intenta nuevamente.';
      } else if (error.message.includes('Unexpected token')) {
        errorMessage = 'Error de formato en la respuesta del servidor.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Funciones específicas de API
export const storesApi = {
  getAll: () => apiClient.get('/api/stores'),
  getById: (id: string) => apiClient.get(`/api/stores/${id}`),
  create: (data: any) => apiClient.post('/api/stores', data),
  update: (id: string, data: any) => apiClient.put(`/api/stores/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/stores/${id}`),
};

export const categoriesApi = {
  getAll: () => apiClient.get('/api/categories'),
  getById: (id: string) => apiClient.get(`/api/categories/${id}`),
};

export const productsApi = {
  getAll: () => apiClient.get('/api/products'),
  getById: (id: string) => apiClient.get(`/api/products/${id}`),
  getByStore: (storeId: string) => apiClient.get(`/api/products/store/${storeId}`),
  create: (data: any) => apiClient.post('/api/products', data),
  update: (id: string, data: any) => apiClient.put(`/api/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/products/${id}`),
};
