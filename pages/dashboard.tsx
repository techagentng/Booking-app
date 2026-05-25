import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { LayoutDashboard, Bed, Calendar, Settings, LogOut, X, AlertTriangle, FileWarning, Building2, ArrowRight, Users, CreditCard, ShieldCheck, BarChart3, MessageSquare, Tags, Wallet, Star, ClipboardList } from "lucide-react";
import dynamic from 'next/dynamic';
import { useGetDashboardStats, useGetRecentActivity, RecentBooking, GuestPreference } from "../hooks/useReservations";
import { useNotifications } from "../contexts/NotificationContext";
import Link from "next/link";
import { useAppSelector } from "../store/hooks";
import { useAdminBookingStats } from "../hooks/useAdminBookings";
import StatisticsDashboard from "../components/admin/StatisticsDashboard";
import HallBookingRightSection from "../components/HallBookingRightSection";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const adminKpis = [
  { label: 'Total Providers', value: '248', change: '+18 this month', icon: Building2, color: 'bg-gtbank-bg-gray text-gtbank-secondary' },
  { label: 'Active Bookings', value: '1,284', change: '+12.5% vs last week', icon: Calendar, color: 'bg-gtbank-bg-gray text-gtbank-secondary' },
  { label: 'Platform Revenue', value: '₦42.8M', change: '+8.2% growth', icon: CreditCard, color: 'bg-green-100 text-green-700' },
  { label: 'Open Disputes', value: '16', change: '7 urgent', icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
];

const adminFunctions = [
  {
    title: 'Provider Approvals',
    description: 'Verify businesses, review documents, approve onboarding, and manage provider status.',
    href: '/admin/providers',
    icon: ShieldCheck,
    badge: '12 pending',
    color: 'from-gtbank-primary to-gtbank-secondary',
  },
  {
    title: 'All Bookings',
    description: 'Monitor platform bookings, investigate flagged reservations, and support customer changes.',
    href: '/admin/bookings',
    icon: ClipboardList,
    badge: '86 today',
    color: 'from-gtbank-secondary to-gtbank-soft-blue',
  },
  {
    title: 'Service Catalog',
    description: 'Manage categories, moderate listings, control featured and nearby service visibility.',
    href: '/admin/services',
    icon: Tags,
    badge: '34 live',
    color: 'from-emerald-600 to-teal-600',
  },
  {
    title: 'Payments & Payouts',
    description: 'Track collections, refunds, commissions, payout queues, and finance reconciliation.',
    href: '/dashboard',
    icon: Wallet,
    badge: '₦8.4M due',
    color: 'from-green-600 to-lime-600',
  },
  {
    title: 'Customers & Support',
    description: 'Review customer activity, support requests, complaints, and account risk signals.',
    href: '/guests',
    icon: Users,
    badge: '24 tickets',
    color: 'from-orange-500 to-amber-600',
  },
  {
    title: 'Reviews & Quality',
    description: 'Moderate reviews, watch low ratings, and identify service quality issues.',
    href: '/dashboard',
    icon: Star,
    badge: '4 flagged',
    color: 'from-pink-600 to-rose-600',
  },
  {
    title: 'Dispute Center',
    description: 'Resolve booking, refund, payment, and delivery disputes between customers and providers.',
    href: '/dashboard',
    icon: MessageSquare,
    badge: '16 open',
    color: 'from-red-600 to-orange-600',
  },
  {
    title: 'Reports & Settings',
    description: 'Export analytics, configure platform policies, permissions, commissions, and audit logs.',
    href: '/settings',
    icon: BarChart3,
    badge: 'Admin',
    color: 'from-slate-700 to-gray-900',
  },
];

const operationsQueue = [
  { title: 'Provider document review', owner: 'Verification team', status: 'High priority', count: 12 },
  { title: 'Refund requests awaiting decision', owner: 'Finance team', status: 'Due today', count: 8 },
  { title: 'Customer complaints unresolved', owner: 'Support team', status: 'SLA watch', count: 24 },
  { title: 'Services pending moderation', owner: 'Marketplace team', status: 'Review', count: 19 },
];


export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Get flagged bookings score and data from Redux
  const flaggedScore = useAppSelector((state) => state.score.count);
  const flaggedBookings = useAppSelector((state) => state.score.flaggedBookings || []);
  console.log('Dashboard - Flagged Score from Redux:', flaggedScore);
  
  // Modal state for flagged bookings
  const [showFlaggedModal, setShowFlaggedModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Fetch dashboard stats
  const { data: dashboardStats } = useGetDashboardStats();

  // Fetch admin booking statistics
  const { data: statsData, isLoading: statsLoading } = useAdminBookingStats();
  const statistics = statsData;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 font-sans relative">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto pr-96">
        {/* Top Header */}
        <Header title="DASHBOARD" />

        <section className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-semibold text-gtbank-primary uppercase tracking-wide">General Admin Command Center</p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">Platform Operations Overview</h1>
              <p className="text-gray-600 mt-2">
                Control providers, bookings, customers, services, payments, disputes, reports, and marketplace quality from one dashboard.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/admin/providers')}
                className="inline-flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800"
              >
                <ShieldCheck className="w-5 h-5" />
                Review Providers
              </button>
              <button
                onClick={() => router.push('/admin/bookings')}
                className="inline-flex items-center gap-2 px-4 py-3 bg-white text-gray-800 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50"
              >
                <ClipboardList className="w-5 h-5" />
                View Bookings
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {adminKpis.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                      {item.change}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{item.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{item.label}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Admin Functions</h2>
              <p className="text-gray-600 text-sm mt-1">Fast access to the main operational areas of the platform.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {adminFunctions.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  onClick={() => router.push(item.href)}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-left hover:-translate-y-1 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} text-white flex items-center justify-center shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-gtbank-secondary">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{item.description}</p>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-gtbank-primary">
                    Open module
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-10 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Operations Queue</h2>
                <p className="text-sm text-gray-600 mt-1">Work that needs admin attention across the platform.</p>
              </div>
              <button className="text-sm font-semibold text-gtbank-primary hover:text-gtbank-secondary">View all</button>
            </div>
            <div className="space-y-3">
              {operationsQueue.map((item) => (
                <div key={item.title} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.owner}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                    <div className="text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded-full">{item.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl shadow-sm p-6 text-white">
            <h2 className="text-xl font-bold mb-2">Admin Priorities</h2>
            <p className="text-gray-300 text-sm mb-6">Recommended focus for today.</p>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/10">
                <div className="font-semibold">Approve verified providers</div>
                <div className="text-sm text-gray-300 mt-1">Move ready businesses from onboarding to live marketplace.</div>
              </div>
              <div className="p-4 rounded-xl bg-white/10">
                <div className="font-semibold">Resolve payment exceptions</div>
                <div className="text-sm text-gray-300 mt-1">Review failed settlements, refund requests, and payout holds.</div>
              </div>
              <div className="p-4 rounded-xl bg-white/10">
                <div className="font-semibold">Improve marketplace quality</div>
                <div className="text-sm text-gray-300 mt-1">Moderate low-rated services, reviews, and flagged listings.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="bg-gradient-to-r from-gtbank-primary to-gtbank-secondary rounded-2xl shadow-lg p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Provider workspace</h2>
                <p className="text-gtbank-light-orange mt-1">
                  Manage provider bookings, services, revenue, reviews, and onboarding from the new provider dashboard.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/provider/dashboard')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-gtbank-secondary rounded-xl font-semibold hover:bg-gtbank-bg-gray transition-colors"
            >
              Open Provider Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Hall Booking Statistics - TESTING */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Hall Booking Statistics</h2>
          <StatisticsDashboard statistics={statistics} loading={statsLoading} />
        </section>


      </main>

      {/* Right Sidebar */}
      <aside className="fixed right-0 top-0 w-80 h-screen bg-white shadow-xl overflow-y-auto z-40">
        <div className="p-6">
          <HallBookingRightSection />
        </div>
      </aside>

      {/* Flagged Bookings Modal */}
      {showFlaggedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gtbank-secondary to-gtbank-navy px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Flagged Bookings</h2>
              </div>
              <button 
                onClick={() => setShowFlaggedModal(false)}
                className="text-white hover:bg-gtbank-primary rounded-full p-1 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {flaggedBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gtbank-bg-gray rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileWarning className="w-8 h-8 text-gtbank-primary" />
                  </div>
                  <p className="text-gray-500 text-lg">No flagged bookings</p>
                  <p className="text-gray-400 text-sm mt-1">All bookings appear to be legitimate</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-4">
                    The following {flaggedBookings.length} guest(s) have been flagged for suspicious ID documents:
                  </p>
                  {flaggedBookings.map((booking, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-4 bg-gtbank-bg-gray border border-gtbank-border-gray rounded-xl hover:bg-gtbank-bg-gray transition-colors"
                    >
                      <div className="w-12 h-12 bg-gtbank-light-orange rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gtbank-secondary font-bold text-lg">
                          {booking.guestName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{booking.guestName}</p>
                        <p className="text-xs text-gray-500 truncate">File: {booking.fileName}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(booking.timestamp).toLocaleString()}
                        </p>
                        <p className="text-sm text-gtbank-primary font-medium">⚠️ Low face match score detected</p>
                      </div>
                      <span className="text-xs bg-gtbank-primary text-white px-2 py-1 rounded-full">
                        #{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gtbank-bg-gray border-t border-gtbank-border-gray flex justify-end gap-3">
              <button
                onClick={() => setShowFlaggedModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gtbank-bg-gray rounded-lg transition-colors"
              >
                Close
              </button>
              {flaggedBookings.length > 0 && (
                <button
                  className="px-4 py-2 bg-gtbank-primary text-white rounded-lg hover:bg-gtbank-light-orange transition-colors"
                  onClick={() => {
                    // Could navigate to a detailed review page
                    setShowFlaggedModal(false);
                  }}
                >
                  Review All
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ 
  icon, 
  label, 
  active 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean 
}) {
  return (
    <a
      href="#"
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? "bg-blue-50 text-blue-600"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </a>
  );
}

function StatCard({ title, value, percent, green, red, orange, blue, purple, onClick }: any) {
  const color = green ? "text-green-500" : red ? "text-red-500" : orange ? "text-orange-500" : blue ? "text-blue-500" : purple ? "text-purple-500" : "text-yellow-500";

  return (
    <div 
      className={`bg-white p-6 rounded-xl shadow flex flex-col ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <div className="flex justify-between items-center mt-2">
        <span className="text-3xl font-bold">{value}</span>
        {percent && <span className={`${color} text-xl font-bold`}>{percent}%</span>}
        {green && <span className="text-green-500 text-2xl">⬤</span>}
        {red && <span className="text-red-500 text-2xl">⬤</span>}
        {orange && <span className="text-orange-500 text-2xl">⬤</span>}
        {blue && <span className="text-blue-500 text-2xl">⬤</span>}
        {purple && <span className="text-purple-500 text-2xl">⬤</span>}
      </div>
    </div>
  );
}

function RoomBar({ title, value, max }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="text-sm font-medium text-gray-500 mb-3">{title}</h3>
      <div className="w-full h-3 bg-gray-200 rounded-full mb-3">
        <div
          className="h-3 bg-yellow-500 rounded-full"
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function RightSection() {
  const { data: recentActivity, isLoading, refetch } = useGetRecentActivity();
  const { notifications } = useNotifications();

  // Auto-refresh when new booking or guest notification arrives
  useEffect(() => {
    const latestNotification = notifications[0];
    if (
      latestNotification?.type === 'new_booking' ||
      latestNotification?.type === 'new_guest' ||
      latestNotification?.type === 'check_in' ||
      latestNotification?.type === 'check_out'
    ) {
      refetch();
    }
  }, [notifications, refetch]);

  if (isLoading) {
    return (
      <div className="space-y-10">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const recentBookings = recentActivity?.recent_bookings || [];
  const guestPreferences = recentActivity?.guest_preferences || [];

  return (
    <div className="space-y-10">
      {/* Newest Booking */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">Newest Bookings</h2>
          <Link href="/bookings" className="text-sm text-gtbank-primary hover:text-gtbank-secondary">
            See more
          </Link>
        </div>
        {recentBookings.length > 0 ? (
          recentBookings.slice(0, 5).map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No recent bookings</p>
          </div>
        )}
      </section>

      {/* Guest Preferences */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">Guest Preferences</h2>
          <Link href="/guesthistory" className="text-sm text-gtbank-primary hover:text-gtbank-secondary">
            See more
          </Link>
        </div>
        {guestPreferences.length > 0 ? (
          guestPreferences.slice(0, 3).map((pref) => (
            <PreferenceCard key={pref.guest_id} preference={pref} />
          ))
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <Settings className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No guest preferences</p>
          </div>
        )}
      </section>
    </div>
  );
}

function BookingCard({ booking }: { booking: RecentBooking }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'checked-in':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg mb-3 border-l-4 border-gtbank-primary">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-xs text-gray-500">{formatDate(booking.date || booking.check_in)}</p>
          <p className="font-semibold text-gray-900">{booking.guest_name}</p>
          <p className="text-sm text-gray-600">
            Room {booking.room_number} · {booking.room_type}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
          </p>
        </div>
        <div className="text-right">
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
          <p className="text-sm font-semibold text-green-600 mt-2">
            ₦{booking.total_amount?.toLocaleString() || '0'}
          </p>
        </div>
      </div>
    </div>
  );
}

function PreferenceCard({ preference }: { preference: GuestPreference }) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg mb-3 border-l-4 border-gtbank-primary">
      <p className="font-semibold text-gray-900">{preference.guest_name}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {preference.room_types?.slice(0, 2).map((type, idx) => (
          <span key={`room-${idx}`} className="px-2 py-0.5 bg-gtbank-bg-gray text-gtbank-secondary text-xs rounded">
            {type}
          </span>
        ))}
        {preference.meal_types?.slice(0, 2).map((meal, idx) => (
          <span key={`meal-${idx}`} className="px-2 py-0.5 bg-gtbank-bg-gray text-gtbank-secondary text-xs rounded">
            {meal}
          </span>
        ))}
        {preference.special_requests?.slice(0, 2).map((req, idx) => (
          <span key={`req-${idx}`} className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
            {req}
          </span>
        ))}
      </div>
      {preference.room_floors && preference.room_floors.length > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          Floor preference: {preference.room_floors.join(', ')}
        </p>
      )}
    </div>
  );
}
