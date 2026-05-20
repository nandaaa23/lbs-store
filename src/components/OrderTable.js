import React, { useState, useEffect } from 'react';
import styles from './OrderTable.module.css';

const EXPIRY_MS = 10 * 60 * 1000;

const getBadgeClass = (status) => {
  if (status === 'pending')   return 'badge-warning';
  if (status === 'served')    return 'badge-success';
  if (status === 'expired')   return 'badge-danger';
  return 'badge-danger';
};

const getStatusLabel = (status) => {
  if (status === 'pending')   return 'Pending';
  if (status === 'served')    return 'Served';
  if (status === 'expired')   return 'Expired';
  return 'Cancelled';
};

const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  return new Date(value);
};

// Shows MM:SS countdown for pending orders
const ExpiryTimer = ({ createdAt }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const created = toDate(createdAt);
    if (!created) return;

    const tick = () => {
      const remaining = EXPIRY_MS - (Date.now() - created.getTime());
      setTimeLeft(remaining > 0 ? remaining : 0);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  if (timeLeft === null) return null;
  if (timeLeft === 0) return <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>Expiring...</span>;

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);
  const isUrgent = timeLeft < 2 * 60 * 1000;

  return (
    <span style={{
      fontSize: '0.75rem',
      color: isUrgent ? 'var(--color-danger)' : 'var(--color-text-secondary)',
      fontWeight: isUrgent ? '600' : '400'
    }}>
      ⏱ {mins}:{secs.toString().padStart(2, '0')}
    </span>
  );
};

const OrderTable = ({ orders, onMarkServed }) => {
  if (orders.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h3 className={styles.emptyTitle}>No orders yet</h3>
          <p className={styles.emptyText}>Orders will appear here when students place them</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Token</th>
            <th>Items</th>
            <th>Time</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const date = toDate(order.createdAt);
            return (
              <tr key={order.id}>
                <td>
                  <span className={styles.tokenCell}>#{order.token}</span>
                </td>
                <td>
                  <ul className={styles.itemsList}>
                    {(order.items ?? []).map((item, idx) => (
                      <li key={idx}>{item.name} × {item.quantity}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <div>{date ? date.toLocaleTimeString() : '—'}</div>
                  {order.status === 'pending' && (
                    <ExpiryTimer createdAt={order.createdAt} />
                  )}
                </td>
                <td>
                  <span className={`badge ${getBadgeClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td>
                  {order.status === 'pending' ? (
                    <button
                      onClick={() => onMarkServed(order.id)}
                      className={styles.actionButton}
                    >
                      Mark Served
                    </button>
                  ) : (
                    <span className={styles.completedText}>
                      {order.status === 'expired'   ? 'Expired'   :
                       order.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;