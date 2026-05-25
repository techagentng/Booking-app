import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer } from '../utils/animations';
import AnimatedWrapper from '../components/AnimatedWrapper';
import Navbar from '../components/Navbar';
import AnimatedSpotlight from '../components/AnimatedSpotlight';
import { ArrowRight, CheckCircle, Zap, BarChart3, Shield, Users, TrendingUp, Check, Calendar as CalendarIcon, CalendarDays, Home, Search, X, User, Mail, Phone, MessageSquare, Upload, CreditCard, Globe, FileText, Loader2, Eye, Camera, AlertTriangle, Clock, MapPin, Sparkles } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { useTranslation } from '../hooks/useTranslation';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useAppDispatch } from '../store/hooks';
import { incrementScore } from '../store';
import HallBookingCalendar from '../components/HallBookingCalendar';
import HallBookingModal from '../components/HallBookingModal';
import HallBookingAgreement from '../components/HallBookingAgreement';
import { useHallBooking } from '../hooks/useHallBooking';
import { format } from 'date-fns';

export default function Landing() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Use hall booking hook
  const hallBooking = useHallBooking({ dispatch, router, setSubmitSuccess });

  // Handle date selection - now uses real API data
  const handleDateSelect = (date: Date) => {
    console.log('Date selected in calendar:', date);
    hallBooking.handleDateSelect(date);
  };

  // Handle scroll to calendar
  const scrollToCalendar = () => {
    const calendarSection = document.getElementById('hall-calendar-section');
    if (calendarSection) {
      calendarSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSuccess = (data: any) => {
    setSubmitSuccess(true);
    setSubmitError('');
    dispatch(incrementScore());
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  const handleError = (error: any) => {
    setSubmitError(error.response?.data?.message || 'Something went wrong');
    setSubmitSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <Navbar />

      {/* Premium Hall Booking Section */}
      <AnimatedWrapper>
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-cyan-900">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
          </div>

          {/* Content Container */}
          <div className="relative z-10 container mx-auto px-4 py-12 mt-16">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  Trips Book
                </h1>
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              </div>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Experience luxury event spaces with our seamless booking system
              </p>

              {/* Feature cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <CalendarDays className="w-8 h-8 text-cyan-400 mb-3" />
                  <h3 className="text-white font-semibold mb-2">Easy Scheduling</h3>
                  <p className="text-gray-300 text-sm">Book your perfect date in seconds</p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <Users className="w-8 h-8 text-purple-400 mb-3" />
                  <h3 className="text-white font-semibold mb-2">Premium Spaces</h3>
                  <p className="text-gray-300 text-sm">Luxury venues for every occasion</p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <CreditCard className="w-8 h-8 text-emerald-400 mb-3" />
                  <h3 className="text-white font-semibold mb-2">Best Prices</h3>
                  <p className="text-gray-300 text-sm">Competitive rates with no hidden fees</p>
                </div>
              </div>
            </div>

            {/* Hall Calendar - Integrated into the premium section */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="mt-8"
            >
              <HallBookingCalendar
                selectedDate={hallBooking.selectedDate}
                setSelectedDate={hallBooking.setSelectedDate}
                onDateSelect={handleDateSelect}
              />
            </motion.div>
          </div>
        </div>
      </AnimatedWrapper>

      {/* Hero Section */}
      <AnimatedWrapper>
        <div className="relative overflow-hidden">
          <AnimatedSpotlight />
          <section className="py-20 px-4">
            <motion.div 
              className="max-w-6xl mx-auto"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={fadeInUp} className="text-center mb-16">
                <h1 
                  className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('landing.title')}
                </h1>
                <p 
                  className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('landing.subtitle')}
                </p>
                <motion.button
                  onClick={scrollToCalendar}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 mx-auto transition-all shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CalendarIcon className="w-5 h-5" />
                  Check Availability
                </motion.button>
              </motion.div>
            </motion.div>
          </section>
        </div>
      </AnimatedWrapper>

      {/* Hall Booking Modal */}
      {hallBooking.showBookingModal && (
        <HallBookingModal
          selectedDate={hallBooking.selectedDate}
          onClose={hallBooking.closeBookingModal}
          onSubmit={hallBooking.handleBookingSubmit}
        />
      )}

      {/* Hall Booking Agreement Modal */}
      <HallBookingAgreement
        isOpen={hallBooking.showAgreementModal}
        onClose={() => hallBooking.setShowAgreementModal(false)}
        onAccept={hallBooking.handleAgreementAccept}
      />

      {/* Footer */}
      <footer 
        className="py-12 px-4 border-t"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p style={{ color: 'var(--text-secondary)' }}>
              © 2025 iWe. Made in Nigeria
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-center">
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/privacy" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                Privacy
              </Link>
              <Link href="/terms" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                Terms
              </Link>
              <Link href="/contact" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
}

export async function getServerSideProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
