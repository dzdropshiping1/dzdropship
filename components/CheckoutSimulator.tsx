'use client';

import { useState } from 'react';
import { 
  CreditCard, 
  Lock, 
  ArrowRight, 
  CheckCircle, 
  Smartphone,
  Truck,
  ChevronLeft
} from 'lucide-react';
import type { Order } from '@prisma/client';

interface SimulatorProps {
  order: Order;
}
export default function CheckoutSimulator({ order }: SimulatorProps) {
  // Determine initial simulator state based on current order status
  const getInitialStep = () => {
    if (order.paymentMethod === 'COD') {
      return 'success';
    }
    if ((order.paymentMethod === 'ONLINE' || order.paymentMethod === 'SPLIT') && 
        (order.paymentStatus === 'PAID' || order.paymentStatus === 'PARTIALLY_PAID')) {
      return 'success';
    }
    return 'select-method';
  };

  const getInitialMethod = () => {
    if (order.paymentMethod === 'PENDING') return 'SPLIT';
    return order.paymentMethod as 'COD' | 'ONLINE' | 'SPLIT';
  };

  const getInitialDeposit = () => {
    if (order.paymentMethod === 'SPLIT' && order.onlineAmount > 0) {
      return order.onlineAmount;
    }
    return 500;
  };

  const [step, setStep] = useState<'select-method' | 'form' | 'processing' | 'otp' | 'success' | 'failed'>(getInitialStep());
  const [selectedMethod, setSelectedMethod] = useState<'COD' | 'ONLINE' | 'SPLIT'>(getInitialMethod());
  const [depositAmount, setDepositAmount] = useState<number>(getInitialDeposit());
  
  const [cardType, setCardType] = useState<'EDAHABIYA' | 'CIB'>('EDAHABIYA');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const total = order.sellingPriceDzd + order.shippingPriceDzd;

  // Split Calculations
  const getOnlineAmount = () => {
    if (selectedMethod === 'ONLINE') return total;
    if (selectedMethod === 'SPLIT') return depositAmount;
    return 0;
  };

  const getCodAmount = () => {
    return total - getOnlineAmount();
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardCvv(value);
  };

  // Option A: Confirm COD instantly
  const handleCODConfirm = async () => {
    setStep('processing');
    setError(null);

    try {
      const response = await fetch(`/api/orders/${order.id}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'COD',
          onlineAmount: 0,
        }),
      });

      if (response.ok) {
        setStep('success');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to confirm COD order.');
        setStep('select-method');
      }
    } catch (err) {
      console.error(err);
      setStep('select-method');
      setError('A connection error occurred. Please try again.');
    }
  };

  // Option B & C: Initialize payment and check redirect
  const handleOnlineSubmit = async () => {
    setError(null);
    const onlineAmt = getOnlineAmount();
    
    if (onlineAmt < 100) {
      setError('The minimum amount for online payment via SofizPay is 100 DA.');
      return;
    }

    setStep('processing');

    try {
      
      const response = await fetch(`/api/orders/${order.id}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: selectedMethod,
          onlineAmount: onlineAmt,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // If a real gateway URL is returned by the SDK, redirect the customer directly to SofizPay
        if (data.url && (data.url.startsWith('http') || data.url.includes('sofizpay') || data.url.includes('satim.dz'))) {
          window.location.href = data.url;
        } else {
          // Otherwise, fall back to our local card/OTP simulator for offline testing
          setStep('form');
        }
      } else {
        setError(data.error || 'Failed to initialize payment.');
        setStep('select-method');
      }
    } catch (err) {
      console.error(err);
      setStep('select-method');
      setError('A connection error occurred. Please try again.');
    }
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length !== 16) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }
    if (cardExpiry.length !== 5) {
      setError('Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (!cardName) {
      setError('Please enter the cardholder name.');
      return;
    }
    if (cardCvv.length !== 3) {
      setError('Please enter a valid 3-digit CVV2 code.');
      return;
    }

    setStep('processing');
    setTimeout(() => {
      setStep('otp');
    }, 1500);
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setError('Please enter a valid verification code.');
      return;
    }

    setStep('processing');
    setError(null);

    try {
      const onlineAmt = getOnlineAmount();
      
      const response = await fetch(`/api/orders/${order.id}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: selectedMethod,
          onlineAmount: onlineAmt,
          paymentMethodDetails: cardType,
          forceOfflineComplete: true, // Tell API to immediately mark as paid offline
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTimeout(() => {
          setStep('success');
        }, 1000);
      } else {
        setStep('failed');
        setError(data.error || 'Payment verification rejected.');
      }
    } catch (err) {
      console.error(err);
      setStep('form');
      setError('A connection error occurred. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, #090d16 0%, #111827 100%)'
    }}>
      <div style={{
        maxWidth: '960px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '32px',
      }}>
        {/* Left Side: Order summary (Stays sticky) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              SECURED INVOICE CHECKOUT
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '6px' }}>Merchant Store</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Reference ID: {order.id}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Product:</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>{order.productName}</div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Deliver To:</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{order.customerName}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.customerAddress}, {order.customerWilaya}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '14px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Subtotal:</span>
              <span style={{ fontSize: '14px' }}>{order.sellingPriceDzd.toLocaleString()} DA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Shipping ({order.customerWilaya}):</span>
              <span style={{ fontSize: '14px' }}>{order.shippingPriceDzd.toLocaleString()} DA</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '14px', fontWeight: 'bold', fontSize: '18px' }}>
              <span>Total Price:</span>
              <span>{total.toLocaleString()} DA</span>
            </div>
          </div>

          {step !== 'select-method' && selectedMethod !== 'COD' && (
            <div style={{
              background: 'var(--primary-light)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '10px'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Paying Online Now:</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--secondary)' }}>{getOnlineAmount().toLocaleString()} DA</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>COD Balance:</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{getCodAmount().toLocaleString()} DA</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Payment Portal */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '32px', minHeight: '440px', justifyContent: 'center' }}>
          
          {/* STEP 1: Method Selection */}
          {step === 'select-method' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CreditCard size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '18px' }}>Select Payment Method</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Option A: COD */}
                <div 
                  onClick={() => setSelectedMethod('COD')}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: `2px solid ${selectedMethod === 'COD' ? 'var(--primary)' : 'var(--border-color)'}`,
                    background: selectedMethod === 'COD' ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>💵 Cash on Delivery (COD)</span>
                    <span>{total.toLocaleString()} DA</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Pay the full invoice value to the courier upon delivery at your door.
                  </p>
                </div>

                {/* Option B: Online */}
                <div 
                  onClick={() => setSelectedMethod('ONLINE')}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: `2px solid ${selectedMethod === 'ONLINE' ? 'var(--primary)' : 'var(--border-color)'}`,
                    background: selectedMethod === 'ONLINE' ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>💳 Full Online Payment</span>
                    <span style={{ color: 'var(--secondary)' }}>{total.toLocaleString()} DA</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Pay 100% online now with your Edahabiya or CIB card.
                  </p>
                </div>

                {/* Option C: Split Payment */}
                <div 
                  onClick={() => setSelectedMethod('SPLIT')}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: `2px solid ${selectedMethod === 'SPLIT' ? 'var(--primary)' : 'var(--border-color)'}`,
                    background: selectedMethod === 'SPLIT' ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>⚖️ Split Split Payment</span>
                    <span style={{ color: 'var(--secondary)' }}>{depositAmount} DA Now</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Secure the shipment with a partial online deposit. Pay the remaining balance upon delivery.
                  </p>
                  
                  {selectedMethod === 'SPLIT' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setDepositAmount(500); }}
                        className={`btn ${depositAmount === 500 ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 12px', fontSize: '12px', flex: '1' }}
                      >
                        500 DA Deposit
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setDepositAmount(1000); }}
                        className={`btn ${depositAmount === 1000 ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 12px', fontSize: '12px', flex: '1' }}
                      >
                        1000 DA Deposit
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div style={{ color: 'var(--danger)', fontSize: '13px', background: 'var(--danger-light)', padding: '10px', borderRadius: '6px' }}>
                  ❌ {error}
                </div>
              )}

              {selectedMethod === 'COD' ? (
                <button 
                  onClick={handleCODConfirm}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', background: 'var(--success)' }}
                >
                  Confirm COD Delivery Order <Truck size={16} style={{ marginLeft: '6px' }} />
                </button>
              ) : (
                <button 
                  onClick={handleOnlineSubmit}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px' }}
                >
                  Pay via SofizPay <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </button>
              )}
            </div>
          )}

          {/* STEP 2: Card Inputs (Fallback only) */}
          {step === 'form' && (
            <form onSubmit={handleCardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  type="button" 
                  onClick={() => setStep('select-method')} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '13px' }}
                >
                  <ChevronLeft size={16} /> Payment Options
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} style={{ color: 'var(--success)' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Secured Gateway</span>
                </div>
              </div>

              {/* Card Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--bg-primary)', padding: '4px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setCardType('EDAHABIYA'); setError(null); }}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: cardType === 'EDAHABIYA' ? 'var(--warning-light)' : 'transparent',
                    color: cardType === 'EDAHABIYA' ? 'var(--warning)' : 'var(--text-secondary)',
                    transition: 'var(--transition)'
                  }}
                >
                  Edahabiya Card
                </button>
                <button
                  type="button"
                  onClick={() => { setCardType('CIB'); setError(null); }}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: cardType === 'CIB' ? 'var(--secondary-light)' : 'transparent',
                    color: cardType === 'CIB' ? 'var(--secondary)' : 'var(--text-secondary)',
                    transition: 'var(--transition)'
                  }}
                >
                  CIB Bank Card
                </button>
              </div>

              {/* Card Visual Representation */}
              <div style={{
                background: cardType === 'EDAHABIYA' 
                  ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' 
                  : 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                color: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '160px',
                transition: 'var(--transition)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                    {cardType === 'EDAHABIYA' ? 'Algérie Poste Edahabiya' : 'SATIM CIB Card'}
                  </span>
                  <CreditCard size={24} />
                </div>
                <div style={{ fontSize: '17px', letterSpacing: '2px', fontFamily: 'monospace', margin: '12px 0' }}>
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <div>
                    <span style={{ color: 'rgba(255,255,255,0.7)', display: 'block', fontSize: '8px', textTransform: 'uppercase' }}>Cardholder</span>
                    <span>{cardName.toUpperCase() || 'FULL NAME'}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)', display: 'block', fontSize: '8px', textTransform: 'uppercase' }}>Expires</span>
                    <span>{cardExpiry || 'MM/YY'}</span>
                  </div>
                </div>
              </div>

              {/* Card Inputs */}
              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  placeholder={cardType === 'EDAHABIYA' ? '6079 99xx xxxx xxxx' : '5370 xxxx xxxx xxxx'}
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV2 Code</label>
                  <input
                    type="password"
                    placeholder="•••"
                    value={cardCvv}
                    onChange={handleCvvChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="e.g. SALIM BENALI"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              {error && (
                <div style={{ color: 'var(--danger)', fontSize: '13px', background: 'var(--danger-light)', padding: '10px', borderRadius: '6px' }}>
                  ❌ {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ padding: '14px', width: '100%', background: cardType === 'EDAHABIYA' ? 'var(--warning)' : 'var(--secondary)' }}>
                Secure Payment: {getOnlineAmount()} DA <ArrowRight size={16} style={{ marginLeft: '6px' }} />
              </button>
            </form>
          )}

          {/* STEP 3: Processing Spinner */}
          {step === 'processing' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: '1', textAlign: 'center', gap: '16px' }}>
              <div className="pulse" style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '3px solid var(--border-color)',
                borderTopColor: 'var(--primary)',
                animation: 'pulse 1.5s infinite linear'
              }}></div>
              <div>
                <h4>Securing Transaction</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>Communicating with SATIM / Algérie Poste processing server...</p>
              </div>
            </div>
          )}

          {/* STEP 4: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleOtpVerify} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Smartphone size={32} style={{ color: 'var(--primary)' }} />
                <h3>2-Step Security Verification</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', padding: '0 16px', lineHeight: '1.5' }}>
                  An SMS containing a 6-digit verification code was sent to your phone number ending in <strong>{order.customerPhone.slice(-3)}</strong>.
                </p>
              </div>

              <div className="form-group" style={{ margin: '16px 0' }}>
                <label className="form-label">Enter SMS OTP Code</label>
                <input
                  type="text"
                  placeholder="e.g. 123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.slice(0, 6))}
                  className="form-control"
                  style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '4px', fontWeight: 'bold' }}
                  required
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '8px' }}>
                  💡 Enter any 6 digits for this simulator demonstration
                </span>
              </div>

              {error && (
                <div style={{ color: 'var(--danger)', fontSize: '13px', background: 'var(--danger-light)', padding: '10px', borderRadius: '6px' }}>
                  ❌ {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <button type="button" onClick={() => setStep('form')} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--success)' }}>
                  Confirm OTP & Pay
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: Success Screen */}
          {step === 'success' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: '1', textAlign: 'center', gap: '20px' }}>
              <div style={{ color: 'var(--success)', animation: 'float 3s ease-in-out infinite' }}>
                <CheckCircle size={64} />
              </div>
              
              {selectedMethod === 'COD' ? (
                <div>
                  <h3 style={{ fontSize: '22px', color: 'var(--success)' }}>Order Confirmed!</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '8px', lineHeight: '1.5', padding: '0 16px' }}>
                    Your order was successfully registered. You will pay the full amount upon delivery.
                  </p>
                </div>
              ) : (
                <div>
                  <h3 style={{ fontSize: '22px', color: 'var(--success)' }}>Payment Approved!</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '8px', lineHeight: '1.5', padding: '0 16px' }}>
                    Your secure deposit of <strong>{getOnlineAmount()} DA</strong> was successfully processed.
                  </p>
                </div>
              )}
              
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px',
                width: '100%',
                fontSize: '12px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Payment Option:</span>
                  <span style={{ fontWeight: '600' }}>
                    {selectedMethod === 'COD' ? 'Cash on Delivery (COD)' : 
                     selectedMethod === 'ONLINE' ? 'Full Online Payment' : 'Split Split Payment'}
                  </span>
                </div>
                
                {selectedMethod !== 'COD' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Paid Online:</span>
                      <span style={{ fontWeight: '600', color: 'var(--success)' }}>{getOnlineAmount()} DA</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Transaction ID:</span>
                      <span style={{ fontFamily: 'monospace' }}>{order.sofizPayPaymentId}</span>
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Remaining COD Balance:</span>
                  <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{getCodAmount()} DA</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Shipping Status:</span>
                  <span style={{ 
                    fontWeight: '600', 
                    color: 
                      order.shippingStatus === 'DELIVERED' ? 'var(--success)' : 
                      order.shippingStatus === 'RETURNED' ? 'var(--danger)' : 
                      order.shippingStatus === 'SHIPPED' ? '#3b82f6' : 
                      'var(--warning)' 
                  }}>
                    {order.shippingStatus === 'PENDING' ? '⏳ Processing (قيد معالجة الشحن)' :
                     order.shippingStatus === 'SHIPPED' ? '🚚 Shipped (تم الشحن)' :
                     order.shippingStatus === 'DELIVERED' ? '✅ Delivered (تم التسليم)' :
                     order.shippingStatus === 'RETURNED' ? '🔄 Returned (تم الإرجاع)' :
                     '❌ Cancelled (ملغي)'}
                  </span>
                </div>

                {order.trackingCode && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Tracking Code:</span>
                    <span style={{ fontWeight: '700', color: 'var(--secondary)', letterSpacing: '0.5px' }}>
                      📦 {order.trackingCode}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                🔒 Secure order processing. You can close this window now.
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
