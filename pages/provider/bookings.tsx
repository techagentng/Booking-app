import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, CheckCircle, Clock, MessageSquare, Search, XCircle } from 'lucide-react';

const bookings = [
  {
    id: 'BK-1024',
    customerName: 'Amaka Okafor',
    service: 'Standard Room',
    date: 'Today, 2:00 PM',
    amount: 50000,
    status: 'pending',
    note: 'Late check-in requested',
  },
  {
    id: 'BK-1025',
    customerName: 'Tunde Bello',
    service: 'Airport Pickup',
    date: 'Tomorrow, 9:30 AM',
    amount: 18000,
    status: 'confirmed',
    note: 'Meet at arrivals gate',
  },
  {
    id: 'BK-1026',
    customerName: 'Sarah Johnson',
    service: 'Deluxe Room',
    date: 'Fri, 6:00 PM',
    amount: 85000,
    status: 'pending',
    note: 'Anniversary setup',
  },
];

export default function ProviderBookingsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState(bookings);

  const filteredBookings = items.filter((booking) => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesQuery = [booking.customerName, booking.service, booking.id]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const updateStatus = (bookingId: string, status: string) => {
    setItems(prev => prev.map(item => item.id === bookingId ? { ...item, status } : item));
  };

  const statusStyles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <button
            onClick={() => router.push('/provider/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to dashboard
          </button>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Provider Bookings</h1>
              <p className="text-gray-600 mt-1">Accept, decline, and manage customer booking requests.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-purple-50 rounded-xl px-4 py-3">
                <div className="text-xl font-bold text-purple-700">{items.length}</div>
                <div className="text-xs text-purple-600">Total</div>
              </div>
              <div className="bg-yellow-50 rounded-xl px-4 py-3">
                <div className="text-xl font-bold text-yellow-700">{items.filter(item => item.status === 'pending').length}</div>
                <div className="text-xs text-yellow-600">Pending</div>
              </div>
              <div className="bg-green-50 rounded-xl px-4 py-3">
                <div className="text-xl font-bold text-green-700">{items.filter(item => item.status === 'confirmed').length}</div>
                <div className="text-xs text-green-600">Confirmed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customer, booking ID, or service"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="all">All bookings</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                    {booking.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{booking.customerName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{booking.id} • {booking.service}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {booking.date}</span>
                      <span className="font-semibold text-gray-900">₦{booking.amount.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {booking.note}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {booking.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => updateStatus(booking.id, 'confirmed')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(booking.id, 'declined')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100"
                      >
                        <XCircle className="w-4 h-4" />
                        Decline
                      </button>
                    </>
                  ) : (
                    <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl">
                      <Clock className="w-4 h-4" />
                      View details
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
