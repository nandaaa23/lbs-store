import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { cancelOrder } from '../services/firebaseApi';
import TokenDisplay from '../components/TokenDisplay';
import styles from './TokenPage.module.css';
import { auth } from '../firebase';

const TokenPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, orderId } = location.state || {};
  const [isCancelling, setIsCancelling] = useState(false);

  if (!token) {
    return <Navigate to="/store" replace />;
  }

 const handleCancelOrder = async () => {
  if (!orderId) {
    alert('Cannot cancel: order ID missing.');
    return;
  }
  if (!window.confirm('Are you sure you want to cancel this order?')) return;

  setIsCancelling(true);
  try {
    await cancelOrder(orderId, auth.currentUser?.uid); // ✅ pass uid
    alert(`Order ${token} cancelled successfully.`);
    navigate('/status');
  } catch (error) {
    console.error('Error cancelling order:', error);
    if (error.code === 'ORDER_NOT_CANCELLABLE') {
      alert(error.status === 'timeout'
        ? 'Orders can only be cancelled within 5 minutes of placing them.'
        : `This order is already ${error.status}.`
      );
    } else if (error.code === 'UNAUTHORIZED') {
      alert('You are not authorized to cancel this order.');
    } else {
      alert('Failed to cancel order. Please try again.');
    }
  } finally {
    setIsCancelling(false);
  }
};

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.successIcon}>
          <div>OK</div>
        </div>

        <div className={styles.header}>
          <h1>Order Placed Successfully!</h1>
          <p>Your order has been received</p>
        </div>

        <div className={styles.tokenContainer}>
          <TokenDisplay token={token} label="Your Order Token" variant="success" />
        </div>

        <div className={styles.message}>
          <p><strong>Please wait for your turn</strong></p>
          <p className="text-muted">Keep this token number safe and monitor the status page</p>
        </div>

        <div className={styles.actions}>
          <button onClick={() => navigate('/status')} className={styles.primaryButton}>
            Track Order Status
          </button>
          <button
            onClick={handleCancelOrder}
            disabled={isCancelling}
            className={styles.secondaryButton}
            style={{ background: 'var(--color-danger)', color: 'white' }}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel This Order'}
          </button>
          <button onClick={() => navigate('/store')} className={styles.secondaryButton}>
            Browse More Items
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenPage;