'use client';

import { useState, useEffect } from 'react';
import { Key, Save, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface UserSettings {
  id: string;
  name: string;
  email: string;
  sofizPayPublicKey: string | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [publicKey, setPublicKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/user/settings');
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        setPublicKey(data.settings.sofizPayPublicKey || '');
      }
    } catch {
      setMessage({ type: 'error', text: 'فشل تحميل الإعدادات' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sofizPayPublicKey: publicKey.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'حدث خطأ أثناء الحفظ' });
      } else {
        setSettings(data.settings);
        setMessage({ type: 'success', text: 'تم حفظ المفتاح بنجاح ✓' });
      }
    } catch {
      setMessage({ type: 'error', text: 'فشل الاتصال بالخادم' });
    } finally {
      setSaving(false);
    }
  }

  const maskedKey = publicKey
    ? publicKey.slice(0, 6) + '•'.repeat(Math.max(0, publicKey.length - 10)) + publicKey.slice(-4)
    : '';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <Loader size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">إعدادات الحساب</h1>
          <p className="page-subtitle">إدارة بيانات حسابك ومفتاح الدفع الإلكتروني</p>
        </div>
      </div>

      <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* User Info Card */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>معلومات الحساب</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                الاسم
              </label>
              <div style={{
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '14px',
              }}>
                {settings?.name}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                البريد الإلكتروني
              </label>
              <div style={{
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '14px',
              }}>
                {settings?.email}
              </div>
            </div>
          </div>
        </div>

        {/* SofizPay Key Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '8px',
              borderRadius: '8px',
            }}>
              <Key size={18} />
            </div>
            <h3 style={{ fontSize: '16px' }}>مفتاح SofizPay العام</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
            أدخل المفتاح العام لحساب SofizPay الخاص بك (يبدأ بـ <code style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px' }}>G</code>).
            يُستخدم هذا المفتاح لربط مدفوعات العملاء بحسابك مباشرةً دون الحاجة لضبط ملف <code style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px' }}>.env</code>.
          </p>

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="sofizPayPublicKey"
                style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}
              >
                المفتاح العام (Public Key)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="sofizPayPublicKey"
                  type={showKey ? 'text' : 'password'}
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  title={showKey ? 'إخفاء المفتاح' : 'إظهار المفتاح'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Key preview when hidden */}
              {!showKey && publicKey && (
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', fontFamily: 'monospace' }}>
                  {maskedKey}
                </p>
              )}

              {/* Status indicator */}
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {settings?.sofizPayPublicKey ? (
                  <>
                    <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                    <span style={{ fontSize: '12px', color: 'var(--success)' }}>المفتاح مُفعَّل — مدفوعات SofizPay تعمل</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} style={{ color: 'var(--warning)' }} />
                    <span style={{ fontSize: '12px', color: 'var(--warning)' }}>لم يُضبط بعد — سيتم استخدام إعداد النظام الافتراضي</span>
                  </>
                )}
              </div>
            </div>

            {/* Feedback message */}
            {message && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: message.type === 'success' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
                color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
              }}>
                {message.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {message.text}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {saving ? (
                  <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Save size={14} />
                )}
                {saving ? 'جارٍ الحفظ...' : 'حفظ المفتاح'}
              </button>

              {publicKey && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setPublicKey('');
                    setMessage(null);
                  }}
                >
                  مسح
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
