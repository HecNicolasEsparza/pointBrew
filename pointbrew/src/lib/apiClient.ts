import axios from 'axios';

// Configuración base de axios
const apiClient = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejo específico de errores
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend no está disponible');
    } else if (error.response?.status === 401) {
      console.error('Token expirado o inválido');
      localStorage.removeItem('token');
      // Redirigir a login si es necesario
      window.location.href = '/auth/login';
    } else if (error.response?.status === 404) {
      console.error('Endpoint no encontrado:', error.config?.url);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
