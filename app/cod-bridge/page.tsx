'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clipboard, 
  Share2, 
  MessageCircle, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerWilaya: string;
  customerAddress: string;
  productName: string;
  source: string;
  costPriceDzd: number;
  sellingPriceDzd: number;
  shippingPriceDzd: number;
  paymentMethod: string;
  onlineAmount: number;
  codAmount: number;
  paymentStatus: string;
  shippingStatus: string;
  sofizPayPaymentId: string | null;
  sofizPayCheckoutUrl: string | null;
  createdAt: string;
}

export default function CodBridgePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messageOrder, setMessageOrder] = useState<Order | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const fetchBridgeOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        // Show all orders that are not fully paid yet
        const bridgeData = data.filter((o: Order) => o.paymentStatus !== 'PAID');
        setOrders(bridgeData);
      }
    } catch (error) {
      console.error('Failed to fetch bridge orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void fetchBridgeOrders();
    });
  }, []);

  const copyLink = (id: string) => {
    const absoluteUrl = window.location.origin + `/checkout/${id}`;
    navigator.clipboard.writeText(absoluteUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateShareMessage = (order: Order) => {
    const absoluteUrl = window.location.origin + `/checkout/${order.id}`;
    
    if (order.paymentMethod === 'PENDING') {
      return `Assalam Alaykum ${order.customerName},\n\nHere are your order details for ${order.productName}:\n\n💰 Total Price: ${order.sellingPriceDzd + order.shippingPriceDzd} DA\n\nPlease open this link to select your preferred payment method (Full COD, Full Online, or Split Deposit):\n👉 ${absoluteUrl}\n\nThank you!`;
    }
    
    return `Assalam Alaykum ${order.customerName},\n\nHere are your order details for ${order.productName}:\n\n💰 Total Price: ${order.sellingPriceDzd + order.shippingPriceDzd} DA\n🔒 Deposit to pay online: ${order.onlineAmount} DA\n📦 Remaining Cash-on-Delivery (COD): ${order.codAmount} DA\n\nPlease secure your shipping by making the online deposit using your Edahabiya or CIB card here:\n👉 ${absoluteUrl}\n\nOnce the deposit is received, your order will be shipped immediately. Thank you!`;
  };

  const handleCopyMessage = (order: Order) => {
    const message = generateShareMessage(order);
    navigator.clipboard.writeText(message);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">COD Bridge Panel</h1>
          <p className="page-subtitle">Generate secure online deposit links to cover shipping costs and eliminate COD rejection risk</p>
        </div>
      </div>

      {/* Info Warning Card */}
      <div className="card" style={{ display: 'flex', gap: '16px', borderLeft: '4px solid var(--secondary)', background: 'var(--secondary-light)' }}>
        <div style={{ color: 'var(--secondary)' }}>
          <ShieldAlert size={24} />
        </div>
        <div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>Why use the COD Bridge?</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.5' }}>
            Resellers in Algeria face massive losses when COD packages are returned. 
            By asking customers to pay a small **500 - 1000 DA deposit** online via Edahabiya/CIB, you confirm their commitment 
            and cover the shipping cost even if they reject the package, shifting your return risk to zero.
          </p>
        </div>
      </div>

      {/* Bridge Orders Table */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Active Checkout Links</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <span className="pulse" style={{ fontSize: '16px', fontWeight: '500' }}>Loading bridge links...</span>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No active bridge links found. All orders are processed or fully paid.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Total Invoice</th>
                  <th>Payment Split</th>
                  <th>Payment Status</th>
                  <th>Checkout URL</th>
                  <th>Social Messages</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const total = order.sellingPriceDzd + order.shippingPriceDzd;
                  return (
                    <tr key={order.id}>
                      {/* Customer */}
                      <td>
                        <div style={{ fontWeight: '600' }}>{order.customerName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>📞 {order.customerPhone} ({order.customerWilaya})</div>
                      </td>

                      {/* Product */}
                      <td style={{ fontWeight: '500' }}>{order.productName}</td>

                      {/* Total */}
                      <td style={{ fontWeight: '600' }}>{total.toLocaleString()} DA</td>

                      {/* Split details */}
                      <td>
                        {order.paymentMethod === 'PENDING' ? (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Awaiting Choice</span>
                        ) : (
                          <div style={{ fontSize: '12px' }}>
                            <span style={{ color: 'var(--secondary)', fontWeight: '600' }}>{order.onlineAmount} DA Online</span>
                            {' / '}
                            <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{order.codAmount} DA COD</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${
                          order.paymentStatus === 'PAID' ? 'badge-success' : 
                          order.paymentStatus === 'PARTIALLY_PAID' ? 'badge-info' : 
                          order.paymentStatus === 'FAILED' ? 'badge-danger' : 
                          'badge-warning'
                        }`}>
                          {order.paymentStatus === 'PAID' ? 'Fully Paid' : 
                           order.paymentStatus === 'PARTIALLY_PAID' ? 'Deposit Paid' : 
                           order.paymentStatus === 'FAILED' ? 'Failed' : 
                           'Pending Choice'}
                        </span>
                      </td>

                      {/* Checkout Link actions */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button 
                            onClick={() => copyLink(order.id)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                          >
                            <Clipboard size={12} /> {copiedId === order.id ? 'Copied!' : 'Copy Link'}
                          </button>
                          <Link 
                            href={`/checkout/${order.id}`} 
                            target="_blank" 
                            className="btn btn-secondary" 
                            style={{ padding: '6px' }}
                            title="Open Invoice Portal"
                          >
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      </td>

                      {/* Social messages */}
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleCopyMessage(order)}
                            className="btn btn-primary"
                            style={{ padding: '6px 10px', fontSize: '12px', background: 'var(--primary)' }}
                          >
                            <MessageCircle size={12} /> Copy Template
                          </button>
                          
                          <button
                            onClick={() => setMessageOrder(order)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                          >
                            Preview Text
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message Preview Modal */}
      {messageOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Share2 size={18} /> Social Share Message</h3>
              <button 
                onClick={() => setMessageOrder(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Copy this pre-formatted message to send to <strong>{messageOrder.customerName}</strong> via Messenger, WhatsApp, or Instagram:
            </p>
            
            <textarea 
              readOnly 
              value={generateShareMessage(messageOrder)}
              className="form-control"
              rows={8}
              style={{ fontFamily: 'inherit', fontSize: '13px', background: 'var(--bg-primary)', resize: 'none' }}
            />
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button 
                onClick={() => setMessageOrder(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generateShareMessage(messageOrder));
                  setCopiedMessage(true);
                  setTimeout(() => setCopiedMessage(false), 2000);
                }}
                className="btn btn-primary"
              >
                {copiedMessage ? 'Copied!' : 'Copy Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
