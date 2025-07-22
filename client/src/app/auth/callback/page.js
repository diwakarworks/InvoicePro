'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth0Client } from '@/lib/auth0';

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        const auth0 = await getAuth0Client();

        // Handle the callback from Auth0
        await auth0.handleRedirectCallback();

        // Get user info and token
        const user = await auth0.getUser();
        const token = await auth0.getTokenSilently({
          audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
          scope: 'read:clients read:invoices',
        });

        
        localStorage.setItem('token', token); 

        console.log('User:', user);
        console.log('Token:', token);

        document.cookie = `auth_token=${token}; path=/; secure; samesite=strict`;


        router.push('/dashboard');

      } catch (error) {
        console.error('Auth0 callback error:', error);
        setError('Authentication failed. Please try again.');

        // Redirect back to login after a delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    }

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>{error}</p>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return <p>Processing login...</p>;
}
