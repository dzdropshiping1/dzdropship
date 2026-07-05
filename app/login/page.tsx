import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import LoginClient from './LoginClient';

export default async function LoginPage() {
  const session = await getCurrentUser();
  
  // If user already logged in, redirect to dashboard directly
  if (session) {
    redirect('/dashboard');
  }

  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#070a13',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8'
      }}>
        جاري التحميل... / Loading...
      </div>
    }>
      <LoginClient />
    </Suspense>
  );
}
