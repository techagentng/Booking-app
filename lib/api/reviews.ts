import axiosInstance from '../axios';

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at?: string;
}

export const reviewsAPI = {
  // Service Reviews
  getServiceReviews: async (serviceId: string): Promise<Review[]> => {
    const response = await axiosInstance.get(`/public/services/${serviceId}/reviews`);
    return response.data;
  },

  addServiceReview: async (serviceId: string, data: { rating: number; comment: string }): Promise<Review> => {
    const response = await axiosInstance.post(`/customer/services/${serviceId}/reviews`, data);
    return response.data;
  },

  // Provider Reviews
  getProviderReviews: async (providerId: string): Promise<Review[]> => {
    const response = await axiosInstance.get(`/public/providers/${providerId}/reviews`);
    return response.data;
  },

  addProviderReview: async (providerId: string, data: { rating: number; comment: string }): Promise<Review> => {
    const response = await axiosInstance.post(`/customer/providers/${providerId}/reviews`, data);
    return response.data;
  },

  // Update Review
  updateReview: async (reviewId: string, data: { rating?: number; comment?: string }): Promise<Review> => {
    const response = await axiosInstance.put(`/customer/reviews/${reviewId}`, data);
    return response.data;
  },

  // Delete Review
  deleteReview: async (reviewId: string): Promise<void> => {
    await axiosInstance.delete(`/customer/reviews/${reviewId}`);
  },
};
