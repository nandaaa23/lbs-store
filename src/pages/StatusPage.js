import React, { useState, useEffect } from 'react';
import { listenToOrders, listenToCurrentToken, cancelOrder } from '../services/firebaseApi';
import { useAuth } from '../context/AuthContext';
import styles from './StatusPage.module.css';

const CANCEL_WINDOW_MS = 5 * 60 * 1000;
const EXPIRY_MS        = 10 * 60 * 1000;

const toMs = (v) => {
  if (!v) return 0;
  if (typeof v.toDate === 'function') return v.toDate().getTime();
  if (v.seconds) return v.seconds * 1000;
  return new Date(v).getTime();
};

const StatusPage = () => {
  const { user } = useAuth();
  const [orders, setOrders]             = useState([]);
  const [currentToken, setCurrentToken] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [userToken, setUserToken]       = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const unsubOrders = listenToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    const unsubToken = listenToCurrentToken((token) => {
      setCurrentToken(token);
    });
    return () => { unsubOrders(); unsubToken(); };
  }, []);

  const checkUserToken = () => {
    if (!userToken) return null;
    const order = orders.find(o => o.token === userToken);
    if (!order) return 'not-found';

    

    if (order.status === 'served')    return 'served';
    if (order.status === 'cancelled') return 'cancelled';
    if (order.status === 'expired')   return 'expired';

    const age = Date.now() - toMs(order.createdAt);
    if (age > EXPIRY_MS) return 'expired';

    // ✅ Ownership purely from uid — no localStorage needed
    const isOwner  = !!(user?.uid && order.uid && user.uid === order.uid);
    const canCancel = isOwner && age < CANCEL_WINDOW_MS;

    if (currentToken && order.token === currentToken) {
      return { status: 'current', canCancel, isOwner };

    
    }

    const pending = orders
      .filter(o => o.status === 'pending')
      .sort((a, b) => toMs(a.createdAt) - toMs(b.createdAt));

    const position = pending.findIndex(o => o.token === userToken);
    if (position >= 0) return { status: 'waiting', position, canCancel, isOwner };

    return 'not-found';
  };

  const handleCancel = async () => {
  if (!userToken) return;
  const order = orders.find(o => o.token === userToken);
  if (!order) return;

  // ✅ Must be owner to even reach this — checkUserToken already verified isOwner
  if (!user?.uid) {
    alert('You must be logged in to cancel an order.');
    return;
  }

  if (!window.confirm(`Cancel order #${userToken}?`)) return;
  setIsCancelling(true);
  try {
    await cancelOrder(order.id, user.uid); // ✅ pass uid explicitly
    alert(`Order #${userToken} cancelled.`);
  } catch (error) {
    if (error.code === 'UNAUTHORIZED') {
      alert('You are not authorized to cancel this order.');
    } else if (error.code === 'ORDER_NOT_CANCELLABLE') {
      alert(error.status === 'timeout'
        ? 'Orders can only be cancelled within 5 minutes of placing them.'
        : `This order is already ${error.status}.`
      );
    } else if (error.code === 'ORDER_NOT_FOUND') {
      alert('Order not found. Please verify your token.');
    } else {
      alert('Failed to cancel order. Please try again.');
    }
  } finally {
    setIsCancelling(false);
  }
};
  const status = checkUserToken();

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.header}>
          <h1>Track Your Order</h1>
          <p>Enter your token number to check your order status</p>
        </div>

        <div className={styles.servingSection}>
          {loading ? (
            <div className="loading-spinner"></div>
          ) : currentToken ? (
            <div className={styles.servingCard}>
              <span className={styles.servingLabel}>Now Serving</span>
              <span className={styles.servingNumber}>#{currentToken}</span>
              <div className={styles.liveRow}>
                <span className={styles.liveDot}></span>
                <span className={styles.liveText}>Live</span>
              </div>
            </div>
          ) : (
            <div className={styles.servingCard}>
              <span className={styles.servingLabel}>Now Serving</span>
              <span className={styles.servingNumberEmpty}>—</span>
              <span className={styles.liveText}>No active orders</span>
            </div>
          )}
        </div>

        <div className={styles.checkToken}>
          <h2>Check Your Status</h2>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={userToken}
              onChange={(e) => setUserToken(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter token number (e.g. 5)"
              className={styles.input}
            />
          </div>

          {userToken && (
            <div className={styles.statusArea}>
              {status === 'not-found' && (
                <div className={`${styles.statusCard} ${styles.cardNotFound}`}>
                  <span className={styles.statusIcon}>❓</span>
                  <h3>Token Not Found</h3>
                  <p>No order found for token #{userToken}.</p>
                </div>
              )}

              {status === 'served' && (
                <div className={`${styles.statusCard} ${styles.cardServed}`}>
                  <span className={styles.statusIcon}>✅</span>
                  <h3>Order Completed!</h3>
                  <p>Your order has been served. Please collect from the counter.</p>
                </div>
              )}

              {status === 'cancelled' && (
                <div className={`${styles.statusCard} ${styles.cardNotFound}`}>
                  <span className={styles.statusIcon}>❌</span>
                  <h3>Order Cancelled</h3>
                  <p>This order was cancelled.</p>
                </div>
              )}

              {status === 'expired' && (
                <div className={`${styles.statusCard} ${styles.cardNotFound}`}>
                  <span className={styles.statusIcon}>⏰</span>
                  <h3>Order Expired</h3>
                  <p>This order expired after 10 minutes.</p>
                </div>
              )}

              {status?.status === 'current' && (
                <div className={`${styles.statusCard} ${styles.cardCurrent}`}>
                  <span className={styles.statusIcon}>🔔</span>
                  <h3>{status.isOwner ? 'Your Turn!' : 'Now Serving'}</h3>
                  <p>
                    Token <strong>#{userToken}</strong> is currently being served.
                    {status.isOwner && <><br />Please come to the counter now.</>}
                  </p>
                  {status.isOwner ? (
                    status.canCancel ? (
                      <button onClick={handleCancel} disabled={isCancelling} className={styles.cancelBtn}>
                        {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    ) : (
                      <p className={styles.cancelNote}>⏱ Cancellation window has passed</p>
                    )
                  ) : (
                    <p className={styles.cancelNote}>🔒 This is not your order</p>
                  )}
                </div>
              )}

              {status?.status === 'waiting' && (
                <div className={`${styles.statusCard} ${styles.cardWaiting}`}>
                  <span className={styles.statusIcon}>⏳</span>
                  <h3>{status.isOwner ? 'Your Order is In Queue' : 'Order In Queue'}</h3>
                  <p>
                    <strong>{status.position}</strong> order{status.position > 1 ? 's' : ''} ahead
                  </p>
                  {status.isOwner && (
                    <p className={styles.waitEstimate}>
                      Estimated wait: ~{status.position * 3} min
                    </p>
                  )}
                  {status.isOwner ? (
                    status.canCancel ? (
                      <button onClick={handleCancel} disabled={isCancelling} className={styles.cancelBtn}>
                        {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    ) : (
                      <p className={styles.cancelNote}>⏱ Cancellation window has passed</p>
                    )
                  ) : (
                    <p className={styles.cancelNote}>🔒 This is not your order</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StatusPage;