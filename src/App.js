import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StorePage from "./pages/StorePage";
import CartPage from "./pages/CartPage";
import TokenPage from "./pages/TokenPage";
import StatusPage from "./pages/StatusPage";
import StaffDashboard from "./pages/StaffDashboard";
import InventoryPage from "./pages/InventoryPage";
import SeedItems from "./pages/SeedItems";

const AppLayout = ({ user, role, cart, onAddToCart, onUpdateQuantity, onClearCart }) => {
  const location = useLocation();
  const hideHeader = ['/login', '/register'].includes(location.pathname);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {!hideHeader && <Header cartItemsCount={cartItemsCount} />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/seed" element={<SeedItems />} />

        {/* Public */}
        <Route path="/store" element={<StorePage cart={cart} onAddToCart={onAddToCart} />} />
        <Route path="/token" element={<TokenPage />} />
        <Route path="/status" element={<StatusPage />} />

        {/* Staff store preview — no auth needed */}
        <Route path="/staff/store" element={<StorePage cart={[]} onAddToCart={() => {}} />} />

        {/* Student only */}
        <Route
          path="/cart"
          element={
            user && role === "student"
              ? <CartPage cart={cart} onUpdateQuantity={onUpdateQuantity} onClearCart={onClearCart} />
              : <Navigate to="/login" />
          }
        />

        {/* Staff only */}
        <Route
          path="/staff/dashboard"
          element={user && role === "staff" ? <StaffDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/staff/inventory"
          element={user && role === "staff" ? <InventoryPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </>
  );
};

function App() {
  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart]       = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        setUser(firebaseUser);
        setRole(snap.data()?.role || "student");
      } else {
        setUser(null);
        setRole(null);
        setCart([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((c) => c.id !== itemId));
    } else {
      setCart((prev) => prev.map((c) => c.id === itemId ? { ...c, quantity } : c));
    }
  };

  const handleClearCart = () => setCart([]);

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <AppLayout
        user={user}
        role={role}
        cart={cart}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
      />
    </BrowserRouter>
  );
}

export default App;