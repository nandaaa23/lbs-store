import React, { useState, useEffect } from 'react';
import { getItems } from '../services/api';
import ItemCard from '../components/ItemCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import styles from './StorePage.module.css';

const StorePage = ({ cart, onAddToCart }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getItems();
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCartQuantity = (itemId) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (item) => {
    const inCart = getCartQuantity(item.id);
    const remainingStock = Math.max(0, item.stock - inCart);

    if (remainingStock <= 0) {
      alert(`${item.name} is out of stock`);
      return;
    }

    onAddToCart(item);
  };

  const visibleItems = items.filter(item => item.inStock && item.stock > 0);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1>Welcome to College Store</h1>
          <p>Browse our collection of college essentials</p>
        </div>

        {loading ? (
          <LoadingSkeleton type="card" count={8} />
        ) : (
          <div className={styles.grid}>
            {visibleItems.map(item => {
              const inCart = getCartQuantity(item.id);
              const remainingStock = Math.max(0, item.stock - inCart);

              return (
                <ItemCard
                  key={item.id}
                  item={item}
                  remainingStock={remainingStock}
                  onAddToCart={() => handleAddToCart(item)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePage;
