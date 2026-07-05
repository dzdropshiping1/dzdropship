'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isNoSidebar = pathname === '/' || pathname === '/login' || pathname.startsWith('/checkout/');

  if (isNoSidebar) {
    return <div style={{ minHeight: '100vh', width: '100%' }}>{children}</div>;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
