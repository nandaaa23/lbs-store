// API Service Layer - Replace with real API calls later
import storeItems from '../data/storeItems.json';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const INVENTORY_KEY = 'inventory';
const ORDER_EXPIRY_MINUTES = 10;
const ORDER_EXPIRY_MS = ORDER_EXPIRY_MINUTES * 60 * 1000;

const getStoredInventory = () => {
  const stored = localStorage.getItem(INVENTORY_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(storeItems));
  return [...storeItems];
};

const restoreItemsToInventory = (orderItems) => {
  const inventory = getStoredInventory();
  const restoredInventory = inventory.map((inventoryItem) => {
    const restoredItem = orderItems.find(item => item.id === inventoryItem.id);
    if (!restoredItem) {
      return inventoryItem;
    }

    const nextStock = (Number(inventoryItem.stock) || 0) + restoredItem.quantity;
    return {
      ...inventoryItem,
      stock: nextStock,
      inStock: nextStock > 0
    };
  });

  localStorage.setItem(INVENTORY_KEY, JSON.stringify(restoredInventory));
};

const isOrderExpired = (order) => {
  const orderTime = new Date(order.timestamp).getTime();
  if (!Number.isFinite(orderTime)) {
    return false;
  }
  return Date.now() - orderTime >= ORDER_EXPIRY_MS;
};

export const expirePendingOrders = async () => {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const toExpire = orders.filter(order => order.status === 'pending' && isOrderExpired(order));

  if (toExpire.length === 0) {
    return [];
  }

  const nowIso = new Date().toISOString();
  const updatedOrders = orders.map(order =>
    toExpire.some(expired => expired.token === order.token)
      ? { ...order, status: 'expired', expiredAt: nowIso }
      : order
  );
  localStorage.setItem('orders', JSON.stringify(updatedOrders));

  toExpire.forEach(order => restoreItemsToInventory(order.items));
  return toExpire.map(order => order.token);
};

// Get all store items
export const getItems = async () => {
  await delay(300);
  return getStoredInventory();
};

// Get single item by ID
export const getItemById = async (id) => {
  await delay(200);
  const items = getStoredInventory();
  return items.find(item => item.id === parseInt(id, 10));
};

// Place order and generate token
export const placeOrder = async (cartItems) => {
  await delay(500);
  await expirePendingOrders();

  const inventory = getStoredInventory();
  const insufficientItems = [];

  cartItems.forEach((cartItem) => {
    const inventoryItem = inventory.find(item => item.id === cartItem.id);
    const availableStock = inventoryItem ? Number(inventoryItem.stock) || 0 : 0;

    if (!inventoryItem || !inventoryItem.inStock || availableStock < cartItem.quantity) {
      insufficientItems.push({
        id: cartItem.id,
        name: cartItem.name,
        requested: cartItem.quantity,
        available: availableStock
      });
    }
  });

  if (insufficientItems.length > 0) {
    const error = new Error('INSUFFICIENT_STOCK');
    error.code = 'INSUFFICIENT_STOCK';
    error.details = insufficientItems;
    throw error;
  }

  const updatedInventory = inventory.map((inventoryItem) => {
    const cartItem = cartItems.find(item => item.id === inventoryItem.id);
    if (!cartItem) {
      return inventoryItem;
    }

    const nextStock = Math.max(0, inventoryItem.stock - cartItem.quantity);
    return {
      ...inventoryItem,
      stock: nextStock,
      inStock: nextStock > 0
    };
  });

  localStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));

  const tokenNumber = Math.floor(Math.random() * 900) + 100;
  const token = `T-${tokenNumber}`;

  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const newOrder = {
    token,
    items: cartItems,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));

  return { token };
};

// Cancel a pending order and restore stock
export const cancelOrder = async (token) => {
  await delay(250);
  await expirePendingOrders();

  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const targetOrder = orders.find(order => order.token === token);

  if (!targetOrder) {
    const error = new Error('ORDER_NOT_FOUND');
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }

  if (targetOrder.status !== 'pending') {
    const error = new Error('ORDER_NOT_CANCELLABLE');
    error.code = 'ORDER_NOT_CANCELLABLE';
    error.status = targetOrder.status;
    throw error;
  }

  const updatedOrders = orders.map(order =>
    order.token === token
      ? { ...order, status: 'cancelled', cancelledAt: new Date().toISOString() }
      : order
  );
  localStorage.setItem('orders', JSON.stringify(updatedOrders));

  restoreItemsToInventory(targetOrder.items);
  return updatedOrders.find(order => order.token === token);
};

// Get all orders
export const getOrders = async () => {
  await delay(300);
  await expirePendingOrders();
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  return orders;
};

// Mark order as served
export const markOrderServed = async (token) => {
  await delay(200);
  await expirePendingOrders();
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const targetOrder = orders.find(order => order.token === token);

  if (!targetOrder) {
    const error = new Error('ORDER_NOT_FOUND');
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }

  if (targetOrder.status !== 'pending') {
    const error = new Error('ORDER_NOT_SERVABLE');
    error.code = 'ORDER_NOT_SERVABLE';
    error.status = targetOrder.status;
    throw error;
  }

  const updatedOrders = orders.map(order =>
    order.token === token ? { ...order, status: 'served', servedAt: new Date().toISOString() } : order
  );
  localStorage.setItem('orders', JSON.stringify(updatedOrders));
  return updatedOrders.find(order => order.token === token);
};

// Get currently serving token
export const getCurrentToken = async () => {
  await delay(200);
  await expirePendingOrders();
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const pendingOrders = orders
    .filter(order => order.status === 'pending')
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  return pendingOrders.length > 0 ? pendingOrders[0].token : null;
};

// Update item stock (kept for compatibility)
export const updateStock = async (itemId, newStock, inStock) => {
  await delay(300);
  const items = getStoredInventory();
  const normalizedStock = Number(newStock);
  const updatedItems = items.map(item =>
    item.id === itemId
      ? {
          ...item,
          stock: normalizedStock,
          inStock: typeof inStock === 'boolean' ? inStock : normalizedStock > 0
        }
      : item
  );
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedItems));
  return updatedItems.find(item => item.id === itemId);
};

// Update item fields such as price and stock
export const updateInventoryItem = async (itemId, updates) => {
  await delay(300);
  const items = getStoredInventory();

  const updatedItems = items.map(item => {
    if (item.id !== itemId) {
      return item;
    }

    const nextStock = updates.stock !== undefined ? Number(updates.stock) : item.stock;
    const nextPrice = updates.price !== undefined ? Number(updates.price) : item.price;

    return {
      ...item,
      ...updates,
      stock: nextStock,
      price: nextPrice,
      inStock: nextStock > 0
    };
  });

  localStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedItems));
  return updatedItems.find(item => item.id === itemId);
};

// Add new inventory item
export const addInventoryItem = async (itemData) => {
  await delay(300);
  const items = getStoredInventory();

  const nextId = items.length ? Math.max(...items.map(item => item.id)) + 1 : 1;
  const stock = Number(itemData.stock);
  const price = Number(itemData.price);

  const newItem = {
    id: nextId,
    name: itemData.name.trim(),
    price,
    image: itemData.image?.trim() || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
    stock,
    inStock: stock > 0
  };

  const updatedItems = [...items, newItem];
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedItems));
  return newItem;
};

// Delete an inventory item and clean up cart references
export const deleteInventoryItem = async (itemId) => {
  await delay(300);
  const items = getStoredInventory();
  const targetItem = items.find(item => item.id === itemId);

  if (!targetItem) {
    const error = new Error('ITEM_NOT_FOUND');
    error.code = 'ITEM_NOT_FOUND';
    throw error;
  }

  const updatedItems = items.filter(item => item.id !== itemId);
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedItems));

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const updatedCart = cart.filter(item => item.id !== itemId);
  localStorage.setItem('cart', JSON.stringify(updatedCart));

  return targetItem;
};

// Get inventory
export const getInventory = async () => {
  await delay(300);
  return getStoredInventory();
};
