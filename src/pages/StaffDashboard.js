import React, { useState, useEffect, useRef } from 'react';
import {
  listenToOrders, markOrderServed, markOrderExpired,
  setCurrentToken, listenToCurrentToken
} from '../services/firebaseApi';
import OrderTable from '../components/OrderTable';
import styles from './StaffDashboard.module.css';

const EXPIRY_MS = 10 * 60 * 1000;

const StaffDashboard = () => {
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState('all');
  const [currentToken, setCurrentTokenState] = useState(null);
  const [settingToken, setSettingToken]   = useState(false);

  // Keep a ref so the expiry interval always sees fresh orders
  const ordersRef = useRef([]);

  useEffect(() => {
    const unsubOrders = listenToOrders((data) => {
      ordersRef.current = data;

      const sorted = [...data].sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() ?? new Date(a.createdAt ?? 0);
        const dateB = b.createdAt?.toDate?.() ?? new Date(b.createdAt ?? 0);
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (b.status === 'pending' && a.status !== 'pending') return 1;
        if (a.status === 'pending' && b.status === 'pending') return dateA - dateB;
        return dateB - dateA;
      });

      setOrders(sorted);
      setLoading(false);
    });

    const unsubToken = listenToCurrentToken((token) => {
      setCurrentTokenState(token);
    });

    // ✅ Check for expired orders every 30 seconds on the client
    // This ensures the UI updates even without a server function
    const expiryInterval = setInterval(async () => {
      const now = Date.now();
      for (const order of ordersRef.current) {
        if (order.status === 'pending') {
          const createdAt = order.createdAt?.toDate?.() ?? new Date(order.createdAt ?? 0);
          if (now - createdAt.getTime() > EXPIRY_MS) {
            try {
              await markOrderExpired(order.id);
            } catch (err) {
              console.error('Failed to expire order:', order.id, err);
            }
          }
        }
      }
    }, 30 * 1000); // every 30 seconds

    // Also run immediately on mount
    const runExpiry = async () => {
      const now = Date.now();
      for (const order of ordersRef.current) {
        if (order.status === 'pending') {
          const createdAt = order.createdAt?.toDate?.() ?? new Date(order.createdAt ?? 0);
          if (now - createdAt.getTime() > EXPIRY_MS) {
            try { await markOrderExpired(order.id); } catch (err) { console.error(err); }
          }
        }
      }
    };
    // Small delay so ordersRef is populated first
    const initTimeout = setTimeout(runExpiry, 2000);

    return () => {
      unsubOrders();
      unsubToken();
      clearInterval(expiryInterval);
      clearTimeout(initTimeout);
    };
  }, []);

  const handleMarkServed = async (orderId) => {
    try {
      await markOrderServed(orderId);
    } catch (error) {
      alert(error.message || 'Failed to update order status');
    }
  };

  const handleSetCurrentToken = async (token) => {
    setSettingToken(true);
    try {
      await setCurrentToken(token);
    } catch (err) {
      alert('Failed to update current token');
    } finally {
      setSettingToken(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'pending')   return order.status === 'pending';
    if (filter === 'served')    return order.status === 'served';
    if (filter === 'cancelled') return order.status === 'cancelled';
    if (filter === 'expired')   return order.status === 'expired';
    return true;
  });

  const pendingCount   = orders.filter(o => o.status === 'pending').length;
  const servedCount    = orders.filter(o => o.status === 'served').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;
  const expiredCount   = orders.filter(o => o.status === 'expired').length;

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled' && o.status !== 'expired')
    .reduce((sum, o) => sum + (o.items ?? []).reduce((s, i) => s + i.price * i.quantity, 0), 0);

  const pendingOrders = orders.filter(o => o.status === 'pending');

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.header}>
  <h1>Order Management</h1>
  <p>View and manage customer orders</p>
</div>

        {/* Currently Serving Panel */}
        <div className={styles.currentTokenPanel}>
          <div className={styles.currentTokenDisplay}>
            <span className={styles.currentTokenLabel}>Currently Serving</span>
            <span className={styles.currentTokenValue}>
              {currentToken ? `#${currentToken}` : '—'}
            </span>
          </div>

          <div className={styles.currentTokenActions}>
            <span className={styles.currentTokenHint}>
              Tap a token to set it as currently serving:
            </span>
            <div className={styles.tokenButtonsGrid}>
              {pendingOrders.map(order => (
                <button
                  key={order.id}
                  className={`${styles.tokenPickButton} ${currentToken === order.token ? styles.tokenPickActive : ''}`}
                  onClick={() => handleSetCurrentToken(order.token)}
                  disabled={settingToken}
                >
                  #{order.token}
                </button>
              ))}
              {pendingOrders.length === 0 && (
                <span className={styles.noTokensHint}>No pending orders</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={`${styles.statCard} ${styles.pending}`}>
            <span className={styles.statLabel}>Pending</span>
            <div className={styles.statValue}>{pendingCount}</div>
          </div>
          <div className={`${styles.statCard} ${styles.served}`}>
            <span className={styles.statLabel}>Served</span>
            <div className={styles.statValue}>{servedCount}</div>
          </div>
          <div className={`${styles.statCard} ${styles.revenue}`}>
            <span className={styles.statLabel}>Revenue</span>
            <div className={styles.statValue}>Rs {totalRevenue.toFixed(2)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          {[
            ['all',       `All (${orders.length})`],
            ['pending',   `Pending (${pendingCount})`],
            ['served',    `Served (${servedCount})`],
            ['cancelled', `Cancelled (${cancelledCount})`],
            ['expired',   `Expired (${expiredCount})`],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`${styles.filterButton} ${filter === val ? styles.active : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-spinner"></div>
        ) : (
          <OrderTable orders={filteredOrders} onMarkServed={handleMarkServed} />
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;