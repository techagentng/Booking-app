import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { ArrowLeft, CheckCircle, Play, BookOpen, Settings, Users, MessageSquare, Rocket, XCircle, Loader2 } from 'lucide-react';
import { providerAPI } from '../../lib/api/provider';

const trainingModules = [
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    description: 'Learn to navigate your provider dashboard',
    icon: <Settings className="w-6 h-6" />,
    duration: '5 min',
    completed: false,
  },
  {
    id: 'bookings',
    title: 'Managing Bookings',
    description: 'Accept, decline, and manage customer bookings',
    icon: <Users className="w-6 h-6" />,
    duration: '8 min',
    completed: false,
  },
  {
    id: 'services',
    title: 'Service Management',
    description: 'Update services, pricing, and availability',
    icon: <BookOpen className="w-6 h-6" />,
    duration: '7 min',
    completed: false,
  },
  {
    id: 'communication',
    title: 'Customer Communication',
    description: 'Respond to messages and reviews',
    icon: <MessageSquare className="w-6 h-6" />,
    duration: '6 min',
    completed: false,
  },
];

export default function GoLivePage() {
  const router = useRouter();
  const [modules, setModules] = useState(trainingModules);
  const [isActivated, setIsActivated] = useState(false);
  const [showTestBooking, setShowTestBooking] = useState(false);
  const [testBookingStatus, setTestBookingStatus] = useState<'not_started' | 'pending' | 'accepted' | 'declined'>('not_started');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleModule = async (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    // Optimistic update
    setModules(
      modules.map((m) =>
        m.id === moduleId ? { ...m, completed: !m.completed } : m
      )
    );

    try {
      // Call API to mark training as complete
      await providerAPI.completeTraining(moduleId);
    } catch (err) {
      // Revert on error
      setModules(
        modules.map((m) =>
          m.id === moduleId ? { ...m, completed: module.completed } : m
        )
      );
      setError('Failed to mark training as complete');
    }
  };

  const handleActivate = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await providerAPI.activateAccount();
      setIsActivated(true);
      router.push({ pathname: '/provider/login', query: { redirectTo: '/provider/dashboard' } });
    } catch (err) {
      setError('Activation failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleStartTestBooking = () => {
    setShowTestBooking(true);
    setTestBookingStatus('pending');
  };

  const handleCompleteTestBooking = (status: 'accepted' | 'declined') => {
    setTestBookingStatus(status);
  };

  const handleGoToDashboard = () => {
    router.push({ pathname: '/provider/login', query: { redirectTo: '/provider/dashboard' } });
  };

  const completedCount = modules.filter((m) => m.completed).length;
  const testBookingCompleted = testBookingStatus === 'accepted' || testBookingStatus === 'declined';
  const canActivate = completedCount === modules.length && testBookingCompleted;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
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
            <div className="w-10 h-10 bg-gtbank-primary rounded-full flex items-center justify-center text-white font-bold">
              5
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Go-Live & Training</h1>
              <p className="text-gray-600">Complete training and activate your account</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-[#FFF1E6] rounded-full h-2">
            <div className="bg-gradient-to-r from-gtbank-primary to-gtbank-secondary h-2 rounded-full" style={{ width: '100%' }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Success Card */}
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-900">Verification Complete!</h2>
                <p className="text-green-800">Your account has been successfully verified and approved</p>
              </div>
            </div>
          </div>

          {/* Training Modules */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#F1F1F1] p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Training Modules</h2>
                <p className="text-[#5B6470] text-sm">
                  {completedCount} of {modules.length} completed
                </p>
              </div>
              <div className="text-sm text-[#7A828D]">
                Total: ~26 min
              </div>
            </div>

            <div className="space-y-4">
              {modules.map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => toggleModule(module.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    module.completed
                      ? 'border-gtbank-success bg-[#FFF8F3]'
                      : 'bg-[#FFFDFC] border-[#F5E6DA] hover:border-gtbank-primary'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      module.completed ? 'bg-gtbank-success' : 'bg-[#FFD7B5]'
                    }`}>
                      {module.completed ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <div className="text-gtbank-primary">{module.icon}</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{module.title}</h3>
                      <p className="text-sm text-[#5B6470]">{module.description}</p>
                    </div>
                    <div className="text-sm text-[#7A828D]">{module.duration}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Test Booking */}
          {!isActivated && (
            <div className="bg-white rounded-2xl shadow-sm border border-[#F1F1F1] p-8">
              <div className="flex items-center gap-4 mb-6">
                <Play className="w-8 h-8 text-gtbank-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Test Booking Simulation</h2>
                  <p className="text-[#5B6470] text-sm">Practice with a simulated booking before going live</p>
                </div>
              </div>

              {!showTestBooking ? (
                <button
                  onClick={handleStartTestBooking}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 border-2 border-gtbank-primary text-gtbank-secondary rounded-xl font-semibold hover:bg-[#FFF8F3] transition-all"
                >
                  <Play className="w-5 h-5" />
                  Start Test Booking
                </button>
              ) : (
                <div className="border-2 border-[#F5E6DA] rounded-xl p-5 bg-[#FFFDFC]">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gtbank-secondary mb-1">Incoming test booking</p>
                      <h3 className="text-lg font-semibold text-gray-900">Standard Room</h3>
                      <p className="text-sm text-[#5B6470]">Test Guest • test.guest@example.com • +234 800 000 0000</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      testBookingStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : testBookingStatus === 'accepted'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {testBookingStatus === 'pending' ? 'Pending' : testBookingStatus === 'accepted' ? 'Accepted' : 'Declined'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-sm">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-[#7A828D]">Date</p>
                      <p className="font-medium text-gray-900">Tomorrow, 2:00 PM</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-[#7A828D]">Guests</p>
                      <p className="font-medium text-gray-900">2 guests</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-[#7A828D]">Total</p>
                      <p className="font-medium text-gray-900">₦50,000</p>
                    </div>
                  </div>

                  {testBookingStatus === 'pending' ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleCompleteTestBooking('accepted')}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Accept Test Booking
                      </button>
                      <button
                        onClick={() => handleCompleteTestBooking('declined')}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-white text-red-600 border border-red-200 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                        Decline Test Booking
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gtbank-success bg-[#FFF8F3] border border-gtbank-success rounded-lg p-3">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Great! You completed the test booking simulation.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Activation Button */}
          {!isActivated ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-gtbank-primary to-gtbank-secondary rounded-2xl shadow-lg p-8 text-center"
            >
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              <Rocket className="w-12 h-12 text-white mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Ready to Go Live?</h2>
              <p className="text-gtbank-light-orange mb-6">
                Complete training and the test booking simulation to activate your account
              </p>
              <button
                onClick={handleActivate}
                disabled={!canActivate || isLoading}
                className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${
                  canActivate && !isLoading
                    ? 'bg-[#E67817] text-white hover:bg-[#D66A12] shadow-sm hover:shadow-md'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Activate My Account
                  </>
                )}
              </button>
              {!canActivate && (
                <p className="text-gtbank-light-orange text-sm mt-3">
                  Complete all training modules and the test booking simulation to activate
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-8 text-center"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">You're Live! 🎉</h2>
              <p className="text-green-100 mb-6">
                Your account is now active and ready to receive bookings
              </p>
              <button
                onClick={handleGoToDashboard}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-600 rounded-xl font-semibold hover:bg-gray-100 transition-all"
              >
                Go to Dashboard
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </motion.div>
          )}

          {/* Support Info */}
          <div className="bg-[#FFFDFC] border border-[#F5E6DA] rounded-xl p-6">
            <div className="flex items-center gap-4">
              <MessageSquare className="w-6 h-6 text-[#7A828D]" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Need Help?</h3>
                <p className="text-sm text-gray-600">
                  Contact our support team at support@tripsbook.com or call +234 800 000 0000
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
