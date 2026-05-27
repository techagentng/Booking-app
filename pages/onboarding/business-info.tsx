import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { ArrowLeft, ArrowRight, MapPin, Phone, Mail, Globe, Upload, FileText, CheckCircle, X, Loader2 } from 'lucide-react';
import { providerAPI } from '../../lib/api/provider';

export default function BusinessInfoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: '',
    businessPhone: '',
    businessEmail: '',
    website: '',
    description: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.businessPhone) newErrors.businessPhone = 'Business phone is required';
    if (!formData.businessEmail) newErrors.businessEmail = 'Business email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.businessEmail)) newErrors.businessEmail = 'Invalid email format';
    if (!formData.description) newErrors.description = 'Business description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);
      setError('');
      
      try {
        // Get stored registration data
        const storedData = localStorage.getItem('provider_onboarding_data');
        const onboardingData = storedData ? JSON.parse(storedData) : {};
        
        await providerAPI.updateBusinessInfo({
          business_name: onboardingData.businessName || '',
          business_type: onboardingData.businessType || '',
          phone: formData.businessPhone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          description: formData.description,
        });
        
        // Store business info for next steps
        localStorage.setItem('provider_business_info', JSON.stringify(formData));
        
        router.push('/onboarding/services');
      } catch (err) {
        setError('Failed to save business information. Please try again.');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-gtbank-primary rounded-full flex items-center justify-center text-white font-bold">
              2
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Information</h1>
              <p className="text-gray-600">Provide your business details and upload required documents</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-[#FFF1E6] rounded-full h-2">
            <div className="bg-gradient-to-r from-gtbank-primary to-gtbank-secondary h-2 rounded-full" style={{ width: '40%' }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#F1F1F1] p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Information</h2>
              <p className="text-[#5B6470] text-sm">Where customers can reach your business</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7A828D] w-5 h-5" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-[#F5E6DA] rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
                    placeholder="123 Victoria Island"
                  />
                </div>
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[#F5E6DA] rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
                    placeholder="Lagos"
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[#F5E6DA] rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
                    placeholder="Lagos State"
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[#F5E6DA] rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
                    placeholder="101241"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7A828D] w-5 h-5" />
                    <input
                      type="tel"
                      name="businessPhone"
                      value={formData.businessPhone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-[#F5E6DA] rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                  {errors.businessPhone && <p className="text-red-500 text-sm mt-1">{errors.businessPhone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7A828D] w-5 h-5" />
                    <input
                      type="email"
                      name="businessEmail"
                      value={formData.businessEmail}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-[#F5E6DA] rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
                      placeholder="info@eko-hotels.com"
                    />
                  </div>
                  {errors.businessEmail && <p className="text-red-500 text-sm mt-1">{errors.businessEmail}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website (Optional)</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7A828D] w-5 h-5" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-[#F5E6DA] rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
                    placeholder="https://eko-hotels.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#F1F1F1] p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Business Description</h2>
              <p className="text-[#5B6470] text-sm">Tell customers about your business</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-[#F5E6DA] rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent resize-none"
                placeholder="Describe your business, what you offer, and what makes you unique..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Document Upload */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#F1F1F1] p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Document Upload</h2>
              <p className="text-[#5B6470] text-sm">Upload required documents for verification</p>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#F5E6DA] rounded-xl p-8 text-center hover:border-gtbank-primary transition-colors">
                <Upload className="w-12 h-12 text-[#7A828D] mx-auto mb-4" />
                <p className="text-[#5B6470] mb-2">Drag and drop files here, or click to select</p>
                <p className="text-[#7A828D] text-sm">PDF, JPG, PNG up to 10MB each</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block mt-4 px-4 py-2 bg-[#E67817] text-white rounded-lg hover:bg-[#D66A12] cursor-pointer"
                >
                  Select Files
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#FFFDFC] rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#7A828D]" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-700">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-[#FFF8F3] border border-[#F5E6DA] rounded-lg p-4">
                <p className="text-sm text-[#5B6470]">
                  <strong>Required Documents:</strong> Business registration certificate, Tax identification number, Proof of address, and Identity document of business owner.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            {error && (
              <div className="flex-1 mr-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                onClick={() => router.back()}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-3 border border-[#F5E6DA] text-gray-700 rounded-lg font-semibold hover:bg-[#FFF8F3] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E67817] text-white rounded-lg font-semibold hover:bg-[#D66A12] transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
