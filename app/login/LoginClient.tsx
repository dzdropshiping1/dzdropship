'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Mail, 
  User as UserIcon,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = activeTab === 'login' ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ ما / An error occurred');
      }

      setSuccess(activeTab === 'login' ? 'تم تسجيل الدخول بنجاح! / Logged in successfully!' : 'تم إنشاء الحساب بنجاح! / Registered successfully!');
      
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في الاتصال / Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#070a13',
      backgroundImage: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, transparent 60%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      color: 'var(--text-primary)',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        * {
          font-family: 'Cairo', 'Outfit', sans-serif !important;
        }
        .auth-console {
          background: rgba(13, 18, 30, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(24px);
          border-radius: 24px;
          padding: 40px 32px;
          box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.5);
          position: relative;
          width: 100%;
          max-width: 480px;
        }
        .auth-console::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), rgba(14, 165, 233, 0.5), transparent);
          border-radius: 24px 24px 0 0;
        }
        .tabs-pill-container {
          background: rgba(7, 10, 19, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 4px;
          border-radius: 12px;
          display: flex;
          margin-bottom: 30px;
        }
        .tab-pill-btn {
          flex: 1;
          padding: 12px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .tab-pill-btn.active {
          color: white;
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.3);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
        }
        .premium-input-box {
          background: rgba(7, 10, 19, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          padding: 10px 16px;
          margin-bottom: 20px;
          transition: all 0.25s;
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: right;
        }
        .premium-input-box:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 1px var(--primary);
          background: rgba(7, 10, 19, 0.8);
        }
        .premium-input-box label {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 2px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .premium-input-box input {
          width: 100%;
          background: transparent;
          border: none;
          color: white;
          font-size: 14px;
          font-weight: 500;
        }
        .premium-input-box input:focus {
          outline: none;
        }
        .premium-input-box input::placeholder {
          color: #4b5563;
        }
        .gradient-submit-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 50%, var(--secondary) 100%);
          background-size: 200% auto;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.4s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
        }
        .gradient-submit-btn:hover {
          background-position: right center;
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(139, 92, 246, 0.45);
        }
        .alert {
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 20px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .alert-error {
          background: var(--danger-light);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .alert-success {
          background: var(--success-light);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      ` }} />

      {/* Back to Home Link */}
      <Link href="/" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: '#94a3b8',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '24px',
        transition: 'all 0.25s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
      onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
      >
        <ChevronLeft size={16} />
        <span>العودة للرئيسية / Back to Home</span>
      </Link>

      {/* Auth Form Card */}
      <div className="auth-console">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '6px' }}>
            {activeTab === 'login' ? 'مرحباً بك مجدداً' : 'ابدأ عملك التجاري الآن'}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {activeTab === 'login' ? 'سجل دخولك للوصول للوحة التحكم' : 'أنشئ حساباً مجانياً للوصول للوحة التحكم'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="tabs-pill-container">
          <button 
            onClick={() => { setActiveTab('login'); setError(null); }}
            className={`tab-pill-btn ${activeTab === 'login' ? 'active' : ''}`}
          >
            تسجيل الدخول
          </button>
          <button 
            onClick={() => { setActiveTab('register'); setError(null); }}
            className={`tab-pill-btn ${activeTab === 'register' ? 'active' : ''}`}
          >
            حساب جديد
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error" dir="rtl">
            <span>⚠️</span>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {success && (
          <div className="alert alert-success" dir="rtl">
            <span>✅</span>
            <p style={{ margin: 0 }}>{success}</p>
          </div>
        )}

        {/* Forms */}
        <form onSubmit={handleSubmit}>
          
          {activeTab === 'register' && (
            <div className="premium-input-box">
              <UserIcon size={18} style={{ color: '#4b5563' }} />
              <div style={{ flex: 1 }}>
                <label>الاسم الكامل</label>
                <input 
                  type="text" 
                  placeholder="أدخل اسمك بالكامل"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="premium-input-box">
            <Mail size={18} style={{ color: '#4b5563' }} />
            <div style={{ flex: 1 }}>
              <label>البريد الإلكتروني</label>
              <input 
                type="email" 
                placeholder="merchant@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="premium-input-box">
            <Lock size={18} style={{ color: '#4b5563' }} />
            <div style={{ flex: 1 }}>
              <label>كلمة المرور</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="gradient-submit-btn"
            disabled={isLoading}
            style={{ marginTop: '10px' }}
          >
            {isLoading ? (
              <Sparkles className="spinner" size={18} />
            ) : activeTab === 'login' ? (
              <>
                <span>تسجيل الدخول</span>
                <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
              </>
            ) : (
              <>
                <span>إنشاء الحساب والبدء</span>
                <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: 'var(--text-muted)' }}>
          بوابة دفع إلكترونية آمنة بواسطة حلول SofizPay للجزائر.
        </div>
      </div>
    </div>
  );
}
