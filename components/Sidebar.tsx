'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Link as LinkIcon, RefreshCw, User, LogOut, Settings2 } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // Fetch the current user profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error('Error fetching profile in sidebar:', err);
      }
    }
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/orders', icon: ShoppingBag },
    { name: 'COD Bridge', href: '/cod-bridge', icon: LinkIcon },
    { name: 'Reconciliation', href: '/reconcile', icon: RefreshCw },
    { name: 'Settings', href: '/settings', icon: Settings2 },
  ];

  // Don't render sidebar on the customer facing checkout page
  if (pathname.startsWith('/checkout/')) {
    return null;
  }

  return (
    <div className="sidebar">
      <div className="logo-section">
        <div className="logo-icon">Dz</div>
        <div className="logo-text">DzDropship</div>
      </div>
      
      <nav className="nav-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="nav-footer" style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '16px',
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}>
        <div className="reseller-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="avatar" style={{
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <User size={16} />
          </div>
          <div className="profile-info" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: 0 }}>
            <span className="profile-name" style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: 'var(--text-primary)', 
              maxWidth: '120px', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              {user ? user.name : 'Reseller'}
            </span>
            <span className="profile-role" style={{ 
              fontSize: '11px', 
              color: 'var(--text-muted)', 
              maxWidth: '120px', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              {user ? user.email : 'Loading...'}
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          title="تسجيل الخروج / Log Out"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition)',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--danger)';
            e.currentTarget.style.background = 'var(--danger-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}

