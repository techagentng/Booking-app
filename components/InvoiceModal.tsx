import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Printer, Calendar, Clock, Users, Phone, Mail, MapPin, CreditCard, Building, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import PaymentButton from './PaymentButton';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    // Backend data structure (preferred)
    id?: number;
    booking_id?: string;
    organizer_name?: string;
    organizer_email?: string;
    organizer_phone?: string;
    event_type?: string;
    guest_count?: number;
    booking_date?: string;
    start_time?: string;
    end_time?: string;
    special_requests?: string;
    total_price?: number;
    deposit_required?: number;
    payment_method?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
    payments?: Array<{
      id: number;
      payment_type: string;
      payment_method: string;
      amount: number;
      status: string;
      due_date: string;
      created_at: string;
    }>;
    invoice?: {
      id: number;
      invoice_number: string;
      invoice_date: string;
      due_date: string;
      total_amount: number;
      status: string;
    };
    // Fallback frontend data structure
    organizerName?: string;
    organizerEmail?: string;
    organizerPhone?: string;
    eventType?: string;
    guestCount?: number;
    bookingDate?: Date;
    startTime?: string;
    endTime?: string;
    totalPrice?: number;
    depositRequired?: number;
  };
}

export default function InvoiceModal({ isOpen, onClose, bookingData }: InvoiceModalProps) {
  if (!isOpen) return null;

  const [depositAdjusted, setDepositAdjusted] = useState(false);

  // Use backend data if available, otherwise fallback to frontend data
  const isBackendData = bookingData.booking_id || bookingData.id;
  
  const organizerName = bookingData.organizer_name || bookingData.organizerName || '';
  const organizerEmail = bookingData.organizer_email || bookingData.organizerEmail || '';
  const organizerPhone = bookingData.organizer_phone || bookingData.organizerPhone || '';
  const eventType = bookingData.event_type || bookingData.eventType || '';
  const guestCount = bookingData.guest_count || bookingData.guestCount || 0;
  const bookingDate = bookingData.booking_date ? new Date(bookingData.booking_date) : (bookingData.bookingDate || new Date());
  const startTime = bookingData.start_time || bookingData.startTime || '';
  const endTime = bookingData.end_time || bookingData.endTime || '';
  const specialRequests = bookingData.special_requests || '';
  const totalPrice = bookingData.total_price || bookingData.totalPrice || 0;
  let depositRequired = bookingData.deposit_required || bookingData.depositRequired || 0;
  
  if (depositRequired > totalPrice) {
    depositRequired = Math.floor(totalPrice * 0.3); // Default to 30% of total price
    console.warn('Deposit was greater than total price, adjusted to 30%:', depositRequired);
    setDepositAdjusted(true);
  }
  
  const paymentMethod = bookingData.payment_method || '';
  const bookingId = bookingData.booking_id || '';
  const status = bookingData.status || 'pending';
  const payments = bookingData.payments || [];
  const invoice = bookingData.invoice || null;

  // Use backend invoice data if available, otherwise generate
  const invoiceNumber = invoice?.invoice_number || `INV-${Date.now().toString().slice(-6)}`;
  const invoiceDate = invoice?.invoice_date ? new Date(invoice.invoice_date) : new Date();
  const dueDate = invoice?.due_date ? new Date(invoice.due_date) : (() => {
    const date = new Date(bookingDate);
    date.setDate(date.getDate() - 7); // Due 7 days before event
    return date;
  })();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple text version for download
    const invoiceText = `
HALL BOOKING INVOICE
===================

Invoice Number: ${invoiceNumber}
Invoice Date: ${format(invoiceDate, 'dd MMMM yyyy')}
Due Date: ${format(dueDate, 'dd MMMM yyyy')}

BILLING INFORMATION
------------------
Name: ${organizerName}
Email: ${organizerEmail}
Phone: ${organizerPhone}

EVENT DETAILS
------------
Event Type: ${eventType}
Date: ${format(bookingDate, 'EEEE d MMMM yyyy')}
Time: ${startTime} - ${endTime}
Guests: ${guestCount}
Special Requests: ${specialRequests || 'None'}

PAYMENT DETAILS
--------------
Base Price: £${totalPrice}
Deposit Required: £${depositRequired}
Balance Due: £${totalPrice - depositRequired}

PAYMENT METHOD
--------------
Pay On-site (Cash/Card) - Due on event day

TOTAL AMOUNT: £${totalPrice}

PAYMENT INSTRUCTIONS
-------------------
1. Deposit of £${depositRequired} due by ${format(dueDate, 'dd MMMM yyyy')}
2. Balance of £${totalPrice - depositRequired} due on event day
3. Payment can be made via cash or card at the venue
4. For card payments, please bring a valid credit/debit card

CONTACT INFORMATION
------------------
Venue: Community Hall
Phone: 01795 473 123
Email: bookings@communityhall.co.uk

Thank you for your booking!
`;

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Hall Booking Invoice</h1>
              <p className="text-blue-100">Community Hall Booking System</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8">
          {/* Invoice Header */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Invoice Details</h2>
                <div className="space-y-1">
                  <p className="text-sm"><span className="font-medium text-gray-700">Number:</span> <span className="text-gray-900">{invoiceNumber}</span></p>
                  <p className="text-sm"><span className="font-medium text-gray-700">Date:</span> <span className="text-gray-900">{format(invoiceDate, 'dd MMMM yyyy')}</span></p>
                  <p className="text-sm"><span className="font-medium text-gray-700">Due:</span> <span className="text-gray-900">{format(dueDate, 'dd MMMM yyyy')}</span></p>
                  {bookingId && <p className="text-sm"><span className="font-medium text-gray-700">Booking ID:</span> <span className="text-gray-900">{bookingId}</span></p>}
                  {status && <p className="text-sm"><span className="font-medium text-gray-700">Status:</span> <span className={`font-medium capitalize ${
                    status === 'confirmed' ? 'text-green-600' : 
                    status === 'cancelled' ? 'text-red-600' : 
                    status === 'completed' ? 'text-blue-600' : 
                    'text-orange-600'
                  }`}>{status}</span></p>}
                </div>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Venue Information</h2>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">Community Hall</p>
                  <p className="text-sm text-gray-600">123 High Street</p>
                  <p className="text-sm text-gray-600">Sittingbourne, ME10 1AA</p>
                  <p className="text-sm text-gray-600">Phone: 01795 473 123</p>
                  <p className="text-sm text-gray-600">Email: bookings@communityhall.co.uk</p>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Billing Information
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Name</p>
                  <p className="font-medium text-gray-900">{organizerName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Email</p>
                  <p className="font-medium text-gray-900">{organizerEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Phone</p>
                  <p className="font-medium text-gray-900">{organizerPhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Event Details
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Event Type</p>
                  <p className="font-medium text-gray-900 capitalize">{eventType}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Number of Guests</p>
                  <p className="font-medium text-gray-900">{guestCount}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Date</p>
                  <p className="font-medium text-gray-900">{format(bookingDate, 'EEEE d MMMM yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Time</p>
                  <p className="font-medium text-gray-900">{startTime} - {endTime}</p>
                </div>
              </div>
              {specialRequests && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Special Requests</p>
                  <p className="text-sm bg-white p-2 rounded border border-gray-200 text-gray-900">{specialRequests}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Details
            </h2>
            
            {/* Deposit Adjustment Warning */}
            {depositAdjusted && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Deposit Amount Adjusted
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      The original deposit amount exceeded the total price. It has been automatically adjusted to 30% of the total price (£{depositRequired}).
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Base Price</span>
                  <span className="font-medium text-gray-900">£{totalPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Deposit Required</span>
                  <span className="font-medium text-gray-900">£{depositRequired}</span>
                </div>
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                    <span className="text-lg font-bold text-blue-600">£{totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Payment Method
            </h2>
            
            {/* Stripe Payment Section - Show for pending bookings */}
            {status === 'pending' && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <span className="font-semibold text-blue-800 text-lg">Pay Online with Stripe</span>
                  </div>
                  <p className="text-blue-700 mb-4">
                    Pay securely online using your credit/debit card. Your booking will be confirmed immediately after payment.
                  </p>
                  
                  <PaymentButton
                    bookingId={bookingData.id || bookingId}
                    totalAmount={totalPrice * 100} // Convert to pence
                    eventType={eventType}
                    bookingDate={format(bookingDate, 'yyyy-MM-dd')}
                    guestCount={guestCount}
                    startTime={startTime}
                    endTime={endTime}
                    customerEmail={organizerEmail}
                    onSuccess={() => {
                      console.log('Payment initiated successfully');
                      // Optional: Close modal or show success message
                    }}
                    onError={(error) => {
                      console.error('Payment error:', error);
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Traditional Payment Methods */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Building className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-800">
                  {paymentMethod === 'cash' ? 'Pay Cash (On-site)' : 
                   paymentMethod === 'onsite' ? 'Pay On-site (Card)' : 
                   'Pay Online (Bank Transfer)'}
                </span>
              </div>
              <div className="text-sm text-blue-700 space-y-2">
                {isBackendData && payments.length > 0 ? (
                  // Show real payment schedule from backend
                  payments.map((payment) => (
                    <div key={payment.id} className="border-b border-blue-100 pb-2">
                      <p><strong>{payment.payment_type.charAt(0).toUpperCase() + payment.payment_type.slice(1)} (£{payment.amount})</strong></p>
                      <p>Due: {format(new Date(payment.due_date), 'dd MMMM yyyy')}</p>
                      <p>Status: <span className={`font-medium ${
                        payment.status === 'paid' ? 'text-green-600' : 
                        payment.status === 'overdue' ? 'text-red-600' : 
                        'text-orange-600'
                      }`}>{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span></p>
                    </div>
                  ))
                ) : (
                  // Fallback to frontend logic
                  (paymentMethod === 'cash' ? (
                    <>
                      <p><strong>Deposit (£{depositRequired})</strong> due by {format(dueDate, 'dd MMMM yyyy')}</p>
                      <p><strong>Balance (£{totalPrice - depositRequired})</strong> due on event day</p>
                      <p>Payment must be made in cash at the venue</p>
                      <p>Please bring exact amount or be prepared for change</p>
                    </>
                  ) : paymentMethod === 'onsite' ? (
                    <>
                      <p><strong>Deposit (£{depositRequired})</strong> due by {format(dueDate, 'dd MMMM yyyy')}</p>
                      <p><strong>Balance (£{totalPrice - depositRequired})</strong> due on event day</p>
                      <p>Payment can be made via cash or card at the venue</p>
                      <p>For card payments, please bring a valid credit/debit card</p>
                    </>
                  ) : (
                    <>
                      <p><strong>Full payment (£{totalPrice})</strong> due by {format(dueDate, 'dd MMMM yyyy')}</p>
                      <p>Payment must be made via bank transfer</p>
                      <p>Bank details will be provided in confirmation email</p>
                    </>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 print:hidden">
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Invoice
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print Invoice
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 rounded-b-xl border-t">
          <p className="text-center text-sm text-gray-600">
            Thank you for choosing Community Hall for your event. For any questions, please contact us at 01795 473 123.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
