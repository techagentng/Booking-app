import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, XCircle, AlertTriangle, Clock, Users, MapPin, Phone, CreditCard, Calendar, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useSlotAvailability } from '../hooks/useCalendar';
import { useQueryClient } from '@tanstack/react-query';
import { simulateStripeCheckout, redirectToStripeCheckout } from '../utils/stripe';
import InvoiceModal from './InvoiceModal';

interface HallBookingModalProps {
  selectedDate: Date | null;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}

export default function HallBookingModal({ selectedDate, onClose, onSubmit }: HallBookingModalProps) {
  const queryClient = useQueryClient();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [organizerPhone, setOrganizerPhone] = useState('');
  const [eventType, setEventType] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [guestCountError, setGuestCountError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  
  // Use React Query for availability checking
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const { data: availabilityData, isLoading: isCheckingAvailability, error: availabilityError } = useSlotAvailability(
    formattedDate,
    startTime,
    endTime
  );

  const getTimeOptions = (date: Date) => {
    const dayOfWeek = date.getDay();
    let options: { value: string; label: string }[] = [];
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Monday - Friday: 8AM - 10PM
      for (let hour = 8; hour <= 22; hour++) {
        options.push({
          value: `${hour.toString().padStart(2, '0')}:00`,
          label: `${hour === 12 ? 12 : hour % 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`
        });
      }
    } else if (dayOfWeek === 6) {
      // Saturday: 12PM - 11PM
      for (let hour = 12; hour <= 23; hour++) {
        options.push({
          value: `${hour.toString().padStart(2, '0')}:00`,
          label: `${hour === 12 ? 12 : hour % 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`
        });
      }
    } else {
      // Sunday: 12PM - 6PM
      for (let hour = 12; hour <= 18; hour++) {
        options.push({
          value: `${hour.toString().padStart(2, '0')}:00`,
          label: `${hour === 12 ? 12 : hour % 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`
        });
      }
    }
    
    return options;
  };

  const getEndTimeOptions = (date: Date, startTime: string) => {
    const startHour = parseInt(startTime.split(':')[0]);
    const dayOfWeek = date.getDay();
    let maxHour = dayOfWeek === 6 ? 23 : dayOfWeek === 0 ? 18 : 22;
    
    const options: { value: string; label: string }[] = [];
    for (let hour = startHour + 1; hour <= maxHour; hour++) {
      options.push({
        value: `${hour.toString().padStart(2, '0')}:00`,
        label: `${hour === 12 ? 12 : hour % 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`
      });
    }
    
    return options;
  };

  const calculateHallPricing = (date: Date, startTime: string, endTime: string) => {
    if (!startTime || !endTime) return { totalPrice: 0, deposit: 0, hours: 0 };
    
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    const hours = endHour - startHour;
    const dayOfWeek = date.getDay();
    
    let basePrice = 0;
    let deposit = 0;
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Monday - Friday pricing
      basePrice = hours >= 2 ? 45 + (hours - 2) * 12 : 45;
      deposit = Math.min(basePrice * 0.5, 100); // 50% of base price or £100, whichever is less
    } else if (dayOfWeek === 6) {
      // Saturday pricing
      basePrice = hours >= 5 ? 95 + (hours - 5) * 15 : 95;
      deposit = Math.min(basePrice * 0.5, startHour >= 20 ? 500 : 150); // 50% of base price or max deposit
    } else {
      // Sunday pricing
      basePrice = hours >= 3 ? 65 + (hours - 3) * 15 : 65;
      deposit = Math.min(basePrice * 0.5, 150); // 50% of base price or £150, whichever is less
    }
    
    return {
      totalPrice: basePrice,
      deposit,
      hours
    };
  };

  const handleGuestCountChange = (value: string) => {
    const count = parseInt(value);
    if (count > 100) {
      setGuestCountError('Maximum capacity is 100 guests');
      return;
    }
    setGuestCountError('');
    setGuestCount(count);
  };

  const handleSubmit = async () => {
    setSubmitError(''); // Clear previous errors
    setFieldErrors({}); // Clear field errors
    
    // Debug: Log all field values with trimming
    const debugValues = {
      organizerName: organizerName?.trim(),
      organizerEmail: organizerEmail?.trim(),
      organizerPhone: organizerPhone?.trim(),
      eventType: eventType?.trim(),
      startTime: startTime?.trim(),
      endTime: endTime?.trim(),
      guestCount,
      agreedToTerms,
      paymentMethod: paymentMethod?.trim()
    };

    // Client-side validation with trimmed values
    const missingFields = [];
    const fieldErrors: Record<string, string> = {};
    
    if (!organizerName?.trim()) {
      missingFields.push('Organizer Name');
      fieldErrors.organizerName = 'Organizer name is required';
    }
    if (!organizerEmail?.trim()) {
      missingFields.push('Email');
      fieldErrors.organizerEmail = 'Email is required';
    }
    if (!organizerPhone?.trim()) {
      missingFields.push('Phone');
      fieldErrors.organizerPhone = 'Phone is required';
    } else if (organizerPhone?.trim().length < 10) {
      missingFields.push('Phone must be at least 10 digits');
      fieldErrors.organizerPhone = 'Phone must be at least 10 digits';
    }
    if (!eventType?.trim()) {
      missingFields.push('Event Type');
      fieldErrors.eventType = 'Event type is required';
    }
    if (!startTime?.trim()) {
      missingFields.push('Start Time');
      fieldErrors.startTime = 'Start time is required';
    }
    if (!endTime?.trim()) {
      missingFields.push('End Time');
      fieldErrors.endTime = 'End time is required';
    }
    if (!paymentMethod?.trim()) {
      missingFields.push('Payment Method');
      fieldErrors.paymentMethod = 'Payment method is required';
    }

    // Validate pricing and deposit
    const calculatedPricing = calculateHallPricing(selectedDate, startTime, endTime);
    
    if (calculatedPricing.deposit > calculatedPricing.totalPrice) {
      fieldErrors.deposit = 'Deposit cannot be greater than total price';
      missingFields.push('Deposit validation error');
    }

    if (missingFields.length > 0) {
      setFieldErrors(fieldErrors);
      return;
    }

    if (!agreedToTerms) {
      return;
    }

    if (guestCount > 100) {
      setGuestCountError('Maximum capacity is 100 guests');
      return;
    }

    // Check if selected date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    const selectedDateStart = new Date(selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0); // Set to start of day for comparison
    
    if (selectedDateStart < today) {
      return;
    }

    // Check if selected date is too far in the future (optional - e.g., more than 1 year)
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
    if (selectedDateStart > maxFutureDate) {
      return;
    }

    setIsSubmitting(true);
    
    const submitPricing = calculateHallPricing(selectedDate, startTime, endTime);
    
    // Check availability using React Query data
    if (availabilityError) {
      setIsSubmitting(false);
      throw new Error('Failed to check availability. Please try again.');
    }
    
    if (!availabilityData?.available) {
      setIsSubmitting(false);
      throw new Error('This time slot is not available. Please choose a different time.');
    }

    if (paymentMethod === 'online') {
      await handleStripePayment();
    } else {
      await handleOnsitePayment();
    }
  };

  const handleStripePayment = async () => {
    setIsProcessingPayment(true);
    
    try {
      // For demo purposes, use simulated checkout
      // In production, you would use redirectToStripeCheckout
      const stripePricing = calculateHallPricing(selectedDate, startTime, endTime);
      const checkoutData = {
        organizerName,
        organizerEmail,
        organizerPhone,
        eventType,
        guestCount,
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        startTime,
        endTime,
        specialRequests,
        totalPrice: stripePricing.totalPrice,
        depositRequired: stripePricing.deposit,
      };
      
      const sessionId = await simulateStripeCheckout(checkoutData);
            
      // After successful payment simulation, submit the booking
      await handleOnsitePayment();
      
    } catch (error) {
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleOnsitePayment = async () => {
    setIsSubmitting(true);
    
    const onsitePricing = calculateHallPricing(selectedDate, startTime, endTime);
    
    if (availabilityError) {
      throw new Error('Failed to check availability. Please try again.');
    }
    
    if (!availabilityData?.available) {
      throw new Error('This time slot is not available. Please choose a different time.');
    }
    
    const bookingData = {
      organizer_name: organizerName,
      organizer_email: organizerEmail,
      organizer_phone: organizerPhone,
      event_type: eventType,
      guest_count: guestCount,
      special_requests: specialRequests,
      booking_date: format(selectedDate, 'yyyy-MM-dd'),
      start_time: startTime,
      end_time: endTime,
      total_price: onsitePricing.totalPrice,
      deposit_required: onsitePricing.deposit,
      payment_method: paymentMethod,
    };
    
    try {
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/hall-bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add JWT token if authentication is implemented
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Store booking data for invoice modal
        setCreatedBooking(result.data);
        setShowInvoiceModal(true);
        // Optional: Close the booking modal after successful submission
        // onClose();
      } else {
        // Handle different error types
        const errorMessage = result.errors || result.message || '';
        
        if (response.status === 409) {
          // Refresh availability data
          queryClient.invalidateQueries({
            queryKey: ['calendar', 'check-availability', formattedDate, startTime, endTime],
          });
          // Also refresh the monthly calendar data
          const date = new Date(formattedDate);
          queryClient.invalidateQueries({
            queryKey: ['calendar', 'monthly', date.getFullYear(), date.getMonth() + 1],
          });
          throw new Error('This time slot was just booked by someone else. Please choose a different time or refresh the calendar.');
        } else if (response.status === 400) {
          // Handle field-specific validation errors
          if (result.error?.fields) {
            // Set field-specific errors
            setFieldErrors(result.error.fields);
            throw new Error('Please correct the errors in the form.');
          } else if (errorMessage.includes('hall is not available for the requested time slot')) {
            // Refresh availability data to get the latest state
            queryClient.invalidateQueries({
              queryKey: ['calendar', 'check-availability', formattedDate, startTime, endTime],
            });
            // Also refresh the monthly calendar data
            const date = new Date(formattedDate);
            queryClient.invalidateQueries({
              queryKey: ['calendar', 'monthly', date.getFullYear(), date.getMonth() + 1],
            });
            throw new Error('This time slot is no longer available. It may have been booked by someone else. Please choose a different time.');
          } else if (errorMessage.includes('booking date must be in the future')) {
            setFieldErrors({ bookingDate: 'Booking date must be in the future. Please select a future date for your event.' });
            throw new Error('Please correct the errors in the form.');
          } else if (errorMessage.includes('deposit cannot be greater than total price')) {
            throw new Error('Deposit amount cannot be greater than the total price. Please check your booking details.');
          } else if (errorMessage.includes('organizer_phone')) {
            setFieldErrors({ organizerPhone: 'Please enter a valid phone number (minimum 10 digits).' });
            throw new Error('Please correct the errors in the form.');
          } else if (errorMessage.includes('organizer_email')) {
            setFieldErrors({ organizerEmail: 'Please enter a valid email address.' });
            throw new Error('Please correct the errors in the form.');
          } else if (errorMessage.includes('guest_count')) {
            setFieldErrors({ guestCount: 'Please enter a valid number of guests (1-100).' });
            throw new Error('Please correct the errors in the form.');
          } else {
            throw new Error(errorMessage || 'Invalid booking data. Please check your form and try again.');
          }
        } else if (response.status === 422) {
          throw new Error(errorMessage || 'Invalid booking data. Please check all required fields.');
        } else {
          throw new Error(errorMessage || `Booking failed (${response.status}). Please try again.`);
        }
      }
    } catch (error) {
      setSubmitError(error.message);
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear field error when user starts typing
  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  
  const handleInvoiceClose = () => {
    setShowInvoiceModal(false);
    // Don't call onClose() here - we want to return to the booking form
  };

  const pricing = calculateHallPricing(selectedDate, startTime, endTime);

  // Don't render if no date is selected
  if (!selectedDate) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Hall Booking Enquiry</h2>
              <p className="text-gray-500">Complete your booking request for {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {/* Availability Status */}
            {availabilityData && (
              <div className={`p-4 rounded-lg border ${
                availabilityData.available 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {availabilityData.available ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Time slot is available for booking</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">This time slot is not available. Please choose a different time.</span>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Error Display */}
            {submitError && (
              <div className="p-4 rounded-lg border bg-red-50 border-red-200 text-red-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Booking Error</span>
                </div>
                <p className="mt-2 text-sm">{submitError}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <select
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    clearFieldError('startTime');
                    clearFieldError('deposit'); // Clear deposit error when time changes
                    const endOptions = getEndTimeOptions(selectedDate, e.target.value);
                    if (!endOptions.find(opt => opt.value === endTime)) {
                      setEndTime(endOptions[0]?.value || '');
                    }
                  }}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 text-gray-900 ${
                    fieldErrors.startTime ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
                  }`}
                >
                  {getTimeOptions(selectedDate).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.startTime && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {fieldErrors.startTime}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <select
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    clearFieldError('endTime');
                    clearFieldError('deposit'); // Clear deposit error when time changes
                  }}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 text-gray-900 ${
                    fieldErrors.endTime ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
                  }`}
                >
                  {getEndTimeOptions(selectedDate, startTime).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.endTime && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {fieldErrors.endTime}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Hall Opening Hours:</strong><br/>
                Monday - Friday: 8:00 AM - 10:00 PM<br/>
                Saturday: 12:00 PM - 11:00 PM<br/>
                Sunday: 12:00 PM - 6:00 PM
              </p>
            </div>

            <div className="bg-gray-800 text-white p-4 rounded-lg">
              <h3 className="font-semibold text-white mb-2">Pricing Details</h3>
              <div className="space-y-1 text-sm">
                <p>Base Price: £{pricing.totalPrice || 'Please select time'}</p>
                <p className={fieldErrors.deposit ? 'text-red-400' : ''}>
                  Deposit Required: £{pricing.deposit || 'Please select time'}
                </p>
                <p>Total Hours: {pricing.hours || 'Please select time'}</p>
              </div>
              {fieldErrors.deposit && (
                <p className="text-xs text-red-400 mt-2">{fieldErrors.deposit}</p>
              )}
              {pricing.totalPrice === 0 && (
                <p className="text-xs text-yellow-400 mt-2">Please select valid start and end times</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organizer Name *</label>
                <input
                  type="text"
                  value={organizerName}
                  onChange={(e) => {
                    setOrganizerName(e.target.value);
                    clearFieldError('organizerName');
                  }}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500 ${
                    fieldErrors.organizerName ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Your name"
                />
                {fieldErrors.organizerName && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {fieldErrors.organizerName}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={organizerEmail}
                  onChange={(e) => {
                    setOrganizerEmail(e.target.value);
                    clearFieldError('organizerEmail');
                  }}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500 ${
                    fieldErrors.organizerEmail ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
                  }`}
                  placeholder="your@email.com"
                />
                {fieldErrors.organizerEmail && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {fieldErrors.organizerEmail}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={organizerPhone}
                  onChange={(e) => {
                    setOrganizerPhone(e.target.value);
                    clearFieldError('organizerPhone');
                  }}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500 ${
                    fieldErrors.organizerPhone || guestCountError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Your phone number (min 10 digits)"
                  minLength={10}
                  maxLength={20}
                  required
                />
                {(fieldErrors.organizerPhone || guestCountError) && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {fieldErrors.organizerPhone || guestCountError}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
                <select
                  value={eventType}
                  onChange={(e) => {
                    setEventType(e.target.value);
                    clearFieldError('eventType');
                  }}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 text-gray-900 ${
                    fieldErrors.eventType ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select Event Type</option>
                  <option value="party">Private Party / Celebration</option>
                  <option value="wedding">Wedding Reception</option>
                  <option value="meeting">Community Meeting</option>
                  <option value="christening">Christening / Naming Ceremony</option>
                  <option value="funeral">Memorial / Wake</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="fete">Summer Fete / Fair</option>
                  <option value="other">Other</option>
                </select>
                {fieldErrors.eventType && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {fieldErrors.eventType}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Number of Guests *</label>
                <input
                  type="number"
                  value={guestCount}
                  onChange={(e) => {
                    handleGuestCountChange(e.target.value);
                    clearFieldError('guestCount');
                  }}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500 ${
                    fieldErrors.guestCount || guestCountError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
                  }`}
                  min="1"
                  max="100"
                  placeholder="Number of guests"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum capacity: 100 people</p>
                {(fieldErrors.guestCount || guestCountError) && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {fieldErrors.guestCount || guestCountError}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    clearFieldError('paymentMethod');
                  }}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 text-gray-900 ${
                    fieldErrors.paymentMethod ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select Payment Method</option>
                  <option value="onsite">Pay On-site (Card)</option>
                  <option value="cash">Pay Cash (On-site)</option>
                  <option value="online">Pay Online (Bank Transfer)</option>
                </select>
                {fieldErrors.paymentMethod && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {fieldErrors.paymentMethod}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {paymentMethod === 'onsite' ? 'Card payment due on day of event' : 
                   paymentMethod === 'cash' ? 'Cash payment due on day of event' : 
                   'Payment required 7 days before event'}
                </p>
                {paymentMethod === 'online' && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      Secure payment via Stripe
                    </p>
                  </div>
                )}
              </div>
            </div>

            {eventType === 'party' && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Please note: We do not allow parties for ages 13-20 years.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requirements or requests..."
                rows={3}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-gray-50 text-gray-900 placeholder-gray-500"
              />
            </div>

            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">Terms and Conditions</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    I agree to the hall booking terms and conditions, including the deposit requirement, 
                    cancellation policy, and adherence to hall rules. I understand that the booking is 
                    subject to availability and confirmation by management.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isProcessingPayment || isCheckingAvailability || !agreedToTerms}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </>
                ) : isCheckingAvailability ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Checking Availability...
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : paymentMethod === 'online' ? (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay Online
                  </>
                ) : paymentMethod === 'cash' ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Pay Cash
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Submit Enquiry
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={handleInvoiceClose}
        bookingData={createdBooking || {
          organizerName,
          organizerEmail,
          organizerPhone,
          eventType,
          guestCount,
          bookingDate: selectedDate,
          startTime,
          endTime,
          specialRequests,
          totalPrice: pricing.totalPrice,
          depositRequired: pricing.deposit,
          payment_method: paymentMethod,
        }}
      />
    </div>
  );
}
