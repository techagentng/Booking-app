import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { ArrowLeft, ArrowRight, CheckCircle, User, Building, Store, Home, Briefcase, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { providerAPI } from '../../lib/api/provider';

const businessTypes = [
  { id: 'hotel', name: 'Hotel', icon: '🏨', description: 'Accommodation and hospitality services' },
  { id: 'restaurant', name: 'Restaurant', icon: '🍽️', description: 'Food and beverage services' },
  { id: 'transport', name: 'Transport', icon: '🚗', description: 'Transportation and logistics' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', description: 'Retail and shopping services' },
  { id: 'events', name: 'Events', icon: '🎪', description: 'Event planning and management' },
  { id: 'services', name: 'Services', icon: '💼', description: 'Professional and personal services' },
];

export default function RegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedBusinessType, setSelectedBusinessType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessType: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.businessName) newErrors.businessName = 'Business name is required';
    if (!selectedBusinessType) newErrors.businessType = 'Business type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      // Register provider with backend
      setIsLoading(true);
      setError('');
      
      try {
        await providerAPI.register({
          email: formData.email,
          password: formData.password,
          business_name: formData.businessName,
          business_type: selectedBusinessType,
          phone: formData.phone,
        });
        
        // Store registration data for next steps
        localStorage.setItem('provider_onboarding_data', JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          businessName: formData.businessName,
          businessType: selectedBusinessType,
        }));
        
        // Proceed to email verification
        router.push('/onboarding/business-info');
      } catch (err) {
        setError('Registration failed. Please try again.');
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-gtbank-primary rounded-full flex items-center justify-center text-white font-bold">
              1
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Registration</h1>
              <p className="text-gray-600">Create your account and select your business type</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-[#FFF1E6] rounded-full h-2">
            <div className="bg-gradient-to-r from-gtbank-primary to-gtbank-secondary h-2 rounded-full" style={{ width: `${(step / 2) * 100}%` }} />
          </div>
        </motion.div>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-[#F1F1F1] p-8"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-[#5B6470] text-sm">Enter your contact details to create your account</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[#F5E6DA] rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
                    placeholder="John"
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[#F5E6DA] rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
                    placeholder="Doe"
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7A828D] w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-[#F5E6DA] rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
                    placeholder="john@company.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-[#F5E6DA] rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
                  placeholder="+234 800 000 0000"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7A828D] w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-[#F5E6DA] rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7A828D] hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-[#F5E6DA] rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E67817] text-white rounded-lg font-semibold hover:bg-[#D66A12] transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Business Type Selection */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-[#F1F1F1] p-8"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Business Information</h2>
              <p className="text-[#5B6470] text-sm">Select your business type and enter your business name</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
                  placeholder="Eko Hotels & Suites"
                />
                {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Business Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {businessTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedBusinessType(type.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedBusinessType === type.id
                          ? 'border-gtbank-primary bg-[#FFF8F3]'
                          : 'bg-[#FFFDFC] border-[#F5E6DA] hover:border-gtbank-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{type.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{type.name}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-[#5B6470]">{type.description}</p>
                    </button>
                  ))}
                </div>
                {errors.businessType && <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(1)}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-3 border border-[#F5E6DA] text-gray-700 rounded-lg font-semibold hover:bg-[#FFF8F3] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E67817] text-white rounded-lg font-semibold hover:bg-[#D66A12] transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
