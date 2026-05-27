import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navigation, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, ArrowRight, Loader2, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const redirectTo = typeof router.query.redirectTo === 'string' ? router.query.redirectTo : '/';

    try {
      await login(email, password, redirectTo);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL;
    const scope = 'openid email profile';
    const responseType = 'code';
    const redirectTo = typeof router.query.redirectTo === 'string' ? router.query.redirectTo : '/';
    const state = encodeURIComponent(JSON.stringify({ redirectTo }));

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri || ''
    )}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&state=${state}&access_type=offline&prompt=consent`;
    
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,130,32,0.35),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(0,66,95,0.3),_transparent_35%)]" />
      <div className="relative min-h-screen grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between p-12">
          <Link href="/" className="inline-flex items-center gap-3 text-white/90">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Navigation className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">TRIPSBOOK</span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-6">
              <Sparkles className="w-4 h-4 text-gtbank-light-orange" />
              <span className="text-sm text-white/80">Customer Portal</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Discover and book hotels, restaurants, transport, and more.
            </h1>
            <p className="text-lg text-white/70 mb-8">
              Sign in to access your bookings, saved places, and personalized recommendations.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                ['450+', 'Hotels'],
                ['280+', 'Restaurants'],
                ['320+', 'Transport'],
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
            Secure customer access with personalized dashboard
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                <Navigation className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">TRIPSBOOK</span>
            </div>

            <div className="bg-white text-gray-900 rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gtbank-bg-gray flex items-center justify-center mb-5">
                  <Navigation className="w-7 h-7 text-gtbank-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Customer Login</h2>
                <p className="text-gray-600">Access your account to manage bookings and saved places.</p>
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
                      placeholder="you@example.com"
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
                  <Link href="/signup" className="text-gtbank-primary font-medium hover:text-gtbank-secondary">
                    Create account
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-gtbank-primary to-gtbank-secondary text-white font-semibold shadow-lg shadow-gtbank-primary/20 hover:shadow-xl hover:shadow-gtbank-primary/25 transition-all disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-3 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-70"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
                Service provider? <Link href="/provider/login" className="text-gtbank-primary font-medium">Use provider login</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}