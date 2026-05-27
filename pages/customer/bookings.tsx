import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Calendar, Clock, CreditCard, MapPin, RefreshCw, Home, Search, Heart, User } from 'lucide-react';
import { customerAPI } from '../../lib/api/customer';

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
        const data = await customerAPI.getBookings(activeTab === 'all' ? undefined : activeTab);
        setBookings(data);
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gtbank-primary to-gtbank-secondary rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bookings</h1>
                <p className="text-xs text-gray-600">Your booking history</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-2">
          <div className="flex gap-2 overflow-x-auto">
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

      <main className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-700">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gtbank-secondary mb-2">No bookings found</h2>
            <p className="text-gray-600 mb-5">Your customer bookings will appear here after you order or reserve a service.</p>
            <button onClick={() => router.push('/')} className="px-5 py-3 bg-gtbank-primary text-white rounded-xl font-semibold">Explore services</button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex flex-col items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="font-bold text-gray-900 text-sm">{booking.service_name}</h2>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass(booking.status)}`}>{booking.status}</span>
                    </div>
                    <p className="text-xs text-gray-600">{booking.booking_id || booking.id} • {booking.service_type}</p>
                  </div>
                  <div className="text-base font-bold text-gray-900">₦{(booking.amount || 0).toLocaleString()}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-3">
                  <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {booking.booking_date || 'Date pending'}</div>
                  <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {booking.location || 'Lagos, Nigeria'}</div>
                  <div className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> {booking.payment_status || 'pending'}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">View details</button>
                  <button onClick={() => router.push('/')} className="inline-flex items-center gap-1 px-3 py-2 bg-gtbank-primary text-white rounded-lg text-sm font-semibold hover:bg-gtbank-light-orange">
                    <RefreshCw className="w-3 h-3" />
                    Book again
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-lg mx-auto px-4 py-2">
          <div className="flex justify-around">
            <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 p-2 text-gray-600">
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </button>
            <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 p-2 text-gray-600">
              <Search className="w-5 h-5" />
              <span className="text-xs">Search</span>
            </button>
            <button onClick={() => router.push('/customer/saved')} className="flex flex-col items-center gap-1 p-2 text-gray-600">
              <Heart className="w-5 h-5" />
              <span className="text-xs">Saved</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 text-gtbank-primary">
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-medium">Bookings</span>
            </button>
            <button onClick={() => router.push('/customer/profile')} className="flex flex-col items-center gap-1 p-2 text-gray-600">
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
