import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';

interface HallBookingAgreementProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function HallBookingAgreement({ isOpen, onClose, onAccept }: HallBookingAgreementProps) {
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Lakeview Village Hall - Booking Agreement</h2>
              <p className="text-gray-500 mt-1">Please read and accept the terms before proceeding</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Hall Booking Terms & Conditions</h3>
            
            <div className="space-y-4 text-gray-700">
              <p><strong>1.1 Booking Period:</strong> The hall is available for bookings on the following schedule:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Monday - Friday: 8:00 AM - 10:00 PM</li>
                <li>Saturday: 12:00 PM - 11:00 PM</li>
                <li>Sunday: 12:00 PM - 6:00 PM</li>
              </ul>
              
              <p><strong>1.2 Minimum Booking Requirements:</strong></p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Monday - Friday: Minimum 2 hours at £45, additional hours £12 each</li>
                <li>Saturday: Minimum 5 hours at £95, additional hours £15 each</li>
                <li>Sunday: Minimum 3 hours at £65, additional hours £15 each</li>
              </ul>
              
              <p><strong>1.3 Deposit Requirements:</strong></p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Monday - Friday: £100 deposit</li>
                <li>Saturday: £150 deposit (before 8:00 PM) or £500 deposit (8:00 PM or later)</li>
                <li>Sunday: £150 deposit</li>
              </ul>
              
              <p><strong>1.4 Capacity:</strong> Maximum capacity is 100 persons. This limit cannot be exceeded under any circumstances.</p>
              
              <p><strong>1.5 Age Restrictions:</strong> No parties for persons aged 13-20 years are permitted.</p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">2. Hirer Responsibilities</h3>
              
              <p><strong>2.1 Hall Care:</strong> The hirer is responsible for ensuring the hall is left in a clean and tidy condition.</p>
              
              <p><strong>2.2 Damage:</strong> The hirer is liable for any damage to the hall or its contents during the booking period.</p>
              
              <p><strong>2.3 Noise Control:</strong> Reasonable noise levels must be maintained, especially after 10:00 PM.</p>
              
              <p><strong>2.4 Security:</strong> The hirer must ensure the hall is securely locked when vacating the premises.</p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">3. Payment Terms</h3>
              
              <p><strong>3.1 Deposit:</strong> Deposit must be paid within 7 days of booking confirmation to secure the date.</p>
              
              <p><strong>3.2 Balance Payment:</strong> Full payment is required 14 days before the event date.</p>
              
              <p><strong>3.3 Cancellation:</strong></p>
              <ul className="list-disc ml-6 space-y-1">
                <li>More than 28 days notice: Full deposit refund</li>
                <li>14-28 days notice: 50% deposit refund</li>
                <li>Less than 14 days notice: No refund</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">4. Health & Safety</h3>
              
              <p><strong>4.1 Risk Assessment:</strong> The hirer must conduct a risk assessment for their event.</p>
              
              <p><strong>4.2 Insurance:</strong> The hirer must have appropriate public liability insurance.</p>
              
              <p><strong>4.3 Emergency Procedures:</strong> Emergency exits and procedures must be clearly communicated to all attendees.</p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">5. Prohibited Activities</h3>
              
              <p>The following are strictly prohibited:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Smoking inside the hall</li>
                <li>Use of illegal substances</li>
                <li>Activities that may cause damage to the premises</li>
                <li>Events that breach public order</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">6. Termination</h3>
              
              <p><strong>6.1 Management Rights:</strong> Lakeview Village Management reserves the right to terminate any booking that breaches these terms.</p>
              
              <p><strong>6.2 Immediate Termination:</strong> Serious breaches may result in immediate termination without refund.</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreement-checkbox"
                checked={agreementAccepted}
                onChange={(e) => setAgreementAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="agreement-checkbox" className="text-sm text-gray-700">
                <strong>I acknowledge that I have read, understood, and agree to abide by all terms and conditions outlined in the Lakeview Village Hall Booking Agreement.</strong> I understand that this agreement forms a legally binding contract and I accept all responsibilities as the hirer.
              </label>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                onClick={() => {
                  if (agreementAccepted) {
                    onAccept();
                  } else {
                    alert('Please accept the agreement terms to proceed.');
                  }
                }}
                className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                  agreementAccepted 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                whileHover={agreementAccepted ? { scale: 1.02 } : {}}
                whileTap={agreementAccepted ? { scale: 0.98 } : {}}
              >
                <CheckCircle className="w-5 h-5" />
                {agreementAccepted ? 'Accept & Continue' : 'Please Accept Terms'}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
