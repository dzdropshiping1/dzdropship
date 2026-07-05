'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  CreditCard, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import type { Order } from '@prisma/client';
import type { ReactNode } from 'react';

interface VerifyClientProps {
  order: Order;
  initialStatus: string;
  initialDetails?: Record<string, unknown> | null;
}

export default function VerifyClient({ order, initialStatus, initialDetails }: VerifyClientProps) {
  const [status, setStatus] = useState<string>(initialStatus);
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txDetails, setTxDetails] = useState<Record<string, unknown> | null>(initialDetails || null);

  const checkPaymentStatus = useCallback(async () => {
    if (!order.sofizPayPaymentId || isChecking) return;
    
    setIsChecking(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/cib-transaction-check?cib_transaction_id=${order.sofizPayPaymentId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch transaction status');
      }
      const data = await res.json();
      
      if (data.success && data.status) {
        // Map SofizPay SDK status to Order paymentStatus
        let newStatus = status;
        if (data.status === 'PAID') {
          newStatus = order.paymentMethod === 'ONLINE' ? 'PAID' : 'PARTIALLY_PAID';
        } else if (data.status === 'FAILED') {
          newStatus = 'FAILED';
        }
        setStatus(newStatus);
        
        // Extract raw details
        const details = { ...data };
        delete details.success;
        delete details.status;
        delete details.order;
        setTxDetails(details);
      }
    } catch (err) {
      console.error('Error checking CIB transaction:', err);
      setErrorMessage('Could not update status. Please try manually.');
    } finally {
      setIsChecking(false);
    }
  }, [order.sofizPayPaymentId, order.paymentMethod, status, isChecking]);

  // Poll status every 5 seconds if status is still pending
  useEffect(() => {
    if (status !== 'PENDING' || !order.sofizPayPaymentId) return;

    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [status, order.sofizPayPaymentId, checkPaymentStatus]);

  const total = order.sellingPriceDzd + order.shippingPriceDzd;
  const stringifyDetail = (value: unknown) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return JSON.stringify(value);
  };

  // Determine icon and color schemes
  const getStatusConfig = (): {
    icon: ReactNode;
    title: string;
    arTitle: string;
    desc: string;
    arDesc: string;
    badgeClass: string;
    borderColor: string;
    gradient: string;
  } => {
    switch (status) {
      case 'PAID':
      case 'PARTIALLY_PAID':
        return {
          icon: <CheckCircle2 className="w-16 h-16 text-success animate-bounce" />,
          title: 'Payment Confirmed',
          arTitle: 'تم تأكيد الدفع بنجاح',
          desc: status === 'PAID' ? 'Your order has been fully paid online.' : 'Your deposit has been paid. Remaining amount is cash on delivery.',
          arDesc: status === 'PAID' ? 'تم دفع قيمة طلبك بالكامل إلكترونياً.' : 'تم دفع العربون. المبلغ المتبقي عند الاستلام.',
          badgeClass: 'badge-paid',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))'
        };
      case 'FAILED':
        return {
          icon: <XCircle className="w-16 h-16 text-danger" />,
          title: 'Payment Failed',
          arTitle: 'فشلت عملية الدفع',
          desc: 'The payment transaction was declined or canceled.',
          arDesc: 'تم إلغاء أو رفض عملية الدفع الخاصة بك.',
          badgeClass: 'badge-failed',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.02))'
        };
      default:
        return {
          icon: <RefreshCw className={`w-16 h-16 text-warning ${isChecking || status === 'PENDING' ? 'animate-spin' : ''}`} />,
          title: 'Payment Pending',
          arTitle: 'الدفع قيد التحقق',
          desc: 'We are verifying your transaction with the bank.',
          arDesc: 'نحن نتحقق من حالة العملية مع البنك حالياً.',
          badgeClass: 'badge-pending',
          borderColor: 'rgba(245, 158, 11, 0.3)',
          gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.02))'
        };
    }
  };

  const config = getStatusConfig();
  const rejectionReason = stringifyDetail(
    txDetails?.actionCodeDescription || txDetails?.respCode_desc || txDetails?.errorMessage
  );
  const responseCode = stringifyDetail(txDetails?.respCode);

  return (
    <div style={{
      maxWidth: '480px',
      width: '100%',
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--border-radius)',
      border: `1px solid ${config.borderColor}`,
      backgroundImage: config.gradient,
      boxShadow: 'var(--glass-shadow)',
      padding: '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      transition: 'var(--transition)'
    }}>
      <style jsx>{`
        .badge-paid {
          background: var(--success-light);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .badge-failed {
          background: var(--danger-light);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .badge-pending {
          background: var(--warning-light);
          color: var(--warning);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 20px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .details-grid {
          width: 100%;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 16px;
          margin: 24px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }
        .details-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }
        .details-label {
          color: var(--text-secondary);
        }
        .details-value {
          color: var(--text-primary);
          font-weight: 500;
        }
        .btn-action {
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: var(--transition);
          border: none;
        }
        .btn-primary {
          background: var(--primary);
          color: white;
        }
        .btn-primary:hover {
          background: var(--primary-hover);
        }
        .btn-outline {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          margin-top: 12px;
        }
        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>

      {/* Icon Area */}
      <div style={{ marginBottom: '20px' }}>
        {config.icon}
      </div>

      {/* Status Badge */}
      <div className={`status-badge ${config.badgeClass}`}>
        <CreditCard className="w-4 h-4" />
        {status}
      </div>

      {/* Status Headings */}
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
        {config.title}
      </h2>
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-secondary)' }}>
        {config.arTitle}
      </h3>

      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '4px' }}>
        {config.desc}
      </p>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '20px' }} dir="rtl">
        {config.arDesc}
      </p>

      {status === 'FAILED' && txDetails && rejectionReason && (
        <div style={{
          width: '100%',
          padding: '14px',
          background: 'var(--danger-light)',
          color: 'var(--danger)',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          fontSize: '13px',
          textAlign: 'left',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle className="w-4 h-4 text-danger shrink-0" />
            <span>Rejection Reason / سبب الرفض:</span>
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: '13px', lineHeight: '1.4' }}>
            {rejectionReason}
          </p>
          {responseCode && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Response Code / رمز الاستجابة: {responseCode}
            </span>
          )}
        </div>
      )}

      {errorMessage && (
        <div style={{
          width: '100%',
          padding: '12px',
          background: 'var(--danger-light)',
          color: 'var(--danger)',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: '16px'
        }}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Transaction Details */}
      <div className="details-grid">
        <div className="details-row">
          <span className="details-label">Product / المنتج</span>
          <span className="details-value">{order.productName}</span>
        </div>
        <div className="details-row">
          <span className="details-label">Customer / الزبون</span>
          <span className="details-value">{order.customerName}</span>
        </div>
        <div className="details-row">
          <span className="details-label">Amount Paid / المبلغ المدفوع</span>
          <span className="details-value" style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>
            {order.onlineAmount} DA
          </span>
        </div>
        <div className="details-row">
          <span className="details-label">Total Order / إجمالي الطلب</span>
          <span className="details-value">{total} DA</span>
        </div>
        <div className="details-row">
          <span className="details-label">Payment Method / الطريقة</span>
          <span className="details-value">{order.paymentMethod}</span>
        </div>
        {order.sofizPayPaymentId && (
          <div className="details-row" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
            <span className="details-label" style={{ fontSize: '12px' }}>Transaction ID / رقم العملية</span>
            <span className="details-value" style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
              {order.sofizPayPaymentId}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ width: '100%' }}>
        {(status === 'PAID' || status === 'PARTIALLY_PAID') ? (
          <Link href="/dashboard" className="btn-action btn-primary">
            Go to Dashboard / لوحة التحكم
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : status === 'FAILED' ? (
          <Link href={`/checkout/${order.id}`} className="btn-action btn-primary">
            Retry Payment / إعادة الدفع
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <button 
            className="btn-action btn-primary"
            onClick={checkPaymentStatus}
            disabled={isChecking}
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking... / جاري التحقق...' : 'Re-check Status / التحقق من الحالة'}
          </button>
        )}

        <Link href="/orders" className="btn-action btn-outline">
          View Order Status / حالة الطلب
        </Link>
      </div>

      <div style={{ 
        marginTop: '24px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px', 
        fontSize: '12px', 
        color: 'var(--text-muted)' 
      }}>
        <ShieldCheck className="w-4 h-4 text-success" />
        Secured by SofizPay & SATIM CIB Gateway
      </div>
    </div>
  );
}
