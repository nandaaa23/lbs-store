import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useCart } from './hooks/useCart';
import Header from './components/Header';
import StorePage from './pages/StorePage';
import CartPage from './pages/CartPage';
import TokenPage from './pages/TokenPage';
import StatusPage from './pages/StatusPage';
import StaffDashboard from './pages/StaffDashboard';
import InventoryPage from './pages/InventoryPage';

function App() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  } = useCart();

  return (
    <BrowserRouter>
      <div className="App">
        <Header cartItemsCount={getTotalItems()} />

        <Routes>
          <Route
            path="/"
            element={<StorePage cart={cart} onAddToCart={addToCart} />}
          />
          <Route
            path="/cart"
            element={
              <CartPage
                cart={cart}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                onClearCart={clearCart}
                getTotalPrice={getTotalPrice}
              />
            }
          />
          <Route path="/token" element={<TokenPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/inventory" element={<InventoryPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
