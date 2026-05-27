import axiosInstance from '../axios';

export interface Service {
  id: string;
  name: string;
  type: string;
  description: string;
  image: string;
  rating: number;
  price: string;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  provider_id?: string;
  provider_name?: string;
  features?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface SearchParams {
  q?: string;
  category?: string;
  location?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface NearbyParams {
  lat: number;
  lng: number;
  radius?: number;
  category?: string;
  page?: number;
  limit?: number;
}

export const servicesAPI = {
  search: async (params: SearchParams): Promise<{ services: Service[]; total: number }> => {
    const response = await axiosInstance.get('/public/services/search', { params });
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await axiosInstance.get('/public/services/categories');
    return response.data;
  },

  getNearby: async (params: NearbyParams): Promise<{ services: Service[]; total: number }> => {
    const response = await axiosInstance.get('/public/services/nearby', { params });
    return response.data;
  },

  getService: async (id: string): Promise<Service> => {
    const response = await axiosInstance.get(`/public/services/${id}`);
    return response.data;
  },

  getProviderServices: async (providerId: string): Promise<Service[]> => {
    const response = await axiosInstance.get(`/public/providers/${providerId}/services`);
    return response.data;
  },
};
