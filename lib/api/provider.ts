import axiosInstance from '../axios';

export interface ProviderRegistration {
  email: string;
  password: string;
  business_name: string;
  business_type: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface BusinessInfo {
  business_name: string;
  business_type: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  description?: string;
}

export interface Service {
  name: string;
  type: string;
  description: string;
  price?: number;
  features?: string[];
  image_url?: string;
}

export interface VerificationStatus {
  status: 'pending' | 'approved' | 'rejected';
  submitted_at?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  documents?: {
    id: string;
    type: string;
    status: string;
    url?: string;
  }[];
}

export const providerAPI = {
  register: async (data: ProviderRegistration): Promise<{ id: string; message: string }> => {
    const response = await axiosInstance.post('/public/onboarding/register', data);
    return response.data;
  },

  verifyEmail: async (data: { email: string; code: string }): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/public/onboarding/verify-email', data);
    return response.data;
  },

  updateBusinessInfo: async (data: BusinessInfo): Promise<{ message: string }> => {
    const response = await axiosInstance.put('/provider/onboarding/business-info', data);
    return response.data;
  },

  createServices: async (data: Service[]): Promise<{ message: string; services: any[] }> => {
    const response = await axiosInstance.post('/provider/onboarding/services', { services: data });
    return response.data;
  },

  getVerificationStatus: async (): Promise<VerificationStatus> => {
    const response = await axiosInstance.get('/provider/onboarding/verification');
    return response.data;
  },

  completeTraining: async (moduleId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post(`/provider/onboarding/training/${moduleId}`);
    return response.data;
  },

  activateAccount: async (): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/provider/onboarding/activate');
    return response.data;
  },

  getOnboardingStatus: async (): Promise<{ phase: number; completed_steps: string[] }> => {
    const response = await axiosInstance.get('/provider/onboarding/status');
    return response.data;
  },

  getServices: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/provider/services');
    return response.data;
  },

  addService: async (data: Service): Promise<any> => {
    const response = await axiosInstance.post('/provider/services', data);
    return response.data;
  },

  updateService: async (id: string, data: Partial<Service>): Promise<any> => {
    const response = await axiosInstance.put(`/provider/services/${id}`, data);
    return response.data;
  },

  deleteService: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/provider/services/${id}`);
  },

  toggleServiceAvailability: async (id: string, available: boolean): Promise<void> => {
    await axiosInstance.patch(`/provider/services/${id}/availability`, { available });
  },

  // Earnings & Analytics
  getEarnings: async (params?: { start_date?: string; end_date?: string }): Promise<any[]> => {
    const response = await axiosInstance.get('/provider/earnings', { params });
    return response.data;
  },

  getEarning: async (id: string): Promise<any> => {
    const response = await axiosInstance.get(`/provider/earnings/${id}`);
    return response.data;
  },

  getAnalytics: async (params?: { period?: string }): Promise<any> => {
    const response = await axiosInstance.get('/provider/analytics', { params });
    return response.data;
  },

  getDashboardAnalytics: async (): Promise<any> => {
    const response = await axiosInstance.get('/provider/analytics/dashboard');
    return response.data;
  },

  requestPayout: async (data: { amount: number; bank_account: string }): Promise<any> => {
    const response = await axiosInstance.post('/provider/payouts/request', data);
    return response.data;
  },
};
