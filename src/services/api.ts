const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Helper to decide mock mode (no backend URL = use mocks)
const isMockMode = () => !API_BASE_URL;

// API request helper with authentication
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // In mock mode, short-circuit to mock responder
  if (isMockMode()) {
    return getMockResponse(endpoint, options);
  }

  const token = getAuthToken();

  const headers: Record<string, string> = {};
  // Only set JSON header when not sending FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as any),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return res.json();
  }
  return res.text();
};

// Mock response generator (UI dev)
const getMockResponse = (endpoint: string, options: RequestInit = {}) => {
  if (endpoint.includes('/cards/') && endpoint.includes('/status')) {
    return {
      success: true,
      data: {
        cardId: '660e8400-e29b-41d4-a716-446655440000',
        status: 'active',
        cardType: 'Platinum',
        cardNumber: '****-****-****-9012',
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  if (endpoint.includes('/cards/') && endpoint.includes('/block')) {
    const bodyStr = (options.body as string) || '{}';
    let body: any = {};
    try {
      body = JSON.parse(bodyStr);
    } catch {}
    return {
      success: true,
      message: `Card ${body.action === 'block' ? 'blocked' : 'unblocked'} successfully`,
      data: {
        cardId: '660e8400-e29b-41d4-a716-446655440000',
        status: body.action === 'block' ? 'blocked' : 'active',
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  if (endpoint.includes('/cards/applications') && options.method === 'POST') {
    // Simulate successful application submit
    return {
      success: true,
      data: {
        applicationId: `APP_${Date.now()}`,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      },
      message: 'Application submitted (MOCK)',
    };
  }

  if (endpoint.includes('/rewards')) {
    return {
      success: true,
      data: {
        totalPoints: 15750,
        redeemedPoints: 3170,
        availablePoints: 12580,
        nextMilestone: 25000,
        pointsToNext: 12420,
        recentTransactions: [
          {
            id: '1',
            transaction_type: 'earning',
            points_earned: 250,
            description: 'Earned from Amazon purchase',
            created_at: '2024-01-15T10:30:00Z',
          },
          {
            id: '2',
            transaction_type: 'earning',
            points_earned: 480,
            description: 'Earned from dining at restaurant',
            created_at: '2024-01-14T19:45:00Z',
          },
        ],
        redeemableOffers: [
          {
            id: 'cashback-500',
            title: '₹500 Cashback',
            description: 'Direct cashback to your account',
            pointsRequired: 5000,
            type: 'cashback',
            value: 500,
          },
          {
            id: 'bill-discount-1000',
            title: '₹1000 Bill Discount',
            description: 'Apply as discount to your next bill',
            pointsRequired: 10000,
            type: 'bill_discount',
            value: 1000,
          },
          {
            id: 'cashback-2500',
            title: '₹2500 Cashback',
            description: 'Premium cashback reward',
            pointsRequired: 25000,
            type: 'cashback',
            value: 2500,
          },
        ],
      },
    };
  }

  // Default mock response
  return { success: true, data: {}, message: 'Mock response' };
};

// -------------------- APIs -------------------- //

// Authentication API
export const authAPI = {
  login: async (email: string, password: string) => {
    if (isMockMode()) {
      const mockResponse = {
        success: true,
        data: {
          token: 'demo_jwt_token_' + Date.now(),
          user: { id: '550e8400-e29b-41d4-a716-446655440000', name: 'John Doe', email },
        },
      };
      localStorage.setItem('auth_token', mockResponse.data.token);
      localStorage.setItem('user', JSON.stringify(mockResponse.data.user));
      return mockResponse;
    }

    const resp = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Normalize possible backend shapes
    const token =
      (resp as any)?.accessToken || (resp as any)?.token || (resp as any)?.data?.token;
    const user =
      (resp as any)?.user || (resp as any)?.data?.user || { id: 'unknown', name: 'User', email };

    if (token) localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return { success: true, data: { token, user } };
  },

  register: async (name: string, email: string, password: string) => {
    if (isMockMode()) {
      const mockResponse = {
        success: true,
        data: {
          token: 'demo_jwt_token_' + Date.now(),
          user: { id: 'new_user_' + Date.now(), name, email, isNewUser: true },
        },
      };
      localStorage.setItem('auth_token', mockResponse.data.token);
      localStorage.setItem('user', JSON.stringify(mockResponse.data.user));
      return mockResponse;
    }

    const resp = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    const token =
      (resp as any)?.accessToken || (resp as any)?.token || (resp as any)?.data?.token;
    const user =
      (resp as any)?.user ||
      (resp as any)?.data?.user || { id: (resp as any)?.id || 'unknown', name, email };

    if (token) localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return { success: true, data: { token, user } };
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
      return {
        success: true,
        data: [
          {
            id: '660e8400-e29b-41d4-a716-446655440000',
            cardNumber: '****-****-****-9012',
            cardType: 'Platinum',
            creditLimit: 500000,
            outstandingBalance: 45320,
            availableCredit: 454680,
          },
        ],
      };
    }
  },

  getAccount: async (accountId: string) => {
    try {
      return await apiRequest(`/accounts/${accountId}`);
    } catch (error) {
      console.error('Get account error:', error);
      return {
        success: true,
        data: {
          id: accountId,
          cardNumber: '****-****-****-9012',
          cardType: 'Platinum',
          creditLimit: 500000,
          outstandingBalance: 45320,
          availableCredit: 454680,
          status: 'active',
        },
      };
    }
  },
};

// Payments API (demo behaviors kept)
export const paymentsAPI = {
  createPayment: async (accountId: string, amount: number, method: string) => {
    try {
      if (!accountId || !amount || !method) throw new Error('Missing required payment parameters');
      if (amount <= 0) throw new Error('Payment amount must be greater than zero');
      if (!['bank', 'card', 'instant'].includes(method))
        throw new Error('Invalid payment method. Must be bank, card, or instant');

      const isSuccess = Math.random() > 0.05;
      const mockResponse = {
        success: isSuccess,
        message: isSuccess
          ? `Payment of ₹${amount.toLocaleString()} successful`
          : 'Payment gateway temporarily unavailable. Please try again in a few moments.',
        data: {
          paymentId: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          amount,
          method,
          status: isSuccess ? 'success' : 'failed',
          newBalance: isSuccess ? 45320 - amount : 45320,
          timestamp: new Date().toISOString(),
        },
      };
      await new Promise((r) => setTimeout(r, 1000 + Math.random() * 2000));
      if (!isSuccess) throw new Error(mockResponse.message);
      return mockResponse;
    } catch (error) {
      console.error('Payment API error:', error);
      throw error;
    }
  },

  getPayment: async (paymentId: string) => apiRequest(`/payments/${paymentId}`),
  getUserPayments: async (userId: string) => apiRequest(`/payments/user/${userId}`),
  getReceipt: async (paymentId: string) => apiRequest(`/payments/${paymentId}/receipt`),
  webhook: async (paymentId: string, status: string, externalId?: string) =>
    apiRequest('/payments/webhook', { method: 'POST', body: JSON.stringify({ paymentId, status, externalId }) }),
};

// Health check
export const healthAPI = {
  check: async () => {
    try {
      // if API_BASE_URL ends with /api, hit /api/health; otherwise just /health
      const url = API_BASE_URL ? `${API_BASE_URL}/health`.replace('//health', '/health') : '/api/health';
      return fetch(url).then((res) => res.json());
    } catch (error) {
      console.error('Health check error:', error);
      return { success: false, message: 'Service unavailable' };
    }
  },
};

// Profile API
export const profileAPI = {
  getProfile: async () => apiRequest('/profile'),
  updateContact: async (phone: string, address: string) =>
    apiRequest('/profile/contact', { method: 'PUT', body: JSON.stringify({ phone, address }) }),
  changePassword: async (currentPassword: string, newPassword: string) =>
    apiRequest('/profile/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),
};

// Cards API (includes submitApplication for Apply flow)
export const cardsAPI = {
  blockCard: async (cardId: string, action: 'block' | 'unblock') =>
    apiRequest(`/cards/${cardId}/block`, { method: 'PUT', body: JSON.stringify({ action }) }),

  getCardStatus: async (cardId: string) => apiRequest(`/cards/${cardId}/status`),

  // For Apply Card page (expects backend route POST /cards/applications with multipart/form-data)
  submitApplication: async (formData: FormData) =>
    apiRequest('/cards/applications', { method: 'POST', body: formData }),
};

// Rewards API (named export because hooks import it as { rewardsAPI })
export const rewardsAPI = {
  getRewards: async () => {
    try {
      return await apiRequest('/rewards');
    } catch (error) {
      console.error('Get rewards error:', error);
      // Mock fallback so UI works without backend
      return {
        success: true,
        data: {
          totalPoints: 15750,
          redeemedPoints: 3170,
          availablePoints: 12580,
          nextMilestone: 25000,
          pointsToNext: 12420,
          recentTransactions: [
            {
              id: '1',
              transaction_type: 'earning',
              points_earned: 250,
              description: 'Earned from Amazon purchase',
              created_at: '2024-01-15T10:30:00Z',
            },
            {
              id: '2',
              transaction_type: 'earning',
              points_earned: 480,
              description: 'Earned from dining at restaurant',
              created_at: '2024-01-14T19:45:00Z',
            },
          ],
          redeemableOffers: [
            {
              id: 'cashback-500',
              title: '₹500 Cashback',
              description: 'Direct cashback to your account',
              pointsRequired: 5000,
              type: 'cashback',
              value: 500,
            },
            {
              id: 'bill-discount-1000',
              title: '₹1000 Bill Discount',
              description: 'Apply as discount to your next bill',
              pointsRequired: 10000,
              type: 'bill_discount',
              value: 1000,
            },
            {
              id: 'cashback-2500',
              title: '₹2500 Cashback',
              description: 'Premium cashback reward',
              pointsRequired: 25000,
              type: 'cashback',
              value: 2500,
            },
          ],
        },
      };
    }
  },

  redeemReward: async (
    offerId: string,
    pointsRequired: number,
    rewardType: string,
    rewardValue: number
  ) => {
    try {
      return await apiRequest('/rewards/redeem', {
        method: 'POST',
        body: JSON.stringify({ offerId, pointsRequired, rewardType, rewardValue }),
      });
    } catch (error) {
      console.error('Redeem reward error:', error);
      // Keep the UI flowing in mock mode
      return { success: true };
    }
  },
};

// Single default export (kept for existing imports)
export default {
  auth: authAPI,
  accounts: accountsAPI,
  payments: paymentsAPI,
  profile: profileAPI,
  cards: cardsAPI,
  rewards: rewardsAPI, // <-- important: also expose in default export
  health: healthAPI,
};
