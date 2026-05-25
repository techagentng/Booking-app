// hooks/useCalendar.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

// Types
export interface CalendarDay {
  id: number;
  date: string;
  status: 'available' | 'limited' | 'unavailable' | 'closed' | 'maintenance';
  total_slots: number;
  booked_slots: number;
  available_slots: number;
  notes?: string;
}

export interface TimeSlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'booked' | 'pending';
  max_capacity: number;
  current_usage: number;
  price: number;
}

// API Functions
const calendarApi = {
  // Get monthly calendar availability
  getMonthlyAvailability: async (year: number, month: number): Promise<CalendarDay[]> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/calendar/availability?year=${year}&month=${month}`
    );
    if (!response.ok) throw new Error('Failed to fetch calendar availability');
    const result = await response.json();
    
    // Handle calendar API response structure
    if (result.status !== 'OK' || !result.data) {
      throw new Error(result.message || 'Failed to fetch calendar data');
    }
    
    return result.data; // The data is directly in result.data.data
  },

  // Get daily availability
  getDailyAvailability: async (date: string): Promise<CalendarDay> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/calendar/availability/${date}`
    );
    if (!response.ok) throw new Error('Failed to fetch daily availability');
    const result = await response.json();
    
    // Handle calendar API response structure
    if (result.status !== 'OK' || !result.data) {
      throw new Error(result.message || 'Failed to fetch daily availability data');
    }
    
    return result.data;
  },

  // Get time slots for a date
  getTimeSlots: async (date: string): Promise<TimeSlot[]> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/calendar/time-slots/${date}`
    );
    if (!response.ok) throw new Error('Failed to fetch time slots');
    const result = await response.json();
    
    // Handle calendar API response structure
    if (result.status !== 'OK' || !result.data) {
      throw new Error(result.message || 'Failed to fetch time slots data');
    }
    
    return result.data;
  },

  // Check slot availability
  checkSlotAvailability: async (
    date: string,
    startTime: string,
    endTime: string
  ): Promise<{ available: boolean }> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/calendar/check-availability?date=${date}&start_time=${startTime}&end_time=${endTime}`
    );
    if (!response.ok) throw new Error('Failed to check availability');
    const result = await response.json();
    
    // Handle calendar API response structure
    if (result.status !== 'OK' || !result.data?.available) {
      const errorMessage = result.data?.message || 'This time slot is not available. Please choose a different time.';
      throw new Error(errorMessage);
    }
    
    return result.data;
  },

  // Create booking
  createBooking: async (bookingData: any): Promise<any> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/hall-bookings`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      }
    );
    if (!response.ok) throw new Error('Failed to create booking');
    const result = await response.json();
    return result.data;
  },
};

// React Query Hooks

// Hook for monthly calendar data
export function useMonthlyCalendar(year: number, month: number) {
  return useQuery({
    queryKey: ['calendar', 'monthly', year, month],
    queryFn: () => calendarApi.getMonthlyAvailability(year, month),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: false, // Disabled to stop infinite calls
    refetchOnWindowFocus: false, // Disabled to stop infinite calls
    enabled: !!year && !!month,
  });
}

// Hook for daily availability
export function useDailyAvailability(date: string) {
  return useQuery({
    queryKey: ['calendar', 'daily', date],
    queryFn: () => calendarApi.getDailyAvailability(date),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: false, // Disabled to stop infinite calls
    refetchOnWindowFocus: false, // Disabled to stop infinite calls
    enabled: !!date,
  });
}

// Hook for time slots
export function useTimeSlots(date: string) {
  return useQuery({
    queryKey: ['calendar', 'time-slots', date],
    queryFn: () => calendarApi.getTimeSlots(date),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: false, // Disabled to stop infinite calls
    refetchOnWindowFocus: false, // Disabled to stop infinite calls
    enabled: !!date,
  });
}

// Hook for slot availability checking
export function useSlotAvailability(date: string, startTime: string, endTime: string) {
  return useQuery({
    queryKey: ['calendar', 'check-availability', date, startTime, endTime],
    queryFn: () => calendarApi.checkSlotAvailability(date, startTime, endTime),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: false, // Disabled to stop infinite calls
    refetchOnWindowFocus: false, // Disabled to stop infinite calls
    enabled: !!date && !!startTime && !!endTime,
  });
}

// Hook for creating booking with automatic cache updates
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calendarApi.createBooking,
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      const bookingDate = variables.booking_date;
      const date = new Date(bookingDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      // Invalidate monthly calendar
      queryClient.invalidateQueries({
        queryKey: ['calendar', 'monthly', year, month],
      });

      // Invalidate daily availability
      queryClient.invalidateQueries({
        queryKey: ['calendar', 'daily', bookingDate],
      });

      // Invalidate time slots
      queryClient.invalidateQueries({
        queryKey: ['calendar', 'time-slots', bookingDate],
      });

      // Invalidate slot availability check
      queryClient.invalidateQueries({
        queryKey: ['calendar', 'check-availability'],
      });

      console.log('✅ Calendar data invalidated and will refetch');
    },
    onError: (error) => {
      console.error('❌ Booking creation failed:', error);
    },
  });
}
