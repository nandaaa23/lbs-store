import React, { useState, useEffect } from 'react';
import { getCurrentToken, getOrders, cancelOrder } from '../services/api';
import TokenDisplay from '../components/TokenDisplay';
import styles from './StatusPage.module.css';

const StatusPage = () => {
  const [currentToken, setCurrentToken] = useState(null);
  const [userToken, setUserToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadCurrentToken();
    const interval = setInterval(loadCurrentToken, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadCurrentToken = async () => {
    try {
      const token = await getCurrentToken();
      const allOrders = await getOrders();
      setCurrentToken(token);
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading token:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserToken = () => {
    if (!userToken) return null;

    const order = orders.find(o => o.token === userToken);
    if (!order) return 'not-found';
    if (order.status === 'served') return 'served';
    if (order.status === 'cancelled') return 'cancelled';
    if (order.status === 'expired') return 'expired';

    const pendingOrders = orders.filter(o => o.status === 'pending');
    const position = pendingOrders.findIndex(o => o.token === userToken);

    if (position === 0) return 'current';
    if (position > 0) return position;
    return 'not-found';
  };

  const handleCancelFromStatus = async () => {
    if (!userToken) {
      return;
    }

    const confirmed = window.confirm(`Cancel order ${userToken}?`);
    if (!confirmed) {
      return;
    }

    setIsCancelling(true);
    try {
      await cancelOrder(userToken);
      await loadCurrentToken();
      alert(`Order ${userToken} cancelled successfully.`);
    } catch (error) {
      console.error('Error cancelling order:', error);
      if (error.code === 'ORDER_NOT_CANCELLABLE') {
        alert(`This order cannot be cancelled because it is ${error.status}.`);
      } else if (error.code === 'ORDER_NOT_FOUND') {
        alert('Order not found. Please verify your token.');
      } else {
        alert('Failed to cancel order. Please try again.');
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const userTokenStatus = checkUserToken();
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Track Your Order</h1>
          <p>Monitor the current token and check your order status</p>
        </div>

        <div className={styles.currentToken}>
          {loading ? (
            <div className="loading-spinner"></div>
          ) : currentToken ? (
            <>
              <TokenDisplay
                token={currentToken}
                label="Currently Serving Token"
                variant="info"
              />
              <div className={styles.liveIndicator}>
                <div className={styles.liveDot}></div>
                <span>Live updates every 5 seconds</span>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <h3>No Active Orders</h3>
              <p>There are no orders being served right now</p>
            </div>
          )}
        </div>

        <div className={styles.checkToken}>
          <h2>Check Your Token Status</h2>

          <div className={styles.inputGroup}>
            <input
              type="text"
              value={userToken}
              onChange={(e) => setUserToken(e.target.value.toUpperCase())}
              placeholder="Enter your token (e.g., T-105)"
              className={styles.input}
            />
            <button
              onClick={() => setUserToken(userToken)}
              className={styles.checkButton}
            >
              Check
            </button>
          </div>

          {userToken && (
            <>
              {userTokenStatus === 'not-found' && (
                <div className={`${styles.statusMessage} ${styles.notFound}`}>
                  <h3>Token Not Found</h3>
                  <p>We couldn't find this token. Please check the number and try again.</p>
                </div>
              )}

              {userTokenStatus === 'served' && (
                <div className={`${styles.statusMessage} ${styles.served}`}>
                  <h3>Order Completed!</h3>
                  <p>Your order has been served. Please collect it from the counter.</p>
                </div>
              )}

              {userTokenStatus === 'cancelled' && (
                <div className={`${styles.statusMessage} ${styles.notFound}`}>
                  <h3>Order Cancelled</h3>
                  <p>This order was cancelled and stock has been restored.</p>
                </div>
              )}

              {userTokenStatus === 'expired' && (
                <div className={`${styles.statusMessage} ${styles.notFound}`}>
                  <h3>Order Expired</h3>
                  <p>This order expired after 10 minutes and stock has been restored.</p>
                </div>
              )}

              {userTokenStatus === 'current' && (
                <div className={`${styles.statusMessage} ${styles.current}`}>
                  <h3>Your Turn - Come to Counter!</h3>
                  <p>Your order is being prepared. Please proceed to the counter.</p>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: '100%' }}></div>
                  </div>
                </div>
              )}

              {typeof userTokenStatus === 'number' && (
                <div className={`${styles.statusMessage} ${styles.waiting}`}>
                  <h3>Your Order is in Queue</h3>
                  <p>
                    There are <strong>{userTokenStatus}</strong> orders ahead of you.
                    Estimated wait: <strong>~{userTokenStatus * 3} minutes</strong>
                  </p>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${Math.max(10, 100 - (userTokenStatus / pendingCount * 100))}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {(userTokenStatus === 'current' || typeof userTokenStatus === 'number') && (
                <button
                  onClick={handleCancelFromStatus}
                  disabled={isCancelling}
                  className={styles.checkButton}
                  style={{ marginTop: '1rem', background: 'var(--color-danger)' }}
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel This Order'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
