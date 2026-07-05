'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Trash2, 
  ArrowUpRight,
  Clipboard
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
  trackingCode: string | null;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('ALL');
  const [filterPayment, setFilterPayment] = useState('ALL');
  const [filterShipping, setFilterShipping] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void fetchOrders();
    });
  }, []);

  const handleUpdateStatus = async (id: string, field: 'shippingStatus' | 'paymentStatus' | 'trackingCode', value: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
      }
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOrders(prev => prev.filter(o => o.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    const absoluteUrl = window.location.origin + url;
    navigator.clipboard.writeText(absoluteUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
      
    const matchesSource = filterSource === 'ALL' || order.source === filterSource;
    const matchesPayment = filterPayment === 'ALL' || order.paymentMethod === filterPayment;
    const matchesShipping = filterShipping === 'ALL' || order.shippingStatus === filterShipping;

    return matchesSearch && matchesSource && matchesPayment && matchesShipping;
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Order Management</h1>
          <p className="page-subtitle">Track sourcing costs, shipping status, and checkout collections</p>
        </div>
        <div>
          <Link href="/orders/new" className="btn btn-primary">
            + Source New Order
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: '1', minWidth: '260px', position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search by customer name, phone, or product..." 
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <span style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }}>
              <Search size={16} />
            </span>
          </div>

          {/* Sourcing Channel filter */}
          <div>
            <select 
              className="form-control" 
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="ALL">All Sourcing</option>
              <option value="ALIEXPRESS">AliExpress</option>
              <option value="LOCAL_WHOLESALER">Wholesaler</option>
            </select>
          </div>

          {/* Payment Method filter */}
          <div>
            <select 
              className="form-control" 
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="ALL">All Payment Types</option>
              <option value="COD">Full COD</option>
              <option value="ONLINE">Full Online</option>
              <option value="SPLIT">Split Split</option>
            </select>
          </div>

          {/* Shipping Status filter */}
          <div>
            <select 
              className="form-control" 
              value={filterShipping}
              onChange={(e) => setFilterShipping(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="ALL">All Shipping Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="RETURNED">Returned</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <span className="pulse" style={{ fontSize: '16px', fontWeight: '500' }}>Loading orders database...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No orders found matching the filter criteria.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer Info</th>
                  <th>Product Details</th>
                  <th>Sourcing</th>
                  <th>Finances</th>
                  <th>Payment Split</th>
                  <th>Payment Status</th>
                  <th>Transaction ID</th>
                  <th>Shipping Status</th>
                  <th>Payment Link</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const total = order.sellingPriceDzd + order.shippingPriceDzd;
                  return (
                    <tr key={order.id}>
                      {/* Customer Info */}
                      <td>
                        <div style={{ fontWeight: '600' }}>{order.customerName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0' }}>📞 {order.customerPhone}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📍 {order.customerAddress}, {order.customerWilaya}</div>
                      </td>

                      {/* Product */}
                      <td style={{ fontWeight: '500' }}>{order.productName}</td>

                      {/* Sourcing */}
                      <td>
                        <span className={`badge ${order.source === 'ALIEXPRESS' ? 'badge-info' : 'badge-success'}`}>
                          {order.source === 'ALIEXPRESS' ? 'AliExpress' : 'Wholesaler'}
                        </span>
                      </td>

                      {/* Financials */}
                      <td>
                        <div style={{ fontWeight: '600' }}>{total.toLocaleString()} DA</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Cost: {order.costPriceDzd} DA
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--success)' }}>
                          Profit: {(order.sellingPriceDzd - order.costPriceDzd).toLocaleString()} DA
                        </div>
                      </td>

                      {/* Payment Split */}
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: '500' }}>
                          {order.paymentMethod === 'PENDING' ? '⏳ Pending Choice' : order.paymentMethod}
                        </div>
                        {order.paymentMethod === 'PENDING' && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Awaiting customer selection
                          </div>
                        )}
                        {order.paymentMethod === 'SPLIT' && (
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            <div>Online: {order.onlineAmount} DA</div>
                            <div>COD: {order.codAmount} DA</div>
                          </div>
                        )}
                        {order.paymentMethod === 'ONLINE' && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>100% Online</div>
                        )}
                        {order.paymentMethod === 'COD' && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>100% COD</div>
                        )}
                      </td>

                      {/* Payment Status inline select */}
                      <td>
                        <select 
                          value={order.paymentStatus} 
                          className="form-control"
                          onChange={(e) => handleUpdateStatus(order.id, 'paymentStatus', e.target.value)}
                          style={{ 
                            padding: '4px 8px', 
                            fontSize: '12px',
                            fontWeight: '600',
                            width: 'auto',
                            background: 
                              order.paymentStatus === 'PAID' ? 'var(--success-light)' : 
                              order.paymentStatus === 'PARTIALLY_PAID' ? 'var(--secondary-light)' :
                              order.paymentStatus === 'FAILED' ? 'var(--danger-light)' :
                              'var(--warning-light)',
                            color:
                              order.paymentStatus === 'PAID' ? 'var(--success)' : 
                              order.paymentStatus === 'PARTIALLY_PAID' ? 'var(--secondary)' :
                              order.paymentStatus === 'FAILED' ? 'var(--danger)' :
                              'var(--warning)',
                          }}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PARTIALLY_PAID">Partially Paid</option>
                          <option value="PAID">Fully Paid</option>
                          <option value="FAILED">Failed</option>
                        </select>
                      </td>

                      {/* Transaction ID */}
                      <td>
                        {order.sofizPayPaymentId ? (
                          <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: 'var(--text-primary)', fontWeight: '600', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                            {order.sofizPayPaymentId}
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>

                      {/* Shipping Status inline select */}
                      <td>
                        <select
                          value={order.shippingStatus}
                          className="form-control"
                          onChange={(e) => handleUpdateStatus(order.id, 'shippingStatus', e.target.value)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            width: 'auto',
                            background:
                              order.shippingStatus === 'DELIVERED' ? 'var(--success-light)' :
                              order.shippingStatus === 'SHIPPED' ? 'rgba(59, 130, 246, 0.1)' :
                              order.shippingStatus === 'RETURNED' ? 'var(--danger-light)' :
                              order.shippingStatus === 'CANCELLED' ? 'rgba(255, 255, 255, 0.05)' :
                              'var(--warning-light)',
                            color:
                              order.shippingStatus === 'DELIVERED' ? 'var(--success)' :
                              order.shippingStatus === 'SHIPPED' ? 'var(--info)' :
                              order.shippingStatus === 'RETURNED' ? 'var(--danger)' :
                              order.shippingStatus === 'CANCELLED' ? 'var(--text-secondary)' :
                              'var(--warning)',
                          }}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="RETURNED">Returned</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <div style={{ marginTop: '8px' }}>
                          <input 
                            type="text"
                            placeholder="Tracking Code"
                            value={order.trackingCode || ''}
                            onChange={(e) => handleUpdateStatus(order.id, 'trackingCode', e.target.value)}
                            className="form-control"
                            style={{ 
                              padding: '4px 8px', 
                              fontSize: '11px', 
                              width: '100%',
                              minWidth: '110px',
                              background: 'var(--bg-primary)',
                              borderColor: 'var(--border-color)',
                              borderRadius: '4px'
                            }}
                          />
                        </div>
                      </td>

                      {/* Checkout Link Copy */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button 
                            onClick={() => copyToClipboard(`/checkout/${order.id}`, order.id)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '11px', whiteSpace: 'nowrap' }}
                          >
                            <Clipboard size={12} /> {copiedId === order.id ? 'Copied!' : 'Copy Link'}
                          </button>
                          <Link 
                            href={`/checkout/${order.id}`} 
                            target="_blank"
                            style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}
                          >
                            <ArrowUpRight size={14} />
                          </Link>
                        </div>
                      </td>

                      {/* Delete */}
                      <td>
                        <button 
                          onClick={() => handleDelete(order.id)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
