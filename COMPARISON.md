## Project Structure

```
college-store-css/
├── src/
│   ├── components/          # 6 components
│   │   ├── CartItem.js + .module.css
│   │   ├── Header.js + .module.css
│   │   ├── ItemCard.js + .module.css
│   │   ├── LoadingSkeleton.js + .module.css
│   │   ├── OrderTable.js + .module.css
│   │   └── TokenDisplay.js + .module.css
│   │
│   ├── pages/               # 6 pages
│   │   ├── CartPage.js + .module.css
│   │   ├── InventoryPage.js + .module.css
│   │   ├── StaffDashboard.js + .module.css
│   │   ├── StatusPage.js + .module.css
│   │   ├── StorePage.js + .module.css
│   │   └── TokenPage.js + .module.css
│   │
│   ├── styles/
│   │   └── global.css       # CSS variables, utilities
│   │
│   ├── data/
│   │   └── storeItems.json  # 8 mock items
│   │
│   ├── hooks/
│   │   └── useCart.js       # Cart management
│   │
│   ├── services/
│   │   └── api.js           # API layer
│   │
│   ├── App.js               # Main component
│   └── index.js             # Entry point
│
├── public/
│   └── index.html
│
├── package.json
├── README.md
├── SETUP.md
└── .gitignore
```

## Features Implemented

### Student View
- ✅ Browse items in responsive grid
- ✅ Product cards with images
- ✅ Stock status badges
- ✅ Add to cart (disabled when out of stock)
- ✅ Shopping cart page
- ✅ Quantity controls (+/-)
- ✅ Remove items
- ✅ Total price calculation
- ✅ Place order button
- ✅ Generate token (e.g., T-105)
- ✅ Order success page
- ✅ Large token display
- ✅ Wait message
- ✅ Status tracking page
- ✅ Current serving token
- ✅ Token lookup
- ✅ Progress indicators
- ✅ Empty cart state

### Staff View
- ✅ Orders dashboard
- ✅ Statistics cards
- ✅ Filter orders (All/Pending/Served)
- ✅ Orders table
- ✅ Token numbers
- ✅ Items list
- ✅ Timestamps
- ✅ Mark as served button
- ✅ Inventory management
- ✅ Stock editing
- ✅ Toggle availability
- ✅ Search functionality
- ✅ Low stock warnings
- ✅ Auto-refresh

### Technical Features
- ✅ React Router v6
- ✅ CSS Modules for scoping
- ✅ Custom hooks (useCart)
- ✅ Service layer pattern
- ✅ LocalStorage persistence
- ✅ Loading skeletons
- ✅ Responsive design
- ✅ Mobile-first
- ✅ Touch-friendly
- ✅ Smooth transitions

## Backend Integration

Easy to connect to real APIs:

```javascript
// services/api.js

// Replace this:
export const getItems = async () => {
  await delay(300);
  return [...storeItems];
};

// With this:
export const getItems = async () => {
  const response = await fetch('/api/items');
  return response.json();
};
```

## Browser Support

✅ Chrome/Edge (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Mobile Safari
✅ Chrome Mobile

## Installation

```bash

# Install
npm install

# Run
npm start
```

Open `http://localhost:3000`

## Routes

### Student
- `/` - Store home
- `/cart` - Shopping cart
- `/token` - Order placed
- `/status` - Track order

### Staff
- `/staff/dashboard` - Orders
- `/staff/inventory` - Stock management

