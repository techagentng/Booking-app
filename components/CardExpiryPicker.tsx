import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface CardExpiryPickerProps {
  value: string;
  onChange: (expiry: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

export default function CardExpiryPicker({
  value,
  onChange,
  placeholder = 'MM/YY',
  className = '',
  minDate,
  maxDate,
  disabled = false,
}: CardExpiryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const pickerRef = useRef<HTMLDivElement>(null);

  const parseExpiry = (expiry: string): Date | null => {
    const match = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return null;
    
    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10) + 2000; // Convert YY to YYYY
    
    if (month < 1 || month > 12) return null;
    
    return new Date(year, month - 1, 1);
  };

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? parseExpiry(value) : null
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatExpiry = (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${year}`;
  };

  const isValidMonth = (month: number, year: number): boolean => {
    if (minDate) {
      const minYear = minDate.getFullYear();
      const minMonth = minDate.getMonth();
      if (year < minYear || (year === minYear && month < minMonth)) {
        return false;
      }
    }
    
    if (maxDate) {
      const maxYear = maxDate.getFullYear();
      const maxMonth = maxDate.getMonth();
      if (year > maxYear || (year === maxYear && month > maxMonth)) {
        return false;
      }
    }
    
    return true;
  };

  const handleMonthSelect = (month: number, year: number) => {
    if (!isValidMonth(month, year)) return;
    
    const newDate = new Date(year, month, 1);
    setSelectedDate(newDate);
    onChange(formatExpiry(newDate));
    setIsOpen(false);
  };

  const handlePreviousYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() - 1, 0, 1));
  };

  const handleNextYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() + 1, 0, 1));
  };

  const renderMonthGrid = () => {
    const year = currentMonth.getFullYear();
    const months = [];
    
    for (let month = 0; month < 12; month++) {
      const date = new Date(year, month, 1);
      const isSelected = selectedDate && 
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;
      
      const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;
      const isValid = isValidMonth(month, year);

      months.push(
        <button
          key={month}
          onClick={() => handleMonthSelect(month, year)}
          disabled={!isValid}
          className={`p-3 rounded-lg text-sm font-medium transition-colors ${
            isSelected
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : isCurrentMonth
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              : isValid
              ? 'text-gray-700 hover:bg-gray-100'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <div className="font-semibold">
            {date.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}
          </div>
          <div className="text-xs opacity-75">
            {date.toLocaleDateString('en-GB', { month: 'long' })}
          </div>
        </button>
      );
    }

    return months;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div ref={pickerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={selectedDate ? formatExpiry(selectedDate) : ''}
          readOnly
          onClick={() => !disabled && setIsOpen(!isOpen)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer placeholder-gray-500 dark:placeholder-gray-400 ${
            disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'
          } border-gray-300`}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Month Picker Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePreviousYear}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900">
              {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={handleNextYear}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-3 gap-2">
            {renderMonthGrid()}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => {
                const today = new Date();
                if (isValidMonth(today.getMonth(), today.getFullYear())) {
                  setSelectedDate(today);
                  onChange(formatExpiry(today));
                  setIsOpen(false);
                }
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Current Month
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-700 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
