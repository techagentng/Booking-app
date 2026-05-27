import axiosInstance from '../axios';

export interface CustomerProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  preferred_city?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  identity_verified?: boolean;
  status?: string;
}

export interface SavedService {
  id: string;
  service_id?: string;
  service_name: string;
  service_type: string;
  image_url?: string;
  location?: string;
  price?: number;
  rating?: number;
  created_at?: string;
}

export interface CustomerBooking {
  id: string;
  booking_id?: string;
  service_name: string;
  provider_name?: string;
  service_type: string;
  status: string;
  booking_date?: string;
  location?: string;
  amount?: number;
  payment_status?: string;
}

export interface CustomerPreferences {
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  language?: string;
  currency?: string;
}

export const customerAPI = {
  getProfile: async (): Promise<CustomerProfile> => {
    const response = await axiosInstance.get('/customer/me');
    return response.data;
  },

  updateProfile: async (data: Partial<CustomerProfile>): Promise<CustomerProfile> => {
    const response = await axiosInstance.patch('/customer/me', data);
    return response.data;
  },

  getSaved: async (): Promise<SavedService[]> => {
    const response = await axiosInstance.get('/customer/saved');
    return response.data;
  },

  saveService: async (data: { service_id: string; service_name: string; service_type: string }): Promise<SavedService> => {
    const response = await axiosInstance.post('/customer/saved', data);
    return response.data;
  },

  removeSaved: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/customer/saved/${id}`);
  },

  getBookings: async (status?: string): Promise<CustomerBooking[]> => {
    const params = status ? { status } : {};
    const response = await axiosInstance.get('/customer/bookings', { params });
    return response.data;
  },

  getPreferences: async (): Promise<CustomerPreferences> => {
    const response = await axiosInstance.get('/customer/preferences');
    return response.data;
  },

  updatePreferences: async (data: Partial<CustomerPreferences>): Promise<CustomerPreferences> => {
    const response = await axiosInstance.patch('/customer/preferences', data);
    return response.data;
  },

  createBooking: async (bookingData: {
    service_id: string;
    check_in_date: string;
    check_out_date: string;
    guest_count: number;
    special_requests?: string;
  }) => {
    const response = await axiosInstance.post('/customer/bookings/service', bookingData);
    return response.data;
  },
};
