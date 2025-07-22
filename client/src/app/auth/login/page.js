'use client';
import { useState, useEffect } from 'react';
import { getAuth0Client } from '@/lib/auth0';
import { useRouter } from 'next/navigation';
import axios from "axios";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const handleRedirectCallback = async () => {
      const auth0 = await getAuth0Client();
      const isAuthenticated = await auth0.isAuthenticated();

      if (window.location.search.includes('code=')) {
        await auth0.handleRedirectCallback();
        router.replace('/dashboard');
      }

      if (isAuthenticated) {
        const token = await auth0.getTokenSilently({
          audience: 'https://invoicelypro/api',
          scope: 'read:clients read:invoices',
        });
        console.log('Access Token:', token);

        localStorage.clear();
        // Or specifically remove Auth0 tokens
        localStorage.removeItem('auth0.token');
        localStorage.removeItem('auth0.user');
        localStorage.setItem('token', token);
        axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('🔐 Token sent to backend:', token);
      }
    };

    handleRedirectCallback();
  }, []);

  const login = async () => {
    try {
      setLoading(true);
      const auth0 = await getAuth0Client();
      await auth0.loginWithRedirect();
    } catch (err) {
      console.error('Login error:', err);
      setError(`Login failed: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black">

      {/* Add the logo/image here */}
      <div className="text-center">
        <img
          src="/saas img.avif"
          alt="InvoicelyPro Logo"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
      </div>

      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center space-y-2">
          <h1 className="text-2xl ml-20  font-semibold text-gray-800">
            Login with InvoicelyPro
          </h1>
          </div>
          </div>

          <div className="-bottom-96 relative z-10 flex justify-center space-y-6">
            <button
              onClick={login}
              disabled={loading}
              className="px-6 py-2 rounded-md bg-indigo-600 text-white ml-16 hover:bg-indigo-700  hover:cursor-pointer transition duration-300"
            >
              {loading ? 'Redirecting...' : 'Login with Auth0'}
            </button>

            {error && (
              <div className="text-red-600 text-center text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
        );
}