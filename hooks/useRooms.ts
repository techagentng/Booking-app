import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

export interface Room {
  id: number;
  room_number: string;
  room_type: string;
  floor: number;
  capacity: number;
  price_per_night: number;
  status: string;
  bed_type: string;
  description: string;
  amenities?: string;
  created_at: string;
  updated_at: string;
}

interface GetRoomsParams {
  page?: number;
  page_size?: number;
  status?: string;
}

interface GetAvailableRoomsParams {
  check_in: string;
  check_out: string;
  room_type?: string;
}

export interface CreateRoomData {
  room_number: string;
  room_type: string;
  floor: number;
  capacity: number;
  price_per_night: number;
  bed_type: string;
  description?: string;
  amenities?: string;
}

export interface RoomSummaryStats {
  total_rooms: number;
  available: number;
  occupied: number;
  maintenance: number;
  cleaning: number;
}

// Query Keys
export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: (filters: GetRoomsParams) => [...roomKeys.lists(), filters] as const,
  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (id: number) => [...roomKeys.details(), id] as const,
  available: (params: GetAvailableRoomsParams) => [...roomKeys.all, 'available', params] as const,
  summary: () => [...roomKeys.all, 'summary'] as const,
};

// Queries
export const useGetRooms = (params: GetRoomsParams = {}) => {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: async () => {
      const { data } = await axios.get('/rooms', { params });
      return data;
    },
  });
};

export const useGetRoomById = (id: number) => {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: async () => {
      const { data } = await axios.get(`/rooms/${id}`);
      return data.data as Room;
    },
    enabled: !!id,
  });
};

export const useGetAvailableRooms = (params: GetAvailableRoomsParams) => {
  return useQuery({
    queryKey: roomKeys.available(params),
    queryFn: async () => {
      const { data } = await axios.get('/rooms/available', { params });
      return data.data;
    },
    enabled: !!params.check_in && !!params.check_out,
  });
};

export const useGetRoomSummary = () => {
  return useQuery({
    queryKey: roomKeys.summary(),
    queryFn: async () => {
      const { data } = await axios.get('/rooms/summary');
      return data.data as RoomSummaryStats;
    },
  });
};

// Mutations
export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roomData: CreateRoomData) => {
      // Prepare the request payload
      const payload = {
        room_number: roomData.room_number,
        room_type: roomData.room_type,
        floor: Number(roomData.floor),
        capacity: Number(roomData.capacity),
        price_per_night: Number(roomData.price_per_night),
        bed_type: roomData.bed_type,
        ...(roomData.description && { description: roomData.description }),
        ...(roomData.amenities && { amenities: roomData.amenities })
      };
      
      console.log('Sending room creation request:', payload);
      
      const { data } = await axios.post('/rooms', payload);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
      toast.success('Room created successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to create room';
      console.error('Error creating room:', error.response?.data || error.message);
      toast.error(errorMessage);
    },
  });
};

export const useUpdateRoom = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomData: Partial<CreateRoomData>) => {
      const { data } = await axios.put(`/rooms/${id}`, roomData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roomKeys.summary() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateRoomStatus = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: string) => {
      const { data } = await axios.put(`/rooms/${id}/status`, { status });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roomKeys.summary() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/rooms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roomKeys.summary() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
