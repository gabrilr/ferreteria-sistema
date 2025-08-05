// Configuración del API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Función principal para hacer requests al API
export const apiRequest = async (endpoint, options = {}, token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Funciones específicas para autenticación
export const authAPI = {
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  validateToken: async (token) => {
    return apiRequest('/auth/validate-token', {
      method: 'POST',
    }, token);
  }
};

// Funciones específicas para usuarios
export const usersAPI = {
  getAll: (token) => apiRequest('/users', {}, token),
  
  getById: (id, token) => apiRequest(`/users/${id}`, {}, token),
  
  create: (userData, token) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }, token),
  
  update: (id, userData, token) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }, token),
  
  delete: (id, token) => apiRequest(`/users/${id}`, {
    method: 'DELETE',
  }, token)
};

// Funciones específicas para productos
export const productosAPI = {
  getAll: (token) => apiRequest('/productos', {}, token),
  
  getById: (id, token) => apiRequest(`/productos/${id}`, {}, token),
  
  create: (productData, token) => apiRequest('/productos', {
    method: 'POST',
    body: JSON.stringify(productData),
  }, token),
  
  update: (id, productData, token) => apiRequest(`/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  }, token),
  
  delete: (id, token) => apiRequest(`/productos/${id}`, {
    method: 'DELETE',
  }, token),

  updateStock: (id, stock, token) => apiRequest(`/productos/${id}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ stock }),
  }, token)
};

// Funciones específicas para proveedores
export const proveedoresAPI = {
  getAll: (token) => apiRequest('/proveedores', {}, token),
  
  getById: (id, token) => apiRequest(`/proveedores/${id}`, {}, token),
  
  create: (proveedorData, token) => apiRequest('/proveedores', {
    method: 'POST',
    body: JSON.stringify(proveedorData),
  }, token),
  
  update: (id, proveedorData, token) => apiRequest(`/proveedores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(proveedorData),
  }, token),
  
  delete: (id, token) => apiRequest(`/proveedores/${id}`, {
    method: 'DELETE',
  }, token)
};

// Funciones específicas para categorías
export const categoriasAPI = {
  getAll: (token) => apiRequest('/categorias', {}, token),
  
  getById: (id, token) => apiRequest(`/categorias/${id}`, {}, token),
  
  create: (categoriaData, token) => apiRequest('/categorias', {
    method: 'POST',
    body: JSON.stringify(categoriaData),
  }, token),
  
  update: (id, categoriaData, token) => apiRequest(`/categorias/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoriaData),
  }, token),
  
  delete: (id, token) => apiRequest(`/categorias/${id}`, {
    method: 'DELETE',
  }, token)
};

// Funciones específicas para ventas
export const ventasAPI = {
  getAll: (token) => apiRequest('/ventas', {}, token),
  
  getById: (id, token) => apiRequest(`/ventas/${id}`, {}, token),
  
  getToday: (token) => apiRequest('/ventas/today', {}, token),
  
  getByDate: (fecha, token) => apiRequest(`/ventas/fecha/${fecha}`, {}, token),
  
  create: (ventaData, token) => apiRequest('/ventas', {
    method: 'POST',
    body: JSON.stringify(ventaData),
  }, token),
  
  cancel: (id, token) => apiRequest(`/ventas/${id}/cancelar`, {
    method: 'PUT',
  }, token),

  getStats: (fechaInicio, fechaFin, token) => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);
    
    return apiRequest(`/ventas/stats?${params.toString()}`, {}, token);
  }
};

// Funciones específicas para corte de caja
export const corteCajaAPI = {
  getAll: (token) => apiRequest('/corte-caja', {}, token),
  
  getToday: (token) => apiRequest('/corte-caja/today', {}, token),
  
  getResumenToday: (token) => apiRequest('/corte-caja/resumen/today', {}, token),
  
  create: (corteData, token) => apiRequest('/corte-caja', {
    method: 'POST',
    body: JSON.stringify(corteData),
  }, token),

  getEstadisticas: (fechaInicio, fechaFin, token) => {
    const params = new URLSearchParams({ fechaInicio, fechaFin });
    return apiRequest(`/corte-caja/estadisticas/periodo?${params.toString()}`, {}, token);
  }
};

export default {
  apiRequest,
  authAPI,
  usersAPI,
  productosAPI,
  proveedoresAPI,
  categoriasAPI,
  ventasAPI,
  corteCajaAPI
};