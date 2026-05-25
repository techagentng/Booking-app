import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { MapPin, Phone, Clock, Sparkles, CalendarDays, Users, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMonthlyCalendar } from '../hooks/useCalendar';
import { useAdminBookings } from '../hooks/useAdminBookings';

interface CalendarDay {
  date: string;
  status: string;
  total_slots: number;
  booked_slots: number;
  available_slots: number;
  notes?: string;
}

interface HallBookingCalendarProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  onDateSelect: (date: Date) => void;
}

export default function HallBookingCalendar({
  selectedDate,
  setSelectedDate,
  onDateSelect,
}: HallBookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Fetch real calendar data using React Query
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  
  const { data: calendarData, isLoading, error, refetch } = useMonthlyCalendar(year, month);
  
  // Debug: Log when calendar data changes
  React.useEffect(() => {
    console.log('📅 Calendar data updated:', {
      year,
      month,
      dataLength: calendarData?.length || 0,
      isLoading,
      hasError: !!error
    });
  }, [calendarData, year, month, isLoading, error]);
  
  // Get admin booking data for real-time status updates (when available)
  const { data: bookingsData } = useAdminBookings();
  const bookings = bookingsData?.data || [];
  
  // Debug: Log when admin bookings data changes
  React.useEffect(() => {
    console.log('📋 Admin bookings data updated:', {
      bookingsCount: bookings.length,
      sampleBooking: bookings[0]
    });
  }, [bookings]);
  
  // Convert calendar data to availability map for compatibility
  const availabilityData: Record<string, string> = React.useMemo(() => {
    if (!calendarData || !Array.isArray(calendarData)) {
      return {};
    }
    
    const availability: Record<string, string> = {};
    
    // Handle duplicate entries by taking the last one
    const uniqueData = calendarData.reduce((acc, day) => {
      acc[day.date] = day;
      return acc;
    }, {} as Record<string, any>);
    
    Object.values(uniqueData).forEach(day => {
      // First, check if there are admin bookings for this date
      const calendarDateStr = day.date.split('T')[0]; // Extract date part from calendar date
      
      const bookingsForDate = bookings.filter(booking => {
        const bookingDateStr = booking.booking_date.split('T')[0]; // Extract date part from booking date
        return bookingDateStr === calendarDateStr;
      });
      
      if (bookingsForDate.length > 0) {
        // Use the highest priority status from admin bookings
        const statusPriority = {
          'confirmed': 3,
          'completed': 2,
          'pending': 1,
          'cancelled': 0
        };
        
        const highestPriorityBooking = bookingsForDate.reduce((highest, current) => {
          const currentPriority = statusPriority[current.status] || 0;
          const highestPriority = statusPriority[highest.status] || 0;
          return currentPriority > highestPriority ? current : highest;
        });
        
        // Map admin booking status to calendar status
        const statusMapping = {
          'confirmed': 'booked',        // Show as booked (red)
          'completed': 'unavailable',   // Show as unavailable
          'pending': 'pending',         // Keep as pending
          'cancelled': 'available'      // Show as available since cancelled
        };
        
        availability[day.date] = statusMapping[highestPriorityBooking.status] || day.status;
      } else {
        // Use the calendar API status if no admin bookings
        availability[day.date] = day.status;
      }
    });
    
    return availability;
  }, [calendarData, bookings]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - getDay(monthStart));
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - getDay(monthEnd)));

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const status = availabilityData[dateStr] || 'available';
    
    // Allow booking on available dates only
    // confirmed/booked, completed, closed, maintenance, unavailable dates are not bookable
    if (status === 'available') {
      onDateSelect(date);
    }
  };

  const getStatusColor = (status: string, isToday: boolean) => {
    let baseClasses = 'relative flex items-center justify-center text-sm font-bold transition-all duration-300 cursor-pointer select-none border-2 overflow-hidden group aspect-square';
    
    if (isToday) {
      baseClasses += ' ring-4 ring-blue-400 ring-opacity-50';
    }

    switch (status) {
      case 'available':
        return `${baseClasses} bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 text-white border-emerald-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 hover:from-emerald-300 hover:via-green-400 hover:to-emerald-500`;
      case 'limited':
        return `${baseClasses} bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-white border-amber-300 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 hover:from-amber-300 hover:via-yellow-400 hover:to-amber-500`;
      case 'booked':
        return `${baseClasses} bg-gradient-to-br from-rose-400 via-red-500 to-rose-600 text-white border-rose-300 shadow-lg shadow-rose-500/30 cursor-not-allowed opacity-85`;
      case 'pending':
        return `${baseClasses} bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-white border-amber-300 shadow-lg shadow-amber-500/30 cursor-not-allowed opacity-90`;
      case 'closed':
        return `${baseClasses} bg-gradient-to-br from-slate-600 via-gray-700 to-slate-800 text-white border-slate-500 shadow-lg shadow-slate-700/30 cursor-not-allowed opacity-90`;
      case 'maintenance':
        return `${baseClasses} bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-gray-800 border-gray-400 shadow-lg shadow-gray-600/30 cursor-not-allowed opacity-85`;
      case 'unavailable':
        return `${baseClasses} bg-gradient-to-br from-rose-400 via-red-500 to-rose-600 text-white border-rose-300 shadow-lg shadow-rose-500/30 cursor-not-allowed opacity-85`;
      default:
        return `${baseClasses} bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 border-slate-300 hover:from-slate-200 hover:to-slate-300 hover:text-slate-800 hover:scale-105`;
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Video Background - Only show when not embedded */}
      <div className="fixed inset-0 w-full h-full object-cover z-0 hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/me.mp4" type="video/mp4" />
        </video>
      </div>
      
      {/* Dark overlay for better text visibility - Only show when not embedded */}
      <div className="fixed inset-0 bg-black/40 z-0 hidden"></div>
      
      {/* Animated background elements - Only show when not embedded */}
      <div className="fixed inset-0 overflow-hidden z-0 hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Custom Calendar Container - Faded into background */}
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-4 md:p-8">
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                
                <button
                  onClick={() => refetch()}
                  className="p-2 rounded-lg bg-blue-500/20 backdrop-blur-lg border border-blue-500/30 hover:bg-blue-500/30 transition-all duration-300"
                  title="Refresh calendar data"
                >
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              
              <h2 className="text-2xl font-bold text-white">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-6">
              {[
                { color: 'emerald', label: 'Available', icon: '✓' },
                { color: 'rose', label: 'Booked', icon: '✗' },
                { color: 'amber', label: 'Pending', icon: '⏳' },
              ].map(({ color, label, icon }) => (
                <div key={label} className="flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-${color}-400 to-${color}-600 shadow-lg shadow-${color}-500/30 flex items-center justify-center text-white text-xs font-bold`}>
                    {icon}
                  </div>
                  <span className="text-white font-medium">{label}</span>
                </div>
              ))}
            </div>

            {/* Custom Calendar Grid */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <p className="ml-3 text-white">Loading calendar...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-8">
                  <p className="text-red-400 mb-4">Failed to load calendar</p>
                  <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Calendar Content */}
              {!isLoading && !error && (
                <>
                  {/* Week day headers */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-xs font-bold text-white/60 uppercase tracking-wider py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days grid */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, idx) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayData = Array.isArray(calendarData) ? calendarData.find(d => d.date === dateStr) : undefined;
                  const status = availabilityData[dateStr] || 'available'; // Use calculated status
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isPast = day.getTime() < new Date().setHours(0, 0, 0, 0); // Check if date is in the past

                  return (
                    <button
                      key={idx}
                      onClick={() => isCurrentMonth && !isPast && handleDateClick(day)}
                      disabled={!isCurrentMonth || (status !== 'available' && status !== 'limited') || isPast}
                      className={`
                        ${getStatusColor(status, isToday)}
                        ${!isCurrentMonth ? 'opacity-30 cursor-not-allowed' : ''}
                        ${isSelected ? 'ring-4 ring-emerald-400 ring-opacity-50' : ''}
                        ${isPast ? 'opacity-50 cursor-not-allowed line-through' : ''}
                        ${isCurrentMonth && (status === 'available' || status === 'limited') && !isPast ? 'cursor-pointer' : 'cursor-not-allowed'}
                      `}
                    >
                      <span className="drop-shadow-lg">{format(day, 'd')}</span>
                    </button>
                  );
                })}
              </div>
              </>
              )}
            </div>

            {/* Contact Info */}
            <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 md:p-4 border border-white/20 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <span className="text-white text-sm">Lakeview Village Hall</span>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 md:p-4 border border-white/20 flex items-center gap-3">
                <Phone className="w-5 h-5 text-purple-400" />
                <span className="text-white text-sm">01795 473 123</span>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 md:p-4 border border-white/20 flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span className="text-white text-sm">24/7 Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
