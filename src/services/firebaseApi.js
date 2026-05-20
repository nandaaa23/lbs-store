import {
  collection, addDoc, onSnapshot, updateDoc,
  doc, getDocs, serverTimestamp, query, orderBy, getDoc, setDoc
} from "firebase/firestore";
import { db, auth } from "../firebase";

const itemsRef = collection(db, "items");
const ordersRef = collection(db, "orders");

const generateCancelToken = () =>
  Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);

/* === ITEMS === */
export const getInventory = async () => {
  const snap = await getDocs(itemsRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(item => !item.deleted);
};
export const addInventoryItem = async (item) => {
  return await addDoc(itemsRef, { ...item, createdAt: serverTimestamp() });
};
export const updateInventoryItem = async (id, updates) => {
  await updateDoc(doc(db, "items", id), updates);
};
export const deleteInventoryItem = async (id) => {
  await updateDoc(doc(db, "items", id), { deleted: true });
};
export const getItems = async () => {
  const snap = await getDocs(itemsRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(item => !item.deleted);
};

/* === ORDERS === */
export const placeOrder = async (cartItems) => {
  const today = new Date().toISOString().slice(0, 10);
  const snap = await getDocs(ordersRef);

  const todayTokenNumbers = snap.docs
    .map(d => d.data())
    .filter(o => o.date === today && o.token)
    .map(o => parseInt(o.token, 10))
    .filter(n => !isNaN(n));

  const nextNumber = todayTokenNumbers.length > 0 ? Math.max(...todayTokenNumbers) + 1 : 1;

  const cancelToken = generateCancelToken();

  const docRef = await addDoc(ordersRef, {
    token: String(nextNumber),
    date: today,
    items: cartItems,
    status: "pending",
    uid: auth.currentUser?.uid || null,
    cancelToken,
    createdAt: serverTimestamp()
  });

  return { token: String(nextNumber), orderId: docRef.id, cancelToken };
};

export const listenToOrders = (callback) => {
  return onSnapshot(ordersRef, (snap) => {
    const orders = snap.docs.map(d => {
      const { cancelToken, ...safeData } = d.data();
      return { id: d.id, ...safeData };
    });
    callback(orders);
  });
};

export const markOrderServed = async (id) => {
  const orderRef = doc(db, "orders", id);
  const orderSnap = await getDoc(orderRef);
  const order = orderSnap.data();

  if (!order) throw new Error("Order not found");
  if (order.status !== "pending") throw new Error("Only pending orders can be marked served");

  if (order.items) {
    await Promise.all(
      order.items.map(async (cartItem) => {
        const itemRef = doc(db, "items", cartItem.id);
        const itemSnap = await getDoc(itemRef);
        const itemData = itemSnap.data();
        if (itemData) {
          const newStock = Math.max(0, itemData.stock - cartItem.quantity);
          await updateDoc(itemRef, { stock: newStock, inStock: newStock > 0 });
        }
      })
    );
  }

  await updateDoc(orderRef, { status: "served" });
};

export const markOrderExpired = async (id) => {
  const orderSnap = await getDoc(doc(db, "orders", id));
  const order = orderSnap.data();
  await updateDoc(doc(db, "orders", id), { status: "expired" });

  if (order?.token) {
    const metaSnap = await getDoc(doc(db, "meta", "currentToken"));
    if (metaSnap.exists() && metaSnap.data().token === order.token) {
      await setDoc(doc(db, "meta", "currentToken"), { token: null, updatedAt: serverTimestamp() });
    }
  }
};

const CANCEL_WINDOW_MS = 5 * 60 * 1000;

export const cancelOrder = async (orderId, callerUid) => {
  const orderRef = doc(db, "orders", orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) {
    const err = new Error("Order not found");
    err.code = "ORDER_NOT_FOUND";
    throw err;
  }

  const order = orderSnap.data();

  // ✅ Caller must provide their uid and it must match the order's uid
  if (!callerUid || !order.uid || callerUid !== order.uid) {
    const err = new Error("Unauthorized: you can only cancel your own orders");
    err.code = "UNAUTHORIZED";
    throw err;
  }

  if (["served", "expired", "cancelled"].includes(order.status)) {
    const err = new Error(`Order cannot be cancelled because it is ${order.status}`);
    err.code = "ORDER_NOT_CANCELLABLE";
    err.status = order.status;
    throw err;
  }

  const createdAt = order.createdAt?.toDate?.()
    ?? (order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : null);

  if (!createdAt) {
    const err = new Error("Order timestamp missing, cannot verify cancellation window");
    err.code = "ORDER_NOT_CANCELLABLE";
    err.status = "timeout";
    throw err;
  }

  if (Date.now() - createdAt.getTime() > CANCEL_WINDOW_MS) {
    const err = new Error("Order cannot be cancelled after 5 minutes");
    err.code = "ORDER_NOT_CANCELLABLE";
    err.status = "timeout";
    throw err;
  }

  await updateDoc(orderRef, { status: "cancelled" });
};

export const getOrders = async () => {
  const snap = await getDocs(query(ordersRef, orderBy("createdAt", "asc")));
  return snap.docs.map(d => {
    const { cancelToken, ...safeData } = d.data();
    return { id: d.id, ...safeData };
  });
};

export const setCurrentToken = async (token) => {
  try {
    await setDoc(doc(db, "meta", "currentToken"), { token, updatedAt: serverTimestamp() });
  } catch (err) {
    console.error("setCurrentToken failed:", err);
    throw err;
  }
};

export const listenToCurrentToken = (callback) => {
  return onSnapshot(doc(db, "meta", "currentToken"), (snap) => {
    callback(snap.exists() ? snap.data().token : null);
  });
};

export const getCurrentToken = async () => {
  const snap = await getDoc(doc(db, "meta", "currentToken"));
  return snap.exists() ? snap.data().token : null;
};