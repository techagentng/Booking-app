import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1` : 'http://localhost:8080/api/v1';

// Types based on backend response structure
export interface AdminBookingResponse {
  id: number;
  booking_id: string;
  organizer_name: string;
  organizer_email: string;
  organizer_phone: string;
  event_type: string;
  guest_count: number;
  special_requests: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  deposit_required: number;
  payment_method: string;
  status: string;
  confirmed_by?: string;
  confirmed_at?: string;
  cancelled_by?: string;
  cancelled_at?: string;
  updated_by?: string;
  status_history: BookingStatusHistory[];
  created_at: string;
  updated_at: string;
}

export interface BookingStatusHistory {
  id: number;
  booking_id: number;
  old_status?: string;
  new_status: string;
  changed_by: number;
  changed_at: string;
  notes: string;
  changed_by_user: {
    id: number;
    fullname: string;
    email: string;
  };
}

export interface BookingStats {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  revenue_by_status: {
    confirmed: number;
    completed: number;
  };
  popular_event_types: Array<{
    event_type: string;
    count: number;
  }>;
  average_guests?: number;
  occupancy_rate?: number;
  monthly_revenue?: Array<{
    month: string;
    revenue: number;
  }>;
  monthly_bookings?: Array<{
    month: string;
    bookings: number;
  }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BookingListParams {
  page?: number;
  limit?: number;
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

class AdminBookingService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    };
  }

  // 📊 Get all bookings with filtering
  async getBookings(params: BookingListParams = {}): Promise<PaginatedResponse<AdminBookingResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) params.status.forEach(s => queryParams.append('status', s));
    if (params.dateFrom) queryParams.append('date_from', params.dateFrom);
    if (params.dateTo) queryParams.append('date_to', params.dateTo);
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sort_by', params.sortBy);
    if (params.sortOrder) queryParams.append('sort_order', params.sortOrder);

    const response = await axios.get(
      `${API_BASE_URL}/admin/bookings?${queryParams}`,
      { headers: this.getAuthHeaders() }
    );
    
    if (response.status !== 200) throw new Error('Failed to fetch bookings');
    
    // Handle the actual backend response structure
    const backendResponse = response.data;
    if (backendResponse.status !== 'OK') {
      throw new Error(backendResponse.message || 'Failed to fetch bookings');
    }
    
    return backendResponse.data;
  }

  // 🔍 Get booking by ID
  async getBooking(id: number): Promise<AdminBookingResponse> {
    const response = await axios.get(
      `${API_BASE_URL}/admin/bookings/${id}`,
      { headers: this.getAuthHeaders() }
    );
    
    if (response.status !== 200) throw new Error('Booking not found');
    return response.data;
  }

  // ✏️ Update booking status
  async updateStatus(id: number, status: string, notes?: string): Promise<AdminBookingResponse> {
    const response = await axios.put(
      `${API_BASE_URL}/admin/bookings/${id}/status`,
      {
        status,
        notes: notes || ''
      },
      { headers: this.getAuthHeaders() }
    );
    
    if (response.status !== 200) throw new Error('Failed to update status');
    
    // Handle the actual backend response structure
    const backendResponse = response.data;
    if (backendResponse.status !== 'OK') {
      throw new Error(backendResponse.message || 'Failed to update status');
    }
    
    return backendResponse.data;
  }

  // 📜 Get booking history
  async getHistory(id: number): Promise<BookingStatusHistory[]> {
    const response = await axios.get(
      `${API_BASE_URL}/admin/bookings/${id}/history`,
      { headers: this.getAuthHeaders() }
    );
    
    if (response.status !== 200) throw new Error('Failed to fetch history');
    return response.data;
  }

  // 📈 Get statistics
  async getStats(params: {
    period?: string
    dateFrom?: string
    dateTo?: string
  } = {}): Promise<BookingStats> {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    if (params.dateFrom) queryParams.append('date_from', params.dateFrom);
    if (params.dateTo) queryParams.append('date_to', params.dateTo);

    const response = await axios.get(
      `${API_BASE_URL}/admin/bookings/stats?${queryParams}`
      // Temporarily removed auth headers for testing
      // { headers: this.getAuthHeaders() }
    );
    
    if (response.status !== 200) throw new Error('Failed to fetch stats');
    
    // Handle the actual backend response structure
    const backendResponse = response.data;
    if (backendResponse.status !== 'OK') {
      throw new Error(backendResponse.message || 'Failed to fetch statistics');
    }
    
    // Debug: Log the actual response structure
    console.log('🔍 Backend stats response:', backendResponse);
    
    return backendResponse.data.data; // Revert to original working structure
  }

  // 📅 Get admin calendar
  async getCalendar(params: {
    year: number;
    month: number;
    includeBookings?: boolean;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('year', params.year.toString());
    queryParams.append('month', params.month.toString());
    if (params.includeBookings) queryParams.append('include_bookings', 'true');

    const response = await axios.get(
      `${API_BASE_URL}/admin/calendar/availability?${queryParams}`,
      { headers: this.getAuthHeaders() }
    );
    
    if (response.status !== 200) throw new Error('Failed to fetch calendar');
    return response.data;
  }

  // Create new booking (admin override)
  async createBooking(bookingData: Partial<AdminBookingResponse>): Promise<AdminBookingResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/admin/bookings`,
      bookingData,
      { headers: this.getAuthHeaders() }
    );

    if (response.status !== 200) throw new Error('Failed to create booking');
    return response.data;
  }

  // Delete booking (admin override)
  async deleteBooking(id: number): Promise<void> {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/bookings/${id}`,
      { headers: this.getAuthHeaders() }
    );

    if (response.status !== 200) throw new Error('Failed to delete booking');
  }

  // Export bookings to CSV
  async exportBookings(params: BookingListParams = {}): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, v));
      } else if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await axios.get(
      `${API_BASE_URL}/admin/bookings/export?${queryParams}`,
      { 
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    );

    return response.data;
  }
}

export const adminBookingService = new AdminBookingService();
