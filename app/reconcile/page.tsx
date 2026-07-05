'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  Truck, 
  CheckCircle2, 
  DollarSign, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface PaymentLog {
  id: string;
  orderId: string;
  sofizPayId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  reconciled: boolean;
  reconciledAt: string | null;
  createdAt: string;
}

interface Stats {
  onlineReconciled: number;
  codReconciled: number;
  onlinePending: number;
  codPending: number;
}

export default function ReconcilePage() {
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [stats, setStats] = useState<Stats>({
    onlineReconciled: 0,
    codReconciled: 0,
    onlinePending: 0,
    codPending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    onlineReconciledCount: number;
    codReconciledCount: number;
  } | null>(null);

  const fetchReconcileData = async () => {
    try {
      const response = await fetch('/api/sofizpay/sync');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching reconciliation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void fetchReconcileData();
    });
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const response = await fetch('/api/sofizpay/sync', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setSyncResult(data);
        // Refresh data
        await fetchReconcileData();
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const totalReconciled = stats.onlineReconciled + stats.codReconciled;
  const totalPending = stats.onlinePending + stats.codPending;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Reconciliation</h1>
          <p className="page-subtitle">Reconcile SofizPay gateway deposits and verify completed courier Cash-on-Delivery collections</p>
        </div>
        <div>
          <button 
            onClick={handleSync} 
            disabled={syncing} 
            className="btn btn-primary"
            style={{ minWidth: '180px' }}
          >
            <RefreshCw size={16} className={syncing ? 'pulse' : ''} style={{ marginRight: '6px' }} />
            {syncing ? 'Syncing Ledger...' : 'Sync & Reconcile Funds'}
          </button>
        </div>
      </div>

      {/* Sync Success Message */}
      {syncResult && (
        <div className="card" style={{ display: 'flex', gap: '12px', borderLeft: '4px solid var(--success)', background: 'var(--success-light)', padding: '16px' }}>
          <div style={{ color: 'var(--success)' }}><CheckCircle2 size={24} /></div>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>Reconciliation Sync Completed!</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Successfully reconciled <strong>{syncResult.onlineReconciledCount}</strong> pending SofizPay transactions and 
              converted <strong>{syncResult.codReconciledCount}</strong> delivered COD courier order collections into settled cash ledger logs.
            </p>
          </div>
        </div>
      )}

      {/* Reconcile KPI Cards */}
      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-title-row">
            <span>Reconciled Balance</span>
            <div className="kpi-icon-wrapper success">
              <ShieldCheck size={18} />
            </div>
          </div>
          <span className="kpi-value">{totalReconciled.toLocaleString()} DA</span>
          <div className="kpi-trend positive" style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            <span>Online: {stats.onlineReconciled.toLocaleString()} DA / COD: {stats.codReconciled.toLocaleString()} DA</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-title-row">
            <span>SofizPay Escrow (Online)</span>
            <div className="kpi-icon-wrapper primary">
              <Clock size={18} />
            </div>
          </div>
          <span className="kpi-value">{stats.onlinePending.toLocaleString()} DA</span>
          <div className="kpi-trend positive">
            <span>Payment link pending check</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-title-row">
            <span>Courier Outstanding (COD)</span>
            <div className="kpi-icon-wrapper warning">
              <Truck size={18} />
            </div>
          </div>
          <span className="kpi-value">{stats.codPending.toLocaleString()} DA</span>
          <div className="kpi-trend positive">
            <span>Cash in transit (Yalidine)</span>
          </div>
        </div>

        <div className="card kpi-card" style={{ borderStyle: 'dashed' }}>
          <div className="kpi-title-row">
            <span>Total Ledger Volume</span>
            <div className="kpi-icon-wrapper secondary">
              <DollarSign size={18} />
            </div>
          </div>
          <span className="kpi-value">{(totalReconciled + totalPending).toLocaleString()} DA</span>
          <div className="kpi-trend neutral">
            <span>Reconciled + Pending</span>
          </div>
        </div>
      </div>

      {/* Simulation Info */}
      <div className="card" style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)' }}>
        <div style={{ color: 'var(--info)' }}><AlertCircle size={20} /></div>
        <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
          <strong>Ledger Simulation Guide:</strong> 
          <ol style={{ marginLeft: '20px', marginTop: '6px' }}>
            <li>Create an order with <strong>Split</strong> payment, click the Checkout link and simulate payment to secure the online deposit. (Adds to <strong>SofizPay Escrow</strong>)</li>
            <li>Go to <strong>Order Management</strong> and mark the order shipping status as <strong>Delivered</strong>. (Adds to <strong>Courier Outstanding</strong>)</li>
            <li>Click <strong>Sync & Reconcile Funds</strong> above. The system automatically settles both amounts and transfers them to the <strong>Reconciled Balance</strong>.</li>
          </ol>
        </div>
      </div>

      {/* Ledger Logs Table */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} /> Transaction Ledger History
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <span className="pulse" style={{ fontSize: '16px', fontWeight: '500' }}>Loading ledger history...</span>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No payment transaction logs recorded in the ledger yet.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Order Reference</th>
                  <th>Transaction ID / Channel</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Reconciliation Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{log.id}</td>
                    <td style={{ fontWeight: '500' }}>
                      <Link href="/orders" style={{ color: 'var(--primary)' }}>
                        {log.orderId.substring(0, 10)}...
                      </Link>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{log.sofizPayId}</td>
                    <td style={{ fontWeight: '600' }}>{log.amount.toLocaleString()} DA</td>
                    <td>
                      <span className={`badge ${
                        log.paymentMethod === 'COD' ? 'badge-neutral' :
                        log.paymentMethod === 'CIB' ? 'badge-success' :
                        'badge-info'
                      }`}>
                        {log.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${log.status === 'COMPLETED' ? 'badge-success' : 'badge-danger'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td>
                      {log.reconciled && log.reconciledAt ? (
                        <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500' }}>
                          ✅ {new Date(log.reconciledAt).toLocaleString()}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500' }}>
                          ⏳ Pending Sync
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
