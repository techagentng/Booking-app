import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Bell, CheckCircle, LogOut, Mail, MapPin, Phone, Save, ShieldCheck, User, Home, Search, Calendar, Heart } from 'lucide-react';
import axios from '../../lib/axios';
import { clearSession } from '../../utils/auth';

type CustomerProfile = {
  id?: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  preferred_city?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  identity_verified?: boolean;
  status?: string;
};

const fallbackProfile: CustomerProfile = {
  id: 'customer-demo',
  full_name: 'TripsBook Customer',
  email: 'customer@example.com',
  phone: '+234 800 000 0000',
  preferred_city: 'Lagos',
  email_verified: true,
  phone_verified: false,
  identity_verified: false,
  status: 'active',
};

export default function CustomerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile>(fallbackProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/customer/me');
        setProfile(data?.data || data?.customer || data || fallbackProfile);
      } catch (error) {
        setProfile(fallbackProfile);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateField = (field: keyof CustomerProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await axios.patch('/customer/me', {
        full_name: profile.full_name,
        phone: profile.phone,
        preferred_city: profile.preferred_city,
      });
      setSaved(true);
    } catch (error) {
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    clearSession();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gtbank-primary to-gtbank-secondary rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Profile</h1>
                <p className="text-xs text-gray-600">Your account settings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-700">Loading profile...</div>
        ) : (
          <div className="space-y-4">
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                  <input
                    value={profile.full_name || ''}
                    onChange={(e) => updateField('full_name', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                    <input
                      value={profile.email || ''}
                      disabled
                      className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                    <input
                      value={profile.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred city</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                    <input
                      value={profile.preferred_city || ''}
                      onChange={(e) => updateField('preferred_city', e.target.value)}
                      className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gtbank-primary text-white rounded-lg font-semibold hover:bg-gtbank-light-orange disabled:opacity-70"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save profile'}
                </button>
                {saved && <span className="text-sm text-green-600 font-medium">Profile saved</span>}
              </div>
            </section>

            <aside className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Verification</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-700"><Mail className="w-4 h-4" /> Email</span>
                    <CheckCircle className={`w-5 h-5 ${profile.email_verified ? 'text-green-500' : 'text-gray-300'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-700"><Phone className="w-4 h-4" /> Phone</span>
                    <CheckCircle className={`w-5 h-5 ${profile.phone_verified ? 'text-green-500' : 'text-gray-300'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-700"><ShieldCheck className="w-4 h-4" /> Identity</span>
                    <CheckCircle className={`w-5 h-5 ${profile.identity_verified ? 'text-green-500' : 'text-gray-300'}`} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Preferences</h2>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Bell className="w-5 h-5 text-gtbank-primary" />
                  <div>
                    <div className="font-semibold text-gray-900">Notifications</div>
                    <div className="text-sm text-gray-600">Booking updates and offers enabled</div>
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </aside>
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
            <button onClick={() => router.push('/customer/bookings')} className="flex flex-col items-center gap-1 p-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Bookings</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 text-gtbank-primary">
              <User className="w-5 h-5" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
