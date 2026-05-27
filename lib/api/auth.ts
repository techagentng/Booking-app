import axiosInstance from '../axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role_name: string;
  };
}

export const authAPI = {
  signup: async (data: SignupCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },

  googleLogin: async (data: { code: string; state?: string }): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/google/user/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },
};
