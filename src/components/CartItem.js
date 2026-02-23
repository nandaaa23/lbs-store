import React from 'react';
import styles from './CartItem.module.css';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const maxReached = item.quantity >= (Number(item.stock) || 0);

  return (
    <div className={styles.cartItem}>
      <img
        src={item.image}
        alt={item.name}
        className={styles.image}
      />

      <div className={styles.details}>
        <h3 className={styles.name}>{item.name}</h3>
        <p className={styles.price}>Rs {item.price.toFixed(2)}</p>
        <p style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Available stock: {item.stock}
        </p>

        <div className={styles.controls}>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className={styles.quantityButton}
          >
            -
          </button>
          <span className={styles.quantity}>{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className={styles.quantityButton}
            disabled={maxReached}
            title={maxReached ? 'Maximum available stock reached' : 'Increase quantity'}
          >
            +
          </button>

          <button
            onClick={() => onRemove(item.id)}
            className={styles.removeButton}
          >
            Remove
          </button>
        </div>
      </div>

      <div className={styles.subtotal}>
        <div className={styles.subtotalLabel}>Subtotal</div>
        <div className={styles.subtotalValue}>
          Rs {(item.price * item.quantity).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default CartItem;
