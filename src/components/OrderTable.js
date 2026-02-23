import React from 'react';
import styles from './OrderTable.module.css';

const getBadgeClass = (status) => {
  if (status === 'pending') return 'badge-warning';
  if (status === 'served') return 'badge-success';
  if (status === 'expired') return 'badge-danger';
  return 'badge-danger';
};

const getStatusLabel = (status) => {
  if (status === 'pending') return 'Pending';
  if (status === 'served') return 'Served';
  if (status === 'expired') return 'Expired';
  return 'Cancelled';
};

const OrderTable = ({ orders, onMarkServed }) => {
  if (orders.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>List</div>
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
          {orders.map((order, index) => (
            <tr key={index}>
              <td>
                <span className={styles.tokenCell}>{order.token}</span>
              </td>
              <td>
                <ul className={styles.itemsList}>
                  {order.items.map((item, idx) => (
                    <li key={idx}>{item.name} x {item.quantity}</li>
                  ))}
                </ul>
              </td>
              <td>{new Date(order.timestamp).toLocaleTimeString()}</td>
              <td>
                <span className={`badge ${getBadgeClass(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </td>
              <td>
                {order.status === 'pending' ? (
                  <button
                    onClick={() => onMarkServed(order.token)}
                    className={styles.actionButton}
                  >
                    Mark Served
                  </button>
                ) : order.status === 'expired' ? (
                  <span className={styles.completedText}>Expired</span>
                ) : order.status === 'cancelled' ? (
                  <span className={styles.completedText}>Cancelled</span>
                ) : (
                  <span className={styles.completedText}>Completed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
