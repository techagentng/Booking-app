import axiosInstance from '../axios';

export const adminAPI = {
  // Provider Verification
  getPendingVerifications: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/admin/providers/pending');
    return response.data;
  },

  getVerificationDetails: async (providerId: string): Promise<any> => {
    const response = await axiosInstance.get(`/admin/providers/${providerId}/verification`);
    return response.data;
  },

  approveProvider: async (providerId: string, data?: { notes?: string }): Promise<any> => {
    const response = await axiosInstance.put(`/admin/providers/${providerId}/verify`, data);
    return response.data;
  },

  rejectProvider: async (providerId: string, data: { reason: string; notes?: string }): Promise<any> => {
    const response = await axiosInstance.put(`/admin/providers/${providerId}/reject`, data);
    return response.data;
  },

  getAllVerifications: async (params?: { status?: string }): Promise<any[]> => {
    const response = await axiosInstance.get('/admin/verifications', { params });
    return response.data;
  },

  // Analytics
  getOverviewAnalytics: async (): Promise<any> => {
    const response = await axiosInstance.get('/admin/analytics/overview');
    return response.data;
  },

  getUserAnalytics: async (params?: { period?: string }): Promise<any> => {
    const response = await axiosInstance.get('/admin/analytics/users', { params });
    return response.data;
  },

  getBookingAnalytics: async (params?: { period?: string }): Promise<any> => {
    const response = await axiosInstance.get('/admin/analytics/bookings', { params });
    return response.data;
  },

  getRevenueAnalytics: async (params?: { period?: string }): Promise<any> => {
    const response = await axiosInstance.get('/admin/analytics/revenue', { params });
    return response.data;
  },

  getProviderAnalytics: async (params?: { period?: string }): Promise<any> => {
    const response = await axiosInstance.get('/admin/analytics/providers', { params });
    return response.data;
  },
};
