import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  serverTimestamp
} from "firebase/firestore";

import { db, auth } from "../firebase";

const itemsRef = collection(db, "items");
const ordersRef = collection(db, "orders");

/* =========================
   ITEMS (Inventory)
========================= */
export const getInventory = async () => {
  const snap = await getDocs(itemsRef);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(item => !item.deleted);
};

export const addInventoryItem = async (item) => {
  return await addDoc(itemsRef, {
    ...item,
    createdAt: serverTimestamp()
  });
};

export const updateInventoryItem = async (id, updates) => {
  await updateDoc(doc(db, "items", id), updates);
};

export const deleteInventoryItem = async (id) => {
  await updateDoc(doc(db, "items", id), { deleted: true });
};

/* =========================
   ITEMS (Store — student view)
========================= */
export const getItems = async () => {
  const snap = await getDocs(itemsRef);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(item => !item.deleted);
};

/* =========================
   ORDERS
========================= */
export const placeOrder = async (cartItems) => {
  const token = `T-${Math.floor(Math.random() * 900 + 100)}`;

  const docRef = await addDoc(ordersRef, {
    token,
    items: cartItems,
    status: "pending",
    uid: auth.currentUser?.uid || null,
    createdAt: serverTimestamp()
  });

  return { token, orderId: docRef.id };
};

export const listenToOrders = (callback) => {
  return onSnapshot(ordersRef, (snap) => {
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(orders);
  });
};

export const markOrderServed = async (id) => {
  // 1. Get the order to find its items
  const orderSnap = await getDocs(ordersRef);
  const order = orderSnap.docs
    .find(d => d.id === id)
    ?.data();

  // 2. Decrement stock for each item sold
  if (order?.items) {
    await Promise.all(
      order.items.map(async (cartItem) => {
        const itemRef = doc(db, "items", cartItem.id);
        const itemSnap = await getDocs(collection(db, "items"));
        const itemData = itemSnap.docs.find(d => d.id === cartItem.id)?.data();

        if (itemData) {
          const newStock = Math.max(0, itemData.stock - cartItem.quantity);
          await updateDoc(itemRef, {
            stock: newStock,
            inStock: newStock > 0
          });
        }
      })
    );
  }

  // 3. Mark order as served
  await updateDoc(doc(db, "orders", id), { status: "served" });
};

// ✅ NEW — called automatically when a pending order is older than 20 minutes.
// Expired orders are excluded from revenue calculations.
export const markOrderExpired = async (id) => {
  await updateDoc(doc(db, "orders", id), {
    status: "expired"
  });
};

export const cancelOrder = async (id) => {
  await updateDoc(doc(db, "orders", id), {
    status: "cancelled"
  });
};

export const getOrders = async () => {
  const snap = await getDocs(ordersRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getCurrentToken = async () => {
  const snap = await getDocs(ordersRef);
  const pending = snap.docs
    .map(d => d.data())
    .filter(o => o.status === "pending");
  return pending.length ? pending[0].token : null;
};