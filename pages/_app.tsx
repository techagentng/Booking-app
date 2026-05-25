import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { appWithTranslation } from 'next-i18next';
import SmartSuppChat from '@/components/SmartSuppChat';
import { queryClient } from '@/lib/queryClient';
import { store, persistor } from '@/store';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SvCTtFKwV7b55XPeYtNbO7dS2gSi2yZ6orYN2Spbbn4p9JWFdHTAeIB1f5rzQtaqMXHFeH0ATqtC1d13ukzQVbs00qRGX75bK');

function App({ Component, pageProps }: AppProps) {

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <Elements stripe={stripePromise}>
            <AuthProvider>
              <NotificationProvider>
                <ThemeProvider>
                  <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 5000,
                    style: {
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10B981',
                        secondary: 'white',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: 'white',
                      },
                    },
                  }}
                />
                <Component {...pageProps} />
                <SmartSuppChat />
              </ThemeProvider>
            </NotificationProvider>
          </AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </Elements>
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);
}

export default appWithTranslation(App);
