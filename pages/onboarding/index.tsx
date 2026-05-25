import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { CheckCircle, Circle, ArrowRight, Clock, User, Building, Settings, Shield, Rocket } from 'lucide-react';

interface Phase {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: string;
  icon: React.ReactNode;
  status: 'pending' | 'in-progress' | 'completed';
}

const phases: Phase[] = [
  {
    id: 'registration',
    number: 1,
    title: 'Registration',
    description: 'Account creation with business type selection and email verification',
    duration: '5-10 min',
    icon: <User className="w-6 h-6" />,
    status: 'pending',
  },
  {
    id: 'business-info',
    number: 2,
    title: 'Business Information',
    description: 'Basic business details, contact info, and document upload',
    duration: '10-15 min',
    icon: <Building className="w-6 h-6" />,
    status: 'pending',
  },
  {
    id: 'services',
    number: 3,
    title: 'Service Setup',
    description: 'Category selection, service creation, and pricing configuration',
    duration: '15-20 min',
    icon: <Settings className="w-6 h-6" />,
    status: 'pending',
  },
  {
    id: 'verification',
    number: 4,
    title: 'Verification & Approval',
    description: 'Automated checks and manual admin review',
    duration: '1-3 business days',
    icon: <Shield className="w-6 h-6" />,
    status: 'pending',
  },
  {
    id: 'go-live',
    number: 5,
    title: 'Go-Live & Training',
    description: 'Account activation and platform training',
    duration: '30 min',
    icon: <Rocket className="w-6 h-6" />,
    status: 'pending',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentPhase, setCurrentPhase] = useState(1);
  const [completedPhases, setCompletedPhases] = useState<number[]>([]);

  const handlePhaseClick = (phaseId: string, phaseNumber: number) => {
    if (phaseNumber === currentPhase || phaseNumber < currentPhase) {
      router.push(`/onboarding/${phaseId}`);
    }
  };

  const handleStartOnboarding = () => {
    router.push('/onboarding/registration');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Provider Onboarding</h1>
          <p className="text-lg text-gray-600">
            Complete these 5 simple steps to get your business live on our platform
          </p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Onboarding Progress</h2>
            <div className="text-sm text-gray-600">
              {completedPhases.length} of {phases.length} completed
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedPhases.length / phases.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full"
            />
          </div>

          {/* Phases List */}
          <div className="space-y-4">
            {phases.map((phase, index) => {
              const isCompleted = completedPhases.includes(phase.number);
              const isCurrent = phase.number === currentPhase;
              const isPending = phase.number > currentPhase;

              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handlePhaseClick(phase.id, phase.number)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-green-50 border-green-200'
                      : isCurrent
                      ? 'bg-purple-50 border-purple-300'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                        <Circle className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <Circle className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Phase Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{phase.title}</h3>
                      {isCurrent && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{phase.duration}</span>
                    </div>
                  </div>

                  {/* Action Icon */}
                  {(isCurrent || isCompleted) && (
                    <div className="flex-shrink-0">
                      {isCurrent ? (
                        <ArrowRight className="w-6 h-6 text-purple-600" />
                      ) : (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Start Button */}
        {currentPhase === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <button
              onClick={handleStartOnboarding}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Start Onboarding
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
