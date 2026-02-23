import React, { useState, useEffect } from 'react';
import { getOrders, markOrderServed } from '../services/api';
import OrderTable from '../components/OrderTable';
import styles from './StaffDashboard.module.css';

const StaffDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      const sortedOrders = data.sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkServed = async (token) => {
    try {
      await markOrderServed(token);
      await loadOrders();
    } catch (error) {
      console.error('Error marking order as served:', error);
      if (error.code === 'ORDER_NOT_SERVABLE') {
        alert(`Order cannot be marked served because it is ${error.status}.`);
      } else {
        alert('Failed to update order status');
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'pending') return order.status === 'pending';
    if (filter === 'served') return order.status === 'served';
    if (filter === 'cancelled') return order.status === 'cancelled';
    if (filter === 'expired') return order.status === 'expired';
    return true;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const servedCount = orders.filter(o => o.status === 'served').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;
  const expiredCount = orders.filter(o => o.status === 'expired').length;
  const totalRevenue = orders
    .filter(order => order.status !== 'cancelled' && order.status !== 'expired')
    .reduce((sum, order) => {
      const orderTotal = order.items.reduce((itemSum, item) =>
        itemSum + (item.price * item.quantity), 0
      );
      return sum + orderTotal;
    }, 0);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Order Management</h1>
          <p>View and manage customer orders</p>
        </div>

        <div className={styles.stats}>
          <div className={`${styles.statCard} ${styles.pending}`}>
            <span className={styles.statLabel}>Pending Orders</span>
            <div className={styles.statValue}>{pendingCount}</div>
          </div>

          <div className={`${styles.statCard} ${styles.served}`}>
            <span className={styles.statLabel}>Served Orders</span>
            <div className={styles.statValue}>{servedCount}</div>
          </div>

          <div className={`${styles.statCard} ${styles.revenue}`}>
            <span className={styles.statLabel}>Total Revenue</span>
            <div className={styles.statValue}>Rs {totalRevenue.toFixed(2)}</div>
          </div>
        </div>

        <div className={styles.filters}>
          <button
            onClick={() => setFilter('all')}
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('served')}
            className={`${styles.filterButton} ${filter === 'served' ? styles.active : ''}`}
          >
            Served ({servedCount})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`${styles.filterButton} ${filter === 'cancelled' ? styles.active : ''}`}
          >
            Cancelled ({cancelledCount})
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`${styles.filterButton} ${filter === 'expired' ? styles.active : ''}`}
          >
            Expired ({expiredCount})
          </button>
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
