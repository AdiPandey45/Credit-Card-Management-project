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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      // For demo purposes, simulate successful login
      // In production, this would make an actual API call
      const mockResponse = {
        success: true,
        data: {
          token: 'demo_jwt_token_' + Date.now(),
          user: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'John Doe',
            email: email
          }
        }
      };

      if (mockResponse.success && mockResponse.data.token) {
        localStorage.setItem('auth_token', mockResponse.data.token);
        localStorage.setItem('user', JSON.stringify(mockResponse.data.user));
      }
      
      return mockResponse;
    } catch (error) {
      console.error('Login API error:', error);
      throw new Error('Login failed. Please try again.');
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      
      if (response.success && response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
};

// Accounts API
export const accountsAPI = {
  getAccounts: async () => {
    try {
      return await apiRequest('/accounts');
    } catch (error) {
      console.error('Get accounts error:', error);
      // Return mock data for demo
      return {
        success: true,
        data: [{
          id: '660e8400-e29b-41d4-a716-446655440000',
          cardNumber: '****-****-****-9012',
          cardType: 'Platinum',
          creditLimit: 500000,
          outstandingBalance: 45320,
          availableCredit: 454680
        }]
      };
    }
  },

  getAccount: async (accountId: string) => {
    try {
      return await apiRequest(`/accounts/${accountId}`);
    } catch (error) {
      console.error('Get account error:', error);
      // Return mock data for demo
      return {
        success: true,
        data: {
          id: accountId,
          cardNumber: '****-****-****-9012',
          cardType: 'Platinum',
          creditLimit: 500000,
          outstandingBalance: 45320,
          availableCredit: 454680,
          status: 'active'
        }
      };
    }
  },
};

// Payments API
export const paymentsAPI = {
  createPayment: async (accountId: string, amount: number, method: string) => {
    try {
      // Validate inputs before making request
      if (!accountId || !amount || !method) {
        throw new Error('Missing required payment parameters');
      }
      
      if (amount <= 0) {
        throw new Error('Payment amount must be greater than zero');
      }
      
      if (!['bank', 'card', 'instant'].includes(method)) {
        throw new Error('Invalid payment method. Must be bank, card, or instant');
      }
      
      // Simulate payment processing for demo
      const isSuccess = Math.random() > 0.05; // 95% success rate for more realistic testing
      
      const mockResponse = {
        success: isSuccess,
        message: isSuccess 
          ? `Payment of ₹${amount.toLocaleString()} successful`
          : 'Payment gateway temporarily unavailable. Please try again in a few moments.',
        data: {
          paymentId: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          amount: amount,
          method: method,
          status: isSuccess ? 'success' : 'failed',
          newBalance: isSuccess ? 45320 - amount : 45320,
          timestamp: new Date().toISOString()
        }
      };

      // Simulate realistic network delay (1-3 seconds)
      const delay = 1000 + Math.random() * 2000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (!isSuccess) {
        throw new Error(mockResponse.message);
      }
      
      return mockResponse;
    } catch (error) {
      console.error('Payment API error:', error);
      throw error;
    }
  },

  getPayment: async (paymentId: string) => {
    try {
      return await apiRequest(`/payments/${paymentId}`);
    } catch (error) {
      console.error('Get payment error:', error);
      throw error;
    }
  },

  getUserPayments: async (userId: string) => {
    try {
      return await apiRequest(`/payments/user/${userId}`);
    } catch (error) {
      console.error('Get user payments error:', error);
      // Return mock data for demo
      return {
        success: true,
        data: [],
        count: 0
      };
    }
  },

  getReceipt: async (paymentId: string) => {
    try {
      return await apiRequest(`/payments/${paymentId}/receipt`);
    } catch (error) {
      console.error('Get receipt error:', error);
      throw error;
    }
  },

  webhook: async (paymentId: string, status: string, externalId?: string) => {
    try {
      return await apiRequest('/payments/webhook', {
        method: 'POST',
        body: JSON.stringify({ paymentId, status, externalId }),
      });
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    try {
      return fetch(`${API_BASE_URL.replace('/api', '')}/health`).then(res => res.json());
    } catch (error) {
      console.error('Health check error:', error);
      return { success: false, message: 'Service unavailable' };
    }
  },
};

export default {
  auth: authAPI,
  accounts: accountsAPI,
  payments: paymentsAPI,
  health: healthAPI,
};