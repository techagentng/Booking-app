import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminBookingService, BookingListParams } from '../services/adminBookingService';
import toast from 'react-hot-toast';

// React Query hooks for admin bookings
export function useAdminBookings(params?: BookingListParams) {
  return useQuery({
    queryKey: ['admin', 'bookings', params],
    queryFn: () => adminBookingService.getBookings(params || {}),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: false, // Disabled to stop infinite calls
    refetchOnWindowFocus: false, // Disabled to stop infinite calls
  });
}

export function useAdminBooking(id: number) {
  return useQuery({
    queryKey: ['admin', 'booking', id],
    queryFn: () => adminBookingService.getBooking(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: false, // Disabled to stop infinite calls
    refetchOnWindowFocus: false, // Disabled to stop infinite calls
  });
}

export function useAdminBookingHistory(id: number) {
  return useQuery({
    queryKey: ['admin', 'booking', id, 'history'],
    queryFn: () => adminBookingService.getHistory(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: false, // Disabled to stop infinite calls
    refetchOnWindowFocus: false, // Disabled to stop infinite calls
  });
}

export function useAdminBookingStats(params?: { period?: string; dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: ['admin', 'bookings', 'stats', params],
    queryFn: () => adminBookingService.getStats(params || {}),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: false, // Disabled to stop infinite calls
    refetchOnWindowFocus: false, // Disabled to stop infinite calls
  });
}

export function useAdminCalendar(params: { year: number; month: number; includeBookings?: boolean }) {
  return useQuery({
    queryKey: ['admin', 'calendar', params],
    queryFn: () => adminBookingService.getCalendar(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: false, // Disabled to stop infinite calls
    refetchOnWindowFocus: false, // Disabled to stop infinite calls
  });
}

// Mutations
export function useUpdateBookingStatus(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: string; notes?: string }) =>
      adminBookingService.updateStatus(id, status, notes),
    onSuccess: (updatedBooking, variables) => {
      // Update the specific booking in the cache
      queryClient.setQueryData(
        ['admin', 'booking', variables.id],
        updatedBooking
      );

      // Update the booking in the list cache
      queryClient.setQueriesData(
        { queryKey: ['admin', 'bookings'] },
        (oldData: any) => {
          if (!oldData?.data?.data) return oldData;
          
          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: oldData.data.data.map((booking: any) =>
                booking.id === variables.id ? updatedBooking : booking
              ),
            },
          };
        }
      );

      // Get the booking date to invalidate the correct calendar month
      const bookingDate = new Date(updatedBooking.booking_date);
      const year = bookingDate.getFullYear();
      const month = bookingDate.getMonth() + 1;
      
      console.log('🔄 Invalidating calendar for:', { year, month, bookingDate: updatedBooking.booking_date });
      
      // Invalidate regular calendar queries for the specific month
      console.log('🗑️ Invalidating calendar query:', ['calendar', 'monthly', year, month]);
      queryClient.invalidateQueries({
        queryKey: ['calendar', 'monthly', year, month],
        refetchType: 'active',
      });
      
      // Invalidate all calendar queries to be safe
      console.log('🗑️ Invalidating all calendar queries');
      queryClient.invalidateQueries({
        queryKey: ['calendar'],
        refetchType: 'active',
      });
      
      // Invalidate admin calendar queries
      console.log('🗑️ Invalidating admin calendar query:', ['admin', 'calendar', { year, month }]);
      queryClient.invalidateQueries({
        queryKey: ['admin', 'calendar', { year, month }],
        refetchType: 'active',
      });
      
      // Invalidate all admin calendar queries
      console.log('🗑️ Invalidating all admin calendar queries');
      queryClient.invalidateQueries({
        queryKey: ['admin', 'calendar'],
        refetchType: 'active',
      });

      // Invalidate statistics to refresh counts
      queryClient.invalidateQueries({
        queryKey: ['admin', 'bookings', 'stats'],
      });
      
      // Also invalidate any admin bookings queries to ensure calendar gets updated data
      queryClient.invalidateQueries({
        queryKey: ['admin', 'bookings'],
      });

      console.log('✅ Booking status updated and cache invalidated');
      
      // Show success toast
      const statusLabels = {
        'pending': 'Pending',
        'confirmed': 'Confirmed', 
        'completed': 'Completed',
        'cancelled': 'Cancelled'
      };
      
      const newStatus = statusLabels[updatedBooking.status as keyof typeof statusLabels] || updatedBooking.status;
      toast.success(`Booking status updated to ${newStatus}`, {
        duration: 3000,
        position: 'top-right',
      });
      
      // Call the success callback to close modal
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      console.error('❌ Failed to update booking status:', error);
      console.log('🔍 Error structure:', {
        message: error?.message,
        response: error?.response,
        responseData: error?.response?.data,
        errors: error?.response?.data?.errors,
        status: error?.response?.status
      });
      
      // Extract user-friendly error message
      let errorMessage = 'Failed to update booking status';
      
      if (error?.response?.data?.errors) {
        const serverError = error.response.data.errors;
        console.log('🔍 Server error found:', serverError);
        
        // Handle specific status transition errors
        if (serverError.includes('invalid status transition')) {
          if (serverError.includes('confirmed to pending')) {
            errorMessage = 'Cannot change status from "Confirmed" back to "Pending". Once a booking is confirmed, it can only be completed or cancelled.';
          } else if (serverError.includes('completed to')) {
            errorMessage = 'Cannot change status from "Completed". Completed bookings cannot be modified.';
          } else if (serverError.includes('cancelled to')) {
            errorMessage = 'Cannot change status from "Cancelled". Cancelled bookings cannot be modified.';
          } else {
            errorMessage = 'Invalid status transition. Please check the current booking status and try a valid transition.';
          }
        } else {
          errorMessage = serverError;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      console.log('🔍 Final error message:', errorMessage);
      
      // Don't throw here - let React Query handle the error
      // The error will be available in the mutation.error property
      console.log('🔴 Status update error:', errorMessage);
      
      // Show error toast
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-right',
      });
      
      // Return a custom error with the user-friendly message
      return Promise.reject(new Error(errorMessage));
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminBookingService.deleteBooking(id),
    onSuccess: (_, bookingId) => {
      // Remove the booking from the list cache
      queryClient.setQueriesData(
        { queryKey: ['admin', 'bookings'] },
        (oldData: any) => {
          if (!oldData?.data?.data) return oldData;
          
          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: oldData.data.data.filter((booking: any) => booking.id !== bookingId),
            },
          };
        }
      );

      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: ['admin', 'bookings', 'stats'],
      });

      // Invalidate calendar queries to refresh availability
      queryClient.invalidateQueries({
        queryKey: ['calendar', 'monthly'],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'calendar'],
      });

      console.log('✅ Booking deleted and cache updated');
    },
    onError: (error) => {
      console.error('❌ Failed to delete booking:', error);
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingData: any) => adminBookingService.createBooking(bookingData),
    onSuccess: (newBooking) => {
      // Add the new booking to the list cache
      queryClient.setQueriesData(
        { queryKey: ['admin', 'bookings'] },
        (oldData: any) => {
          if (!oldData?.data?.data) return oldData;
          
          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: [newBooking, ...oldData.data.data],
            },
          };
        }
      );

      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: ['admin', 'bookings', 'stats'],
      });

      // Invalidate calendar for the booking date
      const bookingDate = newBooking.booking_date;
      if (bookingDate) {
        const date = new Date(bookingDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        queryClient.invalidateQueries({
          queryKey: ['calendar', 'monthly', year, month],
        });
        queryClient.invalidateQueries({
          queryKey: ['admin', 'calendar'],
        });
      }

      console.log('✅ New booking created and cache updated');
    },
    onError: (error) => {
      console.error('❌ Failed to create booking:', error);
    },
  });
}
