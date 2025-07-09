import axios from 'axios';

// Configuração base do axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Serviço de autenticação
export const authService = {
  // Registrar novo usuário e tenant
  register: async (userData) => {
    try {
      const response = await api.post('/register', userData);
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('tenant', JSON.stringify(response.data.tenant));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Login de usuário
  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.tenants && response.data.tenants.length > 0) {
          localStorage.setItem('tenants', JSON.stringify(response.data.tenants));
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout de usuário
  logout: async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant');
      localStorage.removeItem('tenants');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  },

  // Verificar se o usuário está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obter usuário atual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar disponibilidade de subdomínio
  checkSubdomain: async (subdomain) => {
    try {
      const response = await api.post('/check-subdomain', { subdomain });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Serviço de tenant
export const tenantService = {
  // Obter informações do tenant
  getTenant: async (subdomain) => {
    try {
      const response = await api.get(`/tenant/${subdomain}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Atualizar configurações do tenant
  updateTenant: async (subdomain, data) => {
    try {
      const formData = new FormData();
      
      // Adicionar campos ao FormData
      Object.keys(data).forEach(key => {
        if (key === 'logo' && data[key] instanceof File) {
          formData.append('logo', data[key]);
        } else {
          formData.append(key, data[key]);
        }
      });
      
      const response = await api.put(`/tenant/${subdomain}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obter tenants do usuário atual
  getUserTenants: () => {
    const tenants = localStorage.getItem('tenants');
    return tenants ? JSON.parse(tenants) : [];
  },

  // Selecionar tenant atual
  selectTenant: (tenant) => {
    localStorage.setItem('tenant', JSON.stringify(tenant));
    return tenant;
  },

  // Obter tenant atual
  getCurrentTenant: () => {
    const tenant = localStorage.getItem('tenant');
    return tenant ? JSON.parse(tenant) : null;
  }
};

// Serviço de assinatura
export const subscriptionService = {
  // Iniciar assinatura
  subscribe: async (subdomain, data) => {
    try {
      const response = await api.post(`/tenant/${subdomain}/subscribe`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cancelar assinatura
  cancelSubscription: async (subdomain) => {
    try {
      const response = await api.post(`/tenant/${subdomain}/cancel-subscription`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Serviço de administração
export const adminService = {
  // Listar todos os tenants
  listTenants: async (params = {}) => {
    try {
      const response = await api.get('/admin/tenants', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obter detalhes de um tenant
  getTenant: async (id) => {
    try {
      const response = await api.get(`/admin/tenants/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Atualizar um tenant
  updateTenant: async (id, data) => {
    try {
      const response = await api.put(`/admin/tenants/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Estender período de teste
  extendTrial: async (id, days) => {
    try {
      const response = await api.post(`/admin/tenants/${id}/extend-trial`, { days });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Ativar/desativar tenant
  toggleActive: async (id) => {
    try {
      const response = await api.post(`/admin/tenants/${id}/toggle-active`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obter estatísticas
  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default api;