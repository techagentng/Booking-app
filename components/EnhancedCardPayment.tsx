import React, { useState } from 'react';
import { CreditCard, Lock, Check, AlertCircle, Loader2, Shield, Smartphone } from 'lucide-react';
import { confirmCardPayment } from '../lib/stripe';
import CardExpiryPicker from './CardExpiryPicker';

interface EnhancedCardPaymentProps {
  clientSecret: string;
  billingDetails: {
    name: string;
    email: string;
    phone: string;
    address: {
      line1: string;
      city: string;
      postal_code: string;
      country: string;
    };
  };
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
  isLoading: boolean;
}

export default function EnhancedCardPayment({
  clientSecret,
  billingDetails,
  onPaymentSuccess,
  onPaymentError,
  isLoading,
}: EnhancedCardPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState(billingDetails.name);
  const [saveCard, setSaveCard] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substr(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const getCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard';
    if (cleaned.startsWith('3')) return 'amex';
    return 'unknown';
  };

  const validateCard = () => {
    const newErrors: { [key: string]: string } = {};

    // Card number validation
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
      newErrors.cardNumber = 'Invalid card number';
    }

    // Expiry validation
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(expiry)) {
      newErrors.expiry = 'Invalid expiry date (MM/YY)';
    }

    // CVC validation
    if (cvc.length < 3 || cvc.length > 4) {
      newErrors.cvc = 'Invalid CVC';
    }

    // Name validation
    if (cardName.trim().length < 2) {
      newErrors.cardName = 'Cardholder name required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Payment form submitted!', {
      cardNumber: cardNumber.replace(/\s/g, '').slice(-4),
      expiry,
      cvc: cvc.replace(/\d/g, '*'),
      cardName,
      isFormValid: isFormValid(),
      errors,
      isProcessing,
      isLoading
    });

    // Validate form before proceeding
    if (!isFormValid()) {
      console.log('Form validation failed');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Processing payment with Stripe:', {
        cardNumber: cardNumber.replace(/\s/g, '').slice(-4),
        expiry,
        cvc: cvc.replace(/\d/g, '*'),
        name: cardName,
        saveCard,
        clientSecret,
      });

      // Create a mock card element for Stripe (in real implementation, you'd use Stripe Elements)
      const mockCardElement = {
        number: cardNumber.replace(/\s/g, ''),
        exp_month: parseInt(expiry.split('/')[0]),
        exp_year: parseInt(expiry.split('/')[1]) + 2000,
        cvc: cvc,
      };

      // Process payment with Stripe
      const paymentIntent = await confirmCardPayment(clientSecret, mockCardElement, {
        name: cardName,
        email: billingDetails.email,
        phone: billingDetails.phone,
        address: billingDetails.address,
      });

      console.log('Payment successful!', paymentIntent);
      onPaymentSuccess();
      
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardType = getCardType(cardNumber);
  
  // Enhanced form validation - stricter for real Stripe processing
  const isFormValid = () => {
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    const hasValidCardNumber = cleanedCardNumber.length >= 13 && cleanedCardNumber.length <= 19;
    const hasValidExpiry = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry);
    const hasValidCvc = cvc.length >= 3 && cvc.length <= 4;
    const hasValidName = cardName.trim().length >= 2;
    const hasNoErrors = Object.keys(errors).length === 0;
    
    return hasValidCardNumber && hasValidExpiry && hasValidCvc && hasValidName && hasNoErrors;
  };

  return (
    <div className="space-y-6">
      {/* Card Preview */}
      <div className="relative">
        <div className={`bg-gradient-to-br ${
          cardType === 'visa' ? 'from-blue-600 to-blue-800' :
          cardType === 'mastercard' ? 'from-red-600 to-orange-600' :
          cardType === 'amex' ? 'from-green-600 to-green-800' :
          'from-gray-600 to-gray-800'
        } rounded-xl p-6 text-white shadow-xl transform transition-all hover:scale-105`}>
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-xs opacity-75">SECURE CARD</div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="text-lg tracking-wider font-mono">
              {cardNumber || '#### #### #### ####'}
            </div>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs opacity-75 mb-1">CARDHOLDER</div>
              <div className="text-sm uppercase tracking-wide">
                {cardName || 'YOUR NAME'}
              </div>
            </div>
            <div>
              <div className="text-xs opacity-75 mb-1">EXPIRES</div>
              <div className="text-sm">
                {expiry || 'MM/YY'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CreditCard className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              onFocus={() => setFocusedField('cardNumber')}
              onBlur={() => setFocusedField(null)}
              placeholder="1234 5678 9012 3456"
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-600 dark:placeholder-gray-300 ${
                errors.cardNumber ? 'border-red-500' : 'border-gray-300'
              } ${focusedField === 'cardNumber' ? 'ring-2 ring-blue-500' : ''}`}
              maxLength={19}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {cardType === 'visa' && (
                <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
              )}
              {cardType === 'mastercard' && (
                <div className="w-8 h-5 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">MC</div>
              )}
              {cardType === 'amex' && (
                <div className="w-8 h-5 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">AMEX</div>
              )}
            </div>
          </div>
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.cardNumber}
            </p>
          )}
        </div>

        {/* Card Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            onFocus={() => setFocusedField('cardName')}
            onBlur={() => setFocusedField(null)}
            placeholder="John Doe"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-500 dark:placeholder-gray-400 ${
              errors.cardName ? 'border-red-500' : 'border-gray-300'
            } ${focusedField === 'cardName' ? 'ring-2 ring-blue-500' : ''}`}
          />
          {errors.cardName && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.cardName}
            </p>
          )}
        </div>

        {/* Expiry and CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <CardExpiryPicker
              value={expiry}
              onChange={(value) => {
                setExpiry(value);
                setErrors(prev => ({ ...prev, expiry: '' }));
              }}
              placeholder="MM/YY"
              className="w-full"
            />
            {errors.expiry && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.expiry}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVC
            </label>
            <div className="relative">
              <input
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                onFocus={() => setFocusedField('cvc')}
                onBlur={() => setFocusedField(null)}
                placeholder="123"
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-600 dark:placeholder-gray-300 ${
                  errors.cvc ? 'border-red-500' : 'border-gray-300'
                } ${focusedField === 'cvc' ? 'ring-2 ring-blue-500' : ''}`}
                maxLength={4}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            {errors.cvc && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.cvc}
              </p>
            )}
          </div>
        </div>

        {/* Save Card Option */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="saveCard"
            checked={saveCard}
            onChange={(e) => setSaveCard(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="saveCard" className="text-sm text-gray-700 cursor-pointer">
            Save card for future payments
          </label>
        </div>

        {/* Security Badges */}
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4 text-green-500" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Lock className="w-4 h-4 text-green-500" />
            <span>PCI Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Smartphone className="w-4 h-4 text-green-500" />
            <span>Mobile Ready</span>
          </div>
        </div>

        {/* Payment Button */}
        <button
          type="submit"
          disabled={isProcessing || isLoading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isProcessing || isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              <span>Pay with Stripe</span>
            </>
          )}
        </button>

        {/* Accepted Cards */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <span>We accept:</span>
          <div className="flex gap-2">
            <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
            <div className="w-10 h-6 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">MC</div>
            <div className="w-10 h-6 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">AMEX</div>
          </div>
        </div>
      </form>
    </div>
  );
}
