import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Calendar, Clock, CreditCard, MapPin, RefreshCw } from 'lucide-react';
import axios from '../../lib/axios';

type CustomerBooking = {
  id: string;
  booking_id?: string;
  service_name: string;
  provider_name?: string;
  service_type: string;
  status: string;
  booking_date?: string;
  location?: string;
  amount?: number;
  payment_status?: string;
};

const fallbackBookings: CustomerBooking[] = [
  {
    id: 'booking-1',
    booking_id: 'TB-2026-001',
    service_name: 'Eko Hotel & Suites',
    provider_name: 'Eko Hotels',
    service_type: 'Hotel',
    status: 'completed',
    booking_date: '2026-05-10',
    location: 'Victoria Island, Lagos',
    amount: 50000,
    payment_status: 'paid',
  },
  {
    id: 'booking-2',
    booking_id: 'TB-2026-002',
    service_name: 'Radisson Blu Anchorage',
    provider_name: 'Radisson Blu',
    service_type: 'Hotel',
    status: 'upcoming',
    booking_date: '2026-05-28',
    location: 'Lagos Island, Lagos',
    amount: 85000,
    payment_status: 'pending',
  },
];

const tabs = ['all', 'upcoming', 'completed', 'cancelled'];

export default function CustomerBookingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const params = activeTab === 'all' ? {} : { status: activeTab };
        const { data } = await axios.get('/customer/bookings', { params });
        setBookings(data?.data || data?.bookings || data || []);
      } catch (error) {
        setBookings(activeTab === 'all' ? fallbackBookings : fallbackBookings.filter(item => item.status === activeTab));
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [activeTab]);

  const statusClass = (status: string) => {
    if (status === 'completed') return 'bg-green-100 text-green-700';
    if (status === 'upcoming' || status === 'confirmed') return 'bg-blue-100 text-blue-700';
    if (status === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5" />
            Home
          </button>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gtbank-bg-gray flex items-center justify-center">
              <Calendar className="w-6 h-6 text-gtbank-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gtbank-secondary">My Bookings</h1>
              <p className="text-gray-600 text-sm">Your completed and upcoming booking history.</p>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-semibold capitalize whitespace-nowrap ${
                  activeTab === tab ? 'bg-gtbank-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gtbank-secondary mb-2">No bookings found</h2>
            <p className="text-gray-600 mb-5">Your customer bookings will appear here after you order or reserve a service.</p>
            <button onClick={() => router.push('/')} className="px-5 py-3 bg-gtbank-primary text-white rounded-xl font-semibold">Explore services</button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h2 className="font-bold text-gtbank-secondary">{booking.service_name}</h2>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass(booking.status)}`}>{booking.status}</span>
                    </div>
                    <p className="text-sm text-gray-500">{booking.booking_id || booking.id} • {booking.service_type}</p>
                  </div>
                  <div className="text-lg font-bold text-gtbank-secondary">₦{(booking.amount || 0).toLocaleString()}</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {booking.booking_date || 'Date pending'}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {booking.location || 'Lagos, Nigeria'}</div>
                  <div className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> {booking.payment_status || 'pending'}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200">View details</button>
                  <button onClick={() => router.push('/')} className="inline-flex items-center gap-2 px-4 py-2 bg-gtbank-primary text-white rounded-xl font-semibold hover:bg-gtbank-light-orange">
                    <RefreshCw className="w-4 h-4" />
                    Book again
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
