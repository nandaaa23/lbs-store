import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { placeOrder } from '../services/api';
import CartItem from '../components/CartItem';
import styles from './CartPage.module.css';

const CartPage = ({ cart, onUpdateQuantity, onRemove, onClearCart, getTotalPrice }) => {
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    setIsPlacingOrder(true);
    try {
      const result = await placeOrder(cart);
      onClearCart();
      navigate('/token', { state: { token: result.token } });
    } catch (error) {
      console.error('Error placing order:', error);

      if (error.code === 'INSUFFICIENT_STOCK' && Array.isArray(error.details)) {
        const message = error.details
          .map(item => `${item.name}: requested ${item.requested}, available ${item.available}`)
          .join('\n');
        alert(`Some items are out of stock or have limited stock:\n${message}`);
      } else {
        alert('Failed to place order. Please try again.');
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
              onClick={() => navigate('/')}
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
                onRemove={onRemove}
              />
            ))}
          </div>

          <div className={styles.summary}>
            <h2>Order Summary</h2>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>Rs {getTotalPrice().toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Service Fee</span>
              <span>Rs 0.00</span>
            </div>

            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>Rs {getTotalPrice().toFixed(2)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className={styles.placeOrderButton}
            >
              {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
            </button>

            <button
              onClick={() => navigate('/')}
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
