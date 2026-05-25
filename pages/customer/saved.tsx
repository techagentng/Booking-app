import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Heart, MapPin, Star, Trash2, Calendar } from 'lucide-react';
import axios from '../../lib/axios';

type SavedService = {
  id: string;
  service_id?: string;
  provider_id?: string;
  service_name: string;
  service_type: string;
  image_url?: string;
  location?: string;
  price?: number;
  rating?: number;
  created_at?: string;
};

const fallbackSaved: SavedService[] = [
  {
    id: 'saved-1',
    service_id: 'svc_1',
    service_name: 'Eko Hotel & Suites',
    service_type: 'Hotel',
    image_url: '/hotel1.jpg',
    location: 'Victoria Island, Lagos',
    price: 50000,
    rating: 4.8,
  },
  {
    id: 'saved-2',
    service_id: 'svc_2',
    service_name: 'Jevinik Restaurant',
    service_type: 'Restaurant',
    image_url: '/restaurant1.jpg',
    location: 'Ikeja, Lagos',
    price: 12000,
    rating: 4.6,
  },
];

export default function CustomerSavedPage() {
  const router = useRouter();
  const [savedServices, setSavedServices] = useState<SavedService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const { data } = await axios.get('/customer/saved');
        setSavedServices(data?.data || data?.saved_services || data || []);
      } catch (error) {
        setSavedServices(fallbackSaved);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, []);

  const removeSaved = async (savedId: string) => {
    setSavedServices(prev => prev.filter(item => item.id !== savedId));
    try {
      await axios.delete(`/customer/saved/${savedId}`);
    } catch (error) {
      console.warn('Could not remove saved service yet:', error);
    }
  };

  const bookService = (service: SavedService) => {
    const roomType = service.service_type?.toLowerCase() === 'hotel' ? 'standard' : undefined;
    router.push({
      pathname: '/bookings/new',
      query: {
        serviceId: service.service_id || service.id,
        serviceName: service.service_name,
        serviceType: service.service_type,
        ...(roomType ? { roomType } : {})
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5" />
            Home
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
              <Heart className="w-6 h-6 text-gtbank-orange fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gtbank-navy">Saved Services</h1>
              <p className="text-gray-600 text-sm">Your customer identity keeps your favorite services in one place.</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500">Loading saved services...</div>
        ) : savedServices.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gtbank-navy mb-2">No saved services yet</h2>
            <p className="text-gray-600 mb-5">Save hotels, restaurants, transport, and experiences to find them quickly later.</p>
            <button onClick={() => router.push('/')} className="px-5 py-3 bg-gtbank-orange text-white rounded-xl font-semibold">Explore services</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedServices.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-orange-100 to-blue-100">
                  {service.image_url && <img src={service.image_url} alt={service.service_name} className="w-full h-full object-cover" />}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h2 className="font-bold text-gtbank-navy">{service.service_name}</h2>
                      <p className="text-sm text-gtbank-orange font-medium">{service.service_type}</p>
                    </div>
                    <button onClick={() => removeSaved(service.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {service.location || 'Lagos, Nigeria'}</div>
                    <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500 fill-current" /> {service.rating || 4.7}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-gtbank-navy">₦{(service.price || 0).toLocaleString()}</div>
                    <button onClick={() => bookService(service)} className="inline-flex items-center gap-2 px-4 py-2 bg-gtbank-orange text-white rounded-xl font-semibold hover:bg-gtbank-orange-dark">
                      <Calendar className="w-4 h-4" />
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
