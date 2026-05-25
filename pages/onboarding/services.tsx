import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { ArrowLeft, ArrowRight, Plus, Trash2, Clock, DollarSign, CheckCircle, X } from 'lucide-react';

const categories = [
  { id: 'accommodation', name: 'Accommodation', icon: '🏨' },
  { id: 'dining', name: 'Dining', icon: '🍽️' },
  { id: 'transport', name: 'Transport', icon: '🚗' },
  { id: 'wellness', name: 'Wellness', icon: '💆' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎪' },
  { id: 'business', name: 'Business', icon: '💼' },
];

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: string;
  availability: string[];
}

export default function ServicesPage() {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: '',
      category: '',
      description: '',
      price: 0,
      duration: '',
      availability: [],
    },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const addService = () => {
    setServices([
      ...services,
      {
        id: Date.now().toString(),
        name: '',
        category: '',
        description: '',
        price: 0,
        duration: '',
        availability: [],
      },
    ]);
  };

  const removeService = (serviceId: string) => {
    setServices(services.filter((s) => s.id !== serviceId));
  };

  const updateService = (serviceId: string, field: keyof Service, value: any) => {
    setServices(
      services.map((s) => (s.id === serviceId ? { ...s, [field]: value } : s))
    );
  };

  const toggleAvailability = (serviceId: string, day: string) => {
    setServices(
      services.map((s) => {
        if (s.id === serviceId) {
          const availability = s.availability.includes(day)
            ? s.availability.filter((d) => d !== day)
            : [...s.availability, day];
          return { ...s, availability };
        }
        return s;
      })
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (selectedCategories.length === 0) {
      newErrors.categories = 'Please select at least one category';
    }

    services.forEach((service, index) => {
      if (!service.name) newErrors[`service-${index}-name`] = 'Service name is required';
      if (!service.category) newErrors[`service-${index}-category`] = 'Category is required';
      if (!service.description) newErrors[`service-${index}-description`] = 'Description is required';
      if (!service.price || service.price <= 0) newErrors[`service-${index}-price`] = 'Price is required';
      if (!service.duration) newErrors[`service-${index}-duration`] = 'Duration is required';
      if (service.availability.length === 0) {
        newErrors[`service-${index}-availability`] = 'Please select availability days';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      router.push('/onboarding/verification');
    }
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            <div className="w-10 h-10 bg-gtbank-orange rounded-full flex items-center justify-center text-white font-bold">
              3
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Service Setup</h1>
              <p className="text-gray-600">Add your services and configure pricing</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-gtbank-orange to-gtbank-navy h-2 rounded-full" style={{ width: '60%' }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Category Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Categories</h2>
              <p className="text-gray-600 text-sm">Choose the categories that best describe your services</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    selectedCategories.includes(category.id)
                      ? 'border-gtbank-orange bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <div className="font-medium text-gray-900">{category.name}</div>
                  {selectedCategories.includes(category.id) && (
                    <CheckCircle className="w-5 h-5 text-gtbank-orange mx-auto mt-2" />
                  )}
                </button>
              ))}
            </div>
            {errors.categories && <p className="text-red-500 text-sm mt-4">{errors.categories}</p>}
          </div>

          {/* Services */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Add Services</h2>
              <p className="text-gray-600 text-sm">Create the services you want to offer</p>
            </div>

            <div className="space-y-6">
              {services.map((service, index) => (
                <div key={service.id} className="border-2 border-gray-200 rounded-xl p-6 relative">
                  {services.length > 1 && (
                    <button
                      onClick={() => removeService(service.id)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => updateService(service.id, 'name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gtbank-orange focus:border-transparent"
                        placeholder="e.g., Standard Room, Airport Transfer"
                      />
                      {errors[`service-${index}-name`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`service-${index}-name`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={service.category}
                        onChange={(e) => updateService(service.id, 'category', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gtbank-orange focus:border-transparent"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {errors[`service-${index}-category`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`service-${index}-category`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={service.description}
                        onChange={(e) => updateService(service.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gtbank-orange focus:border-transparent resize-none"
                        placeholder="Describe what this service includes..."
                      />
                      {errors[`service-${index}-description`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`service-${index}-description`]}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="number"
                            value={service.price}
                            onChange={(e) => updateService(service.id, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gtbank-orange focus:border-transparent"
                            placeholder="0"
                          />
                        </div>
                        {errors[`service-${index}-price`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`service-${index}-price`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={service.duration}
                            onChange={(e) => updateService(service.id, 'duration', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gtbank-orange focus:border-transparent"
                            placeholder="e.g., 1 hour, 1 night, 30 min"
                          />
                        </div>
                        {errors[`service-${index}-duration`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`service-${index}-duration`]}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                      <div className="flex gap-2 flex-wrap">
                        {days.map((day) => (
                          <button
                            key={day}
                            onClick={() => toggleAvailability(service.id, day)}
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${
                              service.availability.includes(day)
                                ? 'border-gtbank-orange bg-orange-50 text-gtbank-navy'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                      {errors[`service-${index}-availability`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`service-${index}-availability`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addService}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-700 rounded-lg hover:border-gtbank-orange hover:text-gtbank-orange transition-all w-full justify-center"
            >
              <Plus className="w-5 h-5" />
              Add Another Service
            </button>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gtbank-orange to-gtbank-navy text-white rounded-lg font-semibold hover:from-gtbank-orange-dark hover:to-gtbank-navy-dark transition-all"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
