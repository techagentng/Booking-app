import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { useDailyAvailability, useTimeSlots } from './useCalendar';
import { incrementScore } from '../store';

interface HallBookingForm {
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  eventType: string;
  guestCount: number;
  startTime: string;
  endTime: string;
  specialRequests: string;
}

interface HallBookingPricing {
  totalPrice: number;
  hours: number;
  deposit: number;
}

export function useHallBooking({ dispatch, router, setSubmitSuccess }: { 
  dispatch: any; 
  router: any; 
  setSubmitSuccess: (success: boolean) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [guestCountError, setGuestCountError] = useState('');

  // Form state
  const [form, setForm] = useState<HallBookingForm>({
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    eventType: '',
    guestCount: 1,
    startTime: '12:00',
    endTime: '17:00',
    specialRequests: '',
  });

  // Generate time options based on selected date
  const getTimeOptions = useCallback((date: Date) => {
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === 0) { // Sunday: 12:00 PM - 6:00 PM
      return [
        { value: '12:00', label: '12:00 PM' },
        { value: '13:00', label: '1:00 PM' },
        { value: '14:00', label: '2:00 PM' },
        { value: '15:00', label: '3:00 PM' },
        { value: '16:00', label: '4:00 PM' },
        { value: '17:00', label: '5:00 PM' },
        { value: '18:00', label: '6:00 PM' },
      ];
    } else if (dayOfWeek === 6) { // Saturday: 12:00 PM - 11:00 PM
      return [
        { value: '12:00', label: '12:00 PM' },
        { value: '13:00', label: '1:00 PM' },
        { value: '14:00', label: '2:00 PM' },
        { value: '15:00', label: '3:00 PM' },
        { value: '16:00', label: '4:00 PM' },
        { value: '17:00', label: '5:00 PM' },
        { value: '18:00', label: '6:00 PM' },
        { value: '19:00', label: '7:00 PM' },
        { value: '20:00', label: '8:00 PM' },
        { value: '21:00', label: '9:00 PM' },
        { value: '22:00', label: '10:00 PM' },
        { value: '23:00', label: '11:00 PM' },
      ];
    } else { // Monday-Friday: 8:00 AM - 10:00 PM
      return [
        { value: '08:00', label: '8:00 AM' },
        { value: '09:00', label: '9:00 AM' },
        { value: '10:00', label: '10:00 AM' },
        { value: '11:00', label: '11:00 AM' },
        { value: '12:00', label: '12:00 PM' },
        { value: '13:00', label: '1:00 PM' },
        { value: '14:00', label: '2:00 PM' },
        { value: '15:00', label: '3:00 PM' },
        { value: '16:00', label: '4:00 PM' },
        { value: '17:00', label: '5:00 PM' },
        { value: '18:00', label: '6:00 PM' },
        { value: '19:00', label: '7:00 PM' },
        { value: '20:00', label: '8:00 PM' },
        { value: '21:00', label: '9:00 PM' },
        {value: '22:00', label: '10:00 PM' },
      ];
    }
  }, []);

  // Get valid end times based on selected start time
  const getEndTimeOptions = useCallback((date: Date, startTime: string) => {
    const allOptions = getTimeOptions(date);
    const startIndex = allOptions.findIndex(option => option.value === startTime);
    return startIndex >= 0 ? allOptions.slice(startIndex + 1) : allOptions;
  }, [getTimeOptions]);

  // Hall pricing calculator
  const calculateHallPricing = useCallback((date: Date, startTime: string, endTime: string): HallBookingPricing => {
    const dayOfWeek = date.getDay();
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const hours = (endHour + endMin/60) - (startHour + startMin/60);
    
    if (dayOfWeek === 6) { // Saturday
      const basePrice = 95;
      const minimumHours = 5;
      const additionalHourPrice = 15;
      
      const actualHours = Math.max(hours, minimumHours);
      const totalPrice = basePrice + ((actualHours - minimumHours) * additionalHourPrice);
      const deposit = endHour >= 20 ? 500 : 150;
      
      return { totalPrice, hours: actualHours, deposit };
    }
    
    if (dayOfWeek === 0) { // Sunday
      const basePrice = 65;
      const minimumHours = 3;
      const additionalHourPrice = 15;
      
      const actualHours = Math.max(hours, minimumHours);
      const totalPrice = basePrice + ((actualHours - minimumHours) * additionalHourPrice);
      const deposit = 150;
      
      return { totalPrice, hours: actualHours, deposit };
    }
    
    // Monday-Friday - Weekday rates
    const basePrice = 45;
    const minimumHours = 2;
    const additionalHourPrice = 12;
    
    const actualHours = Math.max(hours, minimumHours);
    const totalPrice = basePrice + ((actualHours - minimumHours) * additionalHourPrice);
    const deposit = 100;
    
    return { totalPrice, hours: actualHours, deposit };
  }, []);

  // Validate guest count
  const validateGuestCount = useCallback((value: number): boolean => {
    if (value < 1) {
      setGuestCountError('Minimum 1 guest required');
      return false;
    } else if (value > 100) {
      setGuestCountError('Maximum capacity is 100 guests');
      return false;
    } else {
      setGuestCountError('');
      return true;
    }
  }, []);

  // Update form field
  const updateForm = useCallback((field: keyof HallBookingForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle guest count change with validation
  const handleGuestCountChange = useCallback((value: string) => {
    const numValue = parseInt(value) || 0;
    updateForm('guestCount', numValue);
    validateGuestCount(numValue);
  }, [updateForm, validateGuestCount]);

  // Handle date selection with real API calls
  const handleDateSelect = useCallback(async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    try {
      // Fetch real availability data for the selected date
      const dailyAvailability = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/calendar/availability/${dateStr}`);
      const availabilityResult = await dailyAvailability.json();
      
      if (!dailyAvailability.ok) {
        return;
      }
      
      if (!availabilityResult.data) {
        return;
      }
      
      const dayData = availabilityResult.data;
      
      // Check if the date is available based on real API data
      if (dayData.status === 'booked') {
        return;
      } else if (dayData.status === 'closed') {
        return;
      } else if (dayData.status === 'maintenance') {
        return;
      }
      
      // For available and pending dates, check if there are available slots
      if (dayData.available_slots === 0) {
        return;
      }
      
      setSelectedDate(date);
      setShowBookingModal(true);
      
    } catch (error) {
      // Error checking availability
    }
  }, []);

  // Close booking modal
  const closeBookingModal = useCallback(() => {
    setShowBookingModal(false);
    setSelectedDate(null);
    setGuestCountError('');
    setAgreementAccepted(false);
    // Reset form
    setForm({
      organizerName: '',
      organizerEmail: '',
      organizerPhone: '',
      eventType: '',
      guestCount: 1,
      startTime: '12:00',
      endTime: '17:00',
      specialRequests: '',
    });
  }, []);

  // Handle booking submission with real API call
  const handleBookingSubmit = useCallback(async (formData: FormData) => {
    // Validate all required fields
    if (!selectedDate || !form.organizerName || !form.organizerEmail || !form.organizerPhone || !form.eventType) {
      return;
    }
    
    // Validate guest count
    if (!validateGuestCount(form.guestCount)) {
      return;
    }
    
    // Check if agreement has been accepted
    if (!agreementAccepted) {
      setShowAgreementModal(true);
      return;
    }
    
    const pricing = calculateHallPricing(selectedDate, form.startTime, form.endTime);
    
    try {
      // Create booking data for API
      const bookingData = {
        organizer_name: form.organizerName,
        organizer_email: form.organizerEmail,
        organizer_phone: form.organizerPhone,
        event_type: form.eventType,
        guest_count: form.guestCount,
        special_requests: form.specialRequests,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: form.startTime,
        end_time: form.endTime,
        total_price: pricing.totalPrice,
        deposit_required: pricing.deposit,
        payment_method: 'onsite', // Default payment method
      };
      
      // Make real API call to create booking
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/hall-bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Success - close modal and notify parent
        closeBookingModal();
        setSubmitSuccess(true);
        dispatch(incrementScore());
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        // Handle API errors
        const errorMessage = result.errors || result.message || result.error?.message || 'Booking failed';
      }
      
    } catch (error) {
      // Error submitting booking
    }
  }, [selectedDate, form, agreementAccepted, calculateHallPricing, validateGuestCount, closeBookingModal, dispatch, router]);

  // Handle agreement acceptance
  const handleAgreementAccept = useCallback(() => {
    setAgreementAccepted(true);
    setShowAgreementModal(false);
    // Re-trigger form submission with empty FormData (since we're not using FormData in this implementation)
    handleBookingSubmit(new FormData());
  }, [handleBookingSubmit]);

  return {
    // State
    selectedDate,
    showBookingModal,
    showAgreementModal,
    agreementAccepted,
    form,
    guestCountError,
    
    // Actions
    setSelectedDate,
    setShowBookingModal,
    setShowAgreementModal,
    setAgreementAccepted,
    updateForm,
    handleGuestCountChange,
    handleDateSelect,
    closeBookingModal,
    handleBookingSubmit,
    handleAgreementAccept,
    
    // Utilities
    getTimeOptions,
    getEndTimeOptions,
    calculateHallPricing,
    validateGuestCount,
  };
}
