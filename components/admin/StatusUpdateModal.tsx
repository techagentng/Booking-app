import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface StatusUpdateModalProps {
  bookingId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (status: string, notes?: string) => void;
  currentStatus?: string;
  isUpdating?: boolean;
  updateError?: string | null;
}

// Helper function to get valid next statuses based on business logic
const getNextValidStatuses = (currentStatus?: string) => {
  switch(currentStatus) {
    case 'pending':
      return ['confirmed', 'cancelled'];
    case 'confirmed': 
      return ['completed', 'cancelled'];
    case 'completed':
    case 'cancelled':
      return []; // No further changes allowed
    default:
      return ['pending', 'confirmed', 'completed', 'cancelled']; // Show all for unknown status
  }
};

const statusOptions = [
  { value: 'pending', label: 'Pending', icon: AlertCircle, color: 'yellow' },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'green' },
  { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'blue' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'red' },
];

export default function StatusUpdateModal({
  bookingId,
  isOpen,
  onClose,
  onUpdate,
  currentStatus,
  isUpdating = false,
  updateError = null
}: StatusUpdateModalProps) {
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Get only valid status options based on current status
  const validStatusOptions = statusOptions.filter(option => 
    getNextValidStatuses(currentStatus).includes(option.value)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!status || isUpdating) {
      return;
    }

    setError(''); // Clear previous errors
    
    // Call the update function (React Query will handle the mutation)
    onUpdate(status, notes || undefined);
  };

  const handleClose = () => {
    if (!isUpdating) {
      onClose();
      setStatus('');
      setNotes('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Update Booking Status</h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-indigo-500 rounded-full p-1 transition-colors"
            disabled={isUpdating}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(option.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      status === option.value
                        ? `border-${option.color}-500 bg-${option.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className={`w-6 h-6 text-${option.color}-600`} />
                      <span className="text-sm font-medium text-gray-900">{option.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
              placeholder="Add any notes about this status change..."
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-700">
              <strong>Booking ID:</strong> #{bookingId}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              This action will be logged in the booking's audit trail.
            </p>
          </div>

          {/* Error Display */}
          {(error || updateError) && (
            <div className="mb-6 p-4 rounded-lg border bg-red-50 border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">Status Update Error</span>
              </div>
              <p className="mt-2 text-sm text-red-700">{error || updateError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUpdating}
              className="px-4 py-2 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!status || isUpdating}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUpdating && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
