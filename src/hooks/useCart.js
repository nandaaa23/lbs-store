import { useState, useEffect } from 'react';

const clampQuantity = (requested, maxStock) => {
  const safeMax = Math.max(0, Number(maxStock) || 0);
  if (safeMax === 0) {
    return 0;
  }
  return Math.min(Math.max(1, requested), safeMax);
};

export const useCart = () => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart(prevCart => {
      const maxStock = Number(item.stock) || 0;
      if (maxStock <= 0) {
        return prevCart;
      }

      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        if (existingItem.quantity >= maxStock) {
          return prevCart;
        }

        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1, stock: maxStock }
            : cartItem
        );
      }

      return [...prevCart, { ...item, stock: maxStock, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    setCart(prevCart => {
      const itemToUpdate = prevCart.find(item => item.id === itemId);
      if (!itemToUpdate) {
        return prevCart;
      }

      const nextQuantity = clampQuantity(quantity, itemToUpdate.stock);
      if (nextQuantity <= 0) {
        return prevCart.filter(item => item.id !== itemId);
      }

      return prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: nextQuantity } : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  };
};
