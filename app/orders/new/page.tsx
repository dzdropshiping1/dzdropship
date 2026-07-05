'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Info } from 'lucide-react';

const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", 
  "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", 
  "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Guelma", "Constantine", 
  "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", 
  "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", 
  "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane"
];

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerWilaya: 'Alger',
    customerAddress: '',
    productName: '',
    source: 'ALIEXPRESS',
    costPriceDzd: 0,
    sellingPriceDzd: 0,
    shippingPriceDzd: 600, // standard default shipping in Algeria
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.endsWith('Dzd') ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.customerName || !formData.customerPhone || !formData.customerAddress || !formData.productName) {
      setError('Please fill in all required customer and product details.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/orders');
        router.refresh();
      } else {
        const errData = await response.json();
        setError(errData.error || 'Failed to source order. Please check inputs.');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Computations
  const totalCharge = formData.sellingPriceDzd + formData.shippingPriceDzd;
  const netProfit = formData.sellingPriceDzd - formData.costPriceDzd;
  const margin = formData.sellingPriceDzd > 0 ? (netProfit / formData.sellingPriceDzd) * 100 : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <Link href="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
            <ArrowLeft size={16} /> Back to orders
          </Link>
          <h1 className="page-title">Source New Order</h1>
          <p className="page-subtitle">Add a reseller dropshipping order. The customer will select their payment split configuration on their invoice checkout page.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* Form Card */}
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Order Sourcing Details</h3>
            
            {/* Sourcing Channel */}
            <div className="form-group">
              <label className="form-label">Sourcing Channel</label>
              <select name="source" value={formData.source} onChange={handleChange} className="form-control">
                <option value="ALIEXPRESS">AliExpress (Import Direct)</option>
                <option value="LOCAL_WHOLESALER">Local Wholesaler (Algeria Warehouse)</option>
              </select>
            </div>

            {/* Product Details */}
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input 
                type="text" 
                name="productName" 
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                value={formData.productName} 
                onChange={handleChange} 
                className="form-control"
                required
              />
            </div>

            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginTop: '10px' }}>Customer Shipping Information</h3>

            {/* Customer Name */}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                name="customerName" 
                placeholder="e.g. Salim Belkacem"
                value={formData.customerName} 
                onChange={handleChange} 
                className="form-control"
                required
              />
            </div>

            <div className="form-row">
              {/* Phone */}
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input 
                  type="text" 
                  name="customerPhone" 
                  placeholder="e.g. 0550123456"
                  value={formData.customerPhone} 
                  onChange={handleChange} 
                  className="form-control"
                  required
                />
              </div>

              {/* Wilaya Dropdown */}
              <div className="form-group">
                <label className="form-label">Wilaya / Province *</label>
                <select name="customerWilaya" value={formData.customerWilaya} onChange={handleChange} className="form-control">
                  {WILAYAS.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label">Delivery Address *</label>
              <textarea 
                name="customerAddress" 
                placeholder="Detailed street address, building number, city..."
                value={formData.customerAddress} 
                onChange={handleChange} 
                className="form-control"
                rows={3}
                required
                style={{ fontFamily: 'inherit', resize: 'none' }}
              />
            </div>

            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginTop: '10px' }}>Financial Configuration</h3>

            <div className="form-row">
              {/* Sourcing Cost */}
              <div className="form-group">
                <label className="form-label">Sourcing Cost (DA)</label>
                <input 
                  type="number" 
                  name="costPriceDzd" 
                  value={formData.costPriceDzd} 
                  onChange={handleChange} 
                  className="form-control"
                  min="0"
                />
              </div>

              {/* Customer Selling Price */}
              <div className="form-group">
                <label className="form-label">Selling Price (DA)</label>
                <input 
                  type="number" 
                  name="sellingPriceDzd" 
                  value={formData.sellingPriceDzd} 
                  onChange={handleChange} 
                  className="form-control"
                  min="0"
                />
              </div>

              {/* Shipping Price */}
              <div className="form-group">
                <label className="form-label">Shipping Cost (DA)</label>
                <input 
                  type="number" 
                  name="shippingPriceDzd" 
                  value={formData.shippingPriceDzd} 
                  onChange={handleChange} 
                  className="form-control"
                  min="0"
                />
              </div>
            </div>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '14px', background: 'var(--danger-light)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                ❌ {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', padding: '14px' }}
            >
              {loading ? 'Processing Sourcing Order...' : 'Confirm Sourcing Order'}
            </button>
          </form>
        </div>

        {/* Invoice Summary Card */}
        <div className="card" style={{ position: 'sticky', top: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>Order Financial Summary</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Product Base:</span>
              <span>{formData.sellingPriceDzd.toLocaleString()} DA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Shipping Rate ({formData.customerWilaya}):</span>
              <span>{formData.shippingPriceDzd.toLocaleString()} DA</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '12px', fontWeight: 'bold', fontSize: '16px' }}>
              <span>Total Invoice:</span>
              <span>{totalCharge.toLocaleString()} DA</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Supplier Cost:</span>
              <span style={{ color: 'var(--danger)' }}>-{formData.costPriceDzd.toLocaleString()} DA</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontWeight: 'bold', fontSize: '16px', color: 'var(--success)' }}>
              <span>Projected Net Profit:</span>
              <span>{netProfit.toLocaleString()} DA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>Projected Profit Margin:</span>
              <span>{margin.toFixed(1)}%</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', background: 'var(--primary-light)', padding: '12px', borderRadius: '8px', color: 'var(--primary)', fontSize: '12px', marginTop: '24px' }}>
            <Info size={18} style={{ flexShrink: 0 }} />
            <span>
              <strong>Note on Sourcing:</strong> The customer will be able to select their payment method (Full COD, Full Online, or Split Deposit) when they open the secure invoice payment link.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
