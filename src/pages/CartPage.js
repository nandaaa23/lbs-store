import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import styles from './CartPage.module.css';
import { placeOrder } from '../services/firebaseApi';

const CartPage = ({ cart = [], onUpdateQuantity, onClearCart }) => {
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // ✅ Calculate total here instead of relying on a prop that was never passed
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
  if (cart.length === 0) return;

  setIsPlacingOrder(true);
  try {
    const result = await placeOrder(cart);
    onClearCart();
    // ✅ pass cancelToken too
    navigate('/token', {
      state: {
        token: result.token,
        orderId: result.orderId,
        cancelToken: result.cancelToken
      }
    });
  } catch (error) {
    console.error('ORDER ERROR:', error);
    if (error.code === 'permission-denied') {
      alert('Firebase permission issue. Check Firestore rules.');
    } else {
      alert(error.message || 'Failed to place order');
    }
  } finally {
    setIsPlacingOrder(false);
  }
};

  if (cart.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyCart}>
            <h2>Your cart is empty</h2>
            <p>Start shopping and add some items to your cart!</p>
            <button
              onClick={() => navigate('/store')}  // ✅ /store not /
              className={styles.browseButton}
            >
              Browse Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Shopping Cart</h1>
          <p className={styles.itemCount}>
            {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.cartItems}>
            {cart.map(item => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
              />
            ))}
          </div>

          <div className={styles.summary}>
            <h2>Order Summary</h2>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>Rs {totalPrice.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Service Fee</span>
              <span>Rs 0.00</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>Rs {totalPrice.toFixed(2)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className={styles.placeOrderButton}
            >
              {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
            </button>

            <button
              onClick={() => navigate('/store')}  // ✅ /store not /
              className={styles.continueButton}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;