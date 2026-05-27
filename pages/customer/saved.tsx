import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Heart, MapPin, Star, Trash2, Calendar, Home, Search, User } from 'lucide-react';
import { customerAPI } from '../../lib/api/customer';

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
        const data = await customerAPI.getSaved();
        setSavedServices(data);
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
      await customerAPI.removeSaved(savedId);
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gtbank-primary to-gtbank-secondary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Saved</h1>
                <p className="text-xs text-gray-600">Your favorite services</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-700">Loading saved services...</div>
        ) : savedServices.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gtbank-secondary mb-2">No saved services yet</h2>
            <p className="text-gray-600 mb-5">Save hotels, restaurants, transport, and experiences to find them quickly later.</p>
            <button onClick={() => router.push('/')} className="px-5 py-3 bg-gtbank-primary text-white rounded-xl font-semibold">Explore services</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {savedServices.map((service) => (
              <div key={service.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-gtbank-bg-gray to-gtbank-soft-blue">
                  {service.image_url && <img src={service.image_url} alt={service.service_name} className="w-full h-full object-cover" />}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h2 className="font-bold text-gray-900 text-sm">{service.service_name}</h2>
                      <p className="text-xs text-gtbank-primary font-medium">{service.service_type}</p>
                    </div>
                    <button onClick={() => removeSaved(service.id)} className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600 mb-3">
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {service.location || 'Lagos, Nigeria'}</div>
                    <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500 fill-current" /> {service.rating || 4.7}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-gray-900 text-sm">₦{(service.price || 0).toLocaleString()}</div>
                    <button onClick={() => bookService(service)} className="inline-flex items-center gap-1 px-3 py-2 bg-gtbank-primary text-white rounded-lg text-sm font-semibold hover:bg-gtbank-light-orange">
                      <Calendar className="w-3 h-3" />
                      Book
                    </button>
                  </div>
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
            <button className="flex flex-col items-center gap-1 p-2 text-gtbank-primary">
              <Heart className="w-5 h-5 fill-current" />
              <span className="text-xs font-medium">Saved</span>
            </button>
            <button onClick={() => router.push('/customer/bookings')} className="flex flex-col items-center gap-1 p-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Bookings</span>
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
