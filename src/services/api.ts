const API_BASE_URL = 'http://localhost:3001/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// API request helper with authentication
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Authentication API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    if (response.success && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
};

// Accounts API
export const accountsAPI = {
  getAccounts: async () => {
    return apiRequest('/accounts');
  },

  getAccount: async (accountId: string) => {
    return apiRequest(`/accounts/${accountId}`);
  },
};

// Payments API
export const paymentsAPI = {
  createPayment: async (accountId: string, amount: number, method: string) => {
    return apiRequest('/payments', {
      method: 'POST',
      body: JSON.stringify({ accountId, amount, method }),
    });
  },

  getPayment: async (paymentId: string) => {
    return apiRequest(`/payments/${paymentId}`);
  },

  getUserPayments: async (userId: string) => {
    return apiRequest(`/payments/user/${userId}`);
  },

  getReceipt: async (paymentId: string) => {
    return apiRequest(`/payments/${paymentId}/receipt`);
  },

  webhook: async (paymentId: string, status: string, externalId?: string) => {
    return apiRequest('/payments/webhook', {
      method: 'POST',
      body: JSON.stringify({ paymentId, status, externalId }),
    });
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    return fetch(`${API_BASE_URL.replace('/api', '')}/health`).then(res => res.json());
  },
};

export default {
  auth: authAPI,
  accounts: accountsAPI,
  payments: paymentsAPI,
  health: healthAPI,
};