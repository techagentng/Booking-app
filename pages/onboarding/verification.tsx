import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Shield, FileText, RefreshCw, Loader2 } from 'lucide-react';
import { providerAPI } from '../../lib/api/provider';

interface VerificationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  completedAt?: string;
}

const verificationSteps: VerificationStep[] = [
  {
    id: 'document-review',
    name: 'Document Review',
    description: 'Reviewing uploaded documents for authenticity',
    status: 'in-progress',
  },
  {
    id: 'business-verification',
    name: 'Business Verification',
    description: 'Verifying business registration and tax ID',
    status: 'pending',
  },
  {
    id: 'identity-verification',
    name: 'Identity Verification',
    description: 'Verifying business owner identity',
    status: 'pending',
  },
  {
    id: 'manual-review',
    name: 'Manual Review',
    description: 'Final review by our team',
    status: 'pending',
  },
];

export default function VerificationPage() {
  const router = useRouter();
  const [steps, setSteps] = useState<VerificationStep[]>(verificationSteps);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const status = await providerAPI.getVerificationStatus();
        
        // Map backend status to UI steps
        const updatedSteps = steps.map(step => {
          if (status.status === 'approved') {
            return { ...step, status: 'completed' as const, completedAt: status.reviewed_at };
          } else if (status.status === 'rejected') {
            return { ...step, status: 'failed' as const };
          } else if (status.status === 'pending') {
            // Map document status from backend if available
            if (step.id === 'document-review' && status.documents?.[0]?.status === 'approved') {
              return { ...step, status: 'completed' as const };
            }
            return { ...step, status: 'pending' as const };
          }
          return step;
        });
        
        setSteps(updatedSteps);
        
        if (status.status === 'approved') {
          setIsComplete(true);
        }
      } catch (err) {
        setError('Failed to fetch verification status');
        // Use mock data as fallback
        setSteps(verificationSteps);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerificationStatus();
    
    // Poll for status updates every 10 seconds
    const interval = setInterval(fetchVerificationStatus, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: VerificationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'in-progress':
        return <RefreshCw className="w-6 h-6 text-gtbank-primary animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: VerificationStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-gtbank-success bg-[#FFF8F3]';
      case 'in-progress':
        return 'border-gtbank-primary bg-[#FFF8F3]';
      case 'failed':
        return 'border-red-500 bg-red-50';
      default:
        return 'bg-[#FFFDFC] border-[#F5E6DA]';
    }
  };

  const handleContinue = () => {
    if (isComplete) {
      router.push('/onboarding/go-live');
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
              4
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Verification & Approval</h1>
              <p className="text-gray-600">We're verifying your information (1-3 business days)</p>
            </div>
          </div>
          
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading verification status...</span>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="w-full bg-[#FFF1E6] rounded-full h-2">
            <div className="bg-gradient-to-r from-gtbank-primary to-gtbank-secondary h-2 rounded-full" style={{ width: '80%' }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Verification Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#F1F1F1] p-8">
            <div className="flex items-center gap-4 mb-6">
              <Shield className="w-8 h-8 text-gtbank-primary" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Verification Status</h2>
                <p className="text-[#5B6470] text-sm">Track your verification progress</p>
              </div>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border-2 ${getStatusColor(step.status)}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">{getStatusIcon(step.status)}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{step.name}</h3>
                      <p className="text-sm text-[#5B6470]">{step.description}</p>
                      {step.completedAt && (
                        <p className="text-xs text-[#7A828D] mt-1">
                          Completed at {new Date(step.completedAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-[#FFF8F3] border border-[#F5E6DA] rounded-xl p-6">
            <div className="flex items-start gap-4">
              <FileText className="w-6 h-6 text-gtbank-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What happens during verification?</h3>
                <ul className="text-sm text-[#5B6470] space-y-1">
                  <li>• We review your uploaded documents for authenticity</li>
                  <li>• We verify your business registration with government records</li>
                  <li>• We perform identity verification on the business owner</li>
                  <li>• Our team conducts a final manual review</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="bg-[#FFF8F3] border border-[#F5E6DA] rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-gtbank-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Estimated Timeline</h3>
                <p className="text-sm text-[#5B6470]">
                  Verification typically takes 1-3 business days. You'll receive an email notification once your account is approved.
                </p>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end"
            >
              <button
                onClick={handleContinue}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E67817] text-white rounded-lg font-semibold hover:bg-[#D66A12] transition-all shadow-sm hover:shadow-md"
              >
                Continue to Go-Live
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </motion.div>
          )}

          {!isComplete && (
            <div className="text-center">
              <p className="text-[#5B6470] text-sm">Please wait while we verify your information...</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
