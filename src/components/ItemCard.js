import React from 'react';
import styles from './ItemCard.module.css';

const ItemCard = ({ item, remainingStock, onAddToCart }) => {
  const inventoryOut = !item.inStock;
  const cartLimitReached = remainingStock <= 0;
  const isOutOfStock = inventoryOut || cartLimitReached;

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img
          src={item.image}
          alt={item.name}
          className={styles.image}
        />
        <span className={`badge ${isOutOfStock ? 'badge-danger' : 'badge-success'} ${styles.badge}`}>
          {isOutOfStock ? 'Out of Stock' : 'In Stock'}
        </span>
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{item.name}</h3>
        <p className={styles.price}>Rs {item.price.toFixed(2)}</p>
        {!isOutOfStock && (
          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            {remainingStock} left
          </p>
        )}

        <button
          onClick={onAddToCart}
          disabled={inventoryOut}
          className={styles.button}
          title={cartLimitReached && !inventoryOut ? 'No more stock available for this item' : ''}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ItemCard;
