import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  AdminBookingResponse, 
  BookingStatusHistory, 
  BookingStats, 
  BookingListParams,
  PaginatedResponse,
  PaginationMeta,
  adminBookingService 
} from '../services/adminBookingService';

interface AdminBookingState {
  // Data
  bookings: AdminBookingResponse[];
  currentBooking: AdminBookingResponse | null;
  bookingHistory: BookingStatusHistory[];
  statistics: BookingStats | null;
  calendarData: any[];
  
  // UI State
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta;
  
  // Filters
  filters: BookingListParams;
  
  // Actions
  fetchBookings: (params?: BookingListParams) => Promise<void>;
  fetchBookingDetails: (id: number) => Promise<void>;
  fetchBookingHistory: (id: number) => Promise<void>;
  fetchStatistics: (params?: any) => Promise<void>;
  fetchCalendar: (year: number, month: number, includeBookings?: boolean) => Promise<void>;
  updateBookingStatus: (id: number, status: string, notes?: string) => Promise<void>;
  createBooking: (bookingData: Partial<AdminBookingResponse>) => Promise<void>;
  deleteBooking: (id: number) => Promise<void>;
  exportBookings: (params?: BookingListParams) => Promise<Blob>;
  setFilters: (filters: Partial<BookingListParams>) => void;
  clearError: () => void;
  setCurrentBooking: (booking: AdminBookingResponse | null) => void;
}

export const useAdminBookingStore = create<AdminBookingState>()(
  devtools(
    (set, get) => ({
      // Initial state
      bookings: [],
      currentBooking: null,
      bookingHistory: [],
      statistics: null,
      calendarData: [],
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
      filters: {
        page: 1,
        limit: 20,
        sortBy: 'created_at',
        sortOrder: 'desc',
      },

      // Actions
      fetchBookings: async (params?: BookingListParams) => {
        set({ loading: true, error: null });
        
        try {
          const mergedParams = { ...get().filters, ...params };
          const response: PaginatedResponse<AdminBookingResponse> = await adminBookingService.getBookings(mergedParams);
          
          set({
            bookings: response.data,
            pagination: response.meta,
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch bookings',
            loading: false,
          });
        }
      },

      fetchBookingDetails: async (id: number) => {
        set({ loading: true, error: null });
        
        try {
          const booking = await adminBookingService.getBooking(id);
          set({
            currentBooking: booking,
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch booking details',
            loading: false,
          });
        }
      },

      fetchBookingHistory: async (id: number) => {
        try {
          const history = await adminBookingService.getHistory(id);
          set({ bookingHistory: history });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch booking history',
          });
        }
      },

      fetchStatistics: async (params?: any) => {
        set({ loading: true, error: null });
        
        try {
          const stats = await adminBookingService.getStats(params);
          set({
            statistics: stats,
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch statistics',
            loading: false,
          });
        }
      },

      fetchCalendar: async (year: number, month: number, includeBookings = false) => {
        set({ loading: true, error: null });
        
        try {
          const calendarData = await adminBookingService.getCalendar({ year, month, includeBookings });
          set({
            calendarData,
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch calendar data',
            loading: false,
          });
        }
      },

      updateBookingStatus: async (id: number, status: string, notes?: string) => {
        set({ loading: true, error: null });
        
        try {
          const updatedBooking = await adminBookingService.updateStatus(id, status, notes);
          
          // Update booking in the list
          set((state) => ({
            bookings: state.bookings.map(booking => 
              booking.id === id ? updatedBooking : booking
            ),
            currentBooking: state.currentBooking?.id === id ? updatedBooking : state.currentBooking,
            loading: false,
          }));

          // Note: Calendar will be updated on next refresh or when user navigates back to calendar
          // The calendar APIs should be updated by the backend when booking status changes
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to update booking status',
            loading: false,
          });
          throw error;
        }
      },

      createBooking: async (bookingData: Partial<AdminBookingResponse>) => {
        set({ loading: true, error: null });
        
        try {
          const newBooking = await adminBookingService.createBooking(bookingData);
          
          // Add to bookings list
          set((state) => ({
            bookings: [newBooking, ...state.bookings],
            loading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to create booking',
            loading: false,
          });
          throw error;
        }
      },

      deleteBooking: async (id: number) => {
        set({ loading: true, error: null });
        
        try {
          await adminBookingService.deleteBooking(id);
          
          // Remove from bookings list
          set((state) => ({
            bookings: state.bookings.filter(booking => booking.id !== id),
            currentBooking: state.currentBooking?.id === id ? null : state.currentBooking,
            loading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to delete booking',
            loading: false,
          });
          throw error;
        }
      },

      exportBookings: async (params?: BookingListParams) => {
        try {
          const blob = await adminBookingService.exportBookings(params);
          return blob;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to export bookings',
          });
          throw error;
        }
      },

      setFilters: (filters: Partial<BookingListParams>) => {
        const newFilters = { ...get().filters, ...filters };
        set({ filters: newFilters });
        
        // Auto-fetch with new filters
        get().fetchBookings(newFilters);
      },

      clearError: () => {
        set({ error: null });
      },

      setCurrentBooking: (booking: AdminBookingResponse | null) => {
        set({ currentBooking: booking });
      },
    }),
    {
      name: 'admin-booking-store',
    }
  )
);
