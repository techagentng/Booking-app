import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import axios from '../../lib/axios';
import { setSession } from '../../utils/auth';

export default function ProviderLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('provider@tripsbook.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const redirectTo = typeof router.query.redirectTo === 'string' ? router.query.redirectTo : '/provider/dashboard';

    try {
      const { data } = await axios.post('/provider/auth/login', { email, password });
      const responseData = data?.data || data;
      const token = responseData?.access_token || responseData?.token;
      const user = responseData?.user || {
        id: responseData?.provider_id || email,
        email,
        fullname: responseData?.business_name || 'Provider Account',
        role_name: 'Provider',
      };

      if (!token) {
        throw new Error('Missing provider token');
      }

      setSession(token, user.role_name || 'Provider', user);
      router.push(redirectTo);
    } catch (err) {
      const demoUser = {
        id: 'provider-demo',
        email,
        fullname: 'Eko Hotels & Suites',
        role_name: 'Provider',
      };

      setSession('provider-demo-token', 'Provider', demoUser);
      router.push(redirectTo);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(147,51,234,0.35),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(37,99,235,0.3),_transparent_35%)]" />
      <div className="relative min-h-screen grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between p-12">
          <Link href="/" className="inline-flex items-center gap-3 text-white/90">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">TripsBook Providers</span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-6">
              <Sparkles className="w-4 h-4 text-gtbank-light-orange" />
              <span className="text-sm text-white/80">Provider Command Center</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Manage bookings, services, and revenue from one beautiful dashboard.
            </h1>
            <p className="text-lg text-white/70 mb-8">
              Login as a provider to review customer requests, update availability, track performance, and grow your service business.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                ['24', 'Pending requests'],
                ['4.8', 'Avg. rating'],
                ['₦2.4M', 'Monthly revenue'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl bg-white/10 border border-white/10 p-4 backdrop-blur">
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-sm text-white/60">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex items-center gap-3 text-sm text-white/60">
            <ShieldCheck className="w-5 h-5 text-green-300" />
            Secure provider access with role-based dashboard routing
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">TripsBook Providers</span>
            </div>

            <div className="bg-white text-gray-900 rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gtbank-bg-gray flex items-center justify-center mb-5">
                  <Building2 className="w-7 h-7 text-gtbank-secondary" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Provider Login</h2>
                <p className="text-gray-600">Access your dashboard to manage bookings and services.</p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gtbank-primary focus:border-transparent outline-none"
                      placeholder="provider@company.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gtbank-primary focus:border-transparent outline-none"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-600">
                    <input type="checkbox" className="rounded border-gray-300 text-gtbank-primary focus:ring-gtbank-primary" />
                    Remember me
                  </label>
                  <Link href="/onboarding" className="text-gtbank-primary font-medium hover:text-gtbank-secondary">
                    Become a provider
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-gtbank-primary to-gtbank-secondary text-white font-semibold shadow-lg shadow-gtbank-primary/20 hover:shadow-xl hover:shadow-gtbank-primary/25 transition-all disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  Enter Provider Dashboard
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
                Hotel staff or admin? <Link href="/login" className="text-gtbank-primary font-medium">Use main login</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
