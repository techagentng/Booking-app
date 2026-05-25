import { useQuery } from '@tanstack/react-query';
import axios from '../lib/axios';

export interface HallBookingActivity {
  id: number;
  booking_id: string;
  organizer_name: string;
  organizer_email: string;
  organizer_phone: string;
  event_type: string;
  guest_count: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  special_requests: string;
  total_price: number;
  deposit_required: number;
  status: string;
  created_by_type: string;
  created_at: string;
  updated_at: string;
}

export interface HallBookingActivityResponse {
  recent_bookings: HallBookingActivity[];
  total_count: number;
}

// Query Keys
export const hallBookingActivityKeys = {
  all: ['hall-booking-activity'] as const,
  recent: () => [...hallBookingActivityKeys.all, 'recent'] as const,
};

// Query to get recent hall booking activity
export const useGetHallBookingActivity = () => {
  return useQuery({
    queryKey: hallBookingActivityKeys.recent(),
    queryFn: async () => {
      const { data } = await axios.get('/api/v1/bookings/recent-activity');
      return data.data as HallBookingActivityResponse;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: false, // Disabled to stop infinite calls
  });
};
