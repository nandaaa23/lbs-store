# College Store Management System

A responsive frontend web application for managing a college store with separate views for students and staff. Built with React and CSS Modules.

## Features

### Student View
- Browse store items in a responsive grid
- Add items to cart with quantity controls
- Place orders and receive token numbers
- Track order status in real-time

### Staff View
- View and manage all orders
- Mark orders as served
- Manage inventory stock levels
- Real-time order statistics

## Tech Stack

- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **CSS Modules** - Scoped component styling
- **LocalStorage** - Mock data persistence

## Project Structure

```
college-store-css/
├── public/
│   └── index.html
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── CartItem.js
│   │   ├── CartItem.module.css
│   │   ├── Header.js
│   │   ├── Header.module.css
│   │   ├── ItemCard.js
│   │   ├── ItemCard.module.css
│   │   ├── LoadingSkeleton.js
│   │   ├── LoadingSkeleton.module.css
│   │   ├── OrderTable.js
│   │   ├── OrderTable.module.css
│   │   ├── TokenDisplay.js
│   │   └── TokenDisplay.module.css
│   ├── pages/             # Page components
│   │   ├── CartPage.js
│   │   ├── CartPage.module.css
│   │   ├── InventoryPage.js
│   │   ├── InventoryPage.module.css
│   │   ├── StaffDashboard.js
│   │   ├── StaffDashboard.module.css
│   │   ├── StatusPage.js
│   │   ├── StatusPage.module.css
│   │   ├── StorePage.js
│   │   └── StorePage.module.css
│   ├── styles/            # Global styles
│   │   └── global.css
│   ├── data/              # Mock data
│   │   └── storeItems.json
│   ├── hooks/             # Custom React hooks
│   │   └── useCart.js
│   ├── services/          # API service layer
│   │   └── api.js
│   ├── App.js            # Main app component
│   └── index.js          # Entry point
├── package.json
└── README.md
```

## Routes

### Student Routes
- `/` - Store homepage with items grid
- `/cart` - Shopping cart
- `/token` - Order success page with token
- `/status` - Track order status

### Staff Routes
- `/staff/dashboard` - Order management
- `/staff/inventory` - Inventory management

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

3. **Build for production:**
   ```bash
   npm run build
   ```

## Backend Integration

To connect to a real backend:

1. **Update API service** (`src/services/api.js`):
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL;
   
   export const getItems = async () => {
     const response = await fetch(`${API_URL}/items`);
     return response.json();
   };
   ```

2. **Add environment variables**:
   ```bash
   REACT_APP_API_URL=https://api.your-backend.com
   ```

3. **Handle authentication**:
   - Add token storage
   - Include auth headers
   - Handle token refresh

## Component Documentation

### ItemCard
Displays a store item with image, price, and stock status.

**Props:**
- `item` - Item object
- `onAddToCart` - Callback function

### CartItem
Shows cart item with quantity controls.

**Props:**
- `item` - Cart item object
- `onUpdateQuantity` - Update quantity callback
- `onRemove` - Remove item callback

### TokenDisplay
Large, prominent token number display.

**Props:**
- `token` - Token string
- `label` - Display label
- `variant` - "success" or "info"

### OrderTable
Table of orders with management controls.

**Props:**
- `orders` - Array of order objects
- `onMarkServed` - Mark served callback

### LoadingSkeleton
Animated loading placeholder.

**Props:**
- `type` - "card" or other
- `count` - Number of skeletons

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- No authentication (as per requirements)
- No backend connection (frontend only)
- Uses mock data for demonstration
- LocalStorage for demo persistence
- Ready for backend API integration
- No Tailwind CSS (plain CSS/CSS Modules only)

## Future Enhancements

When connecting to backend:
- User authentication
- Real-time WebSocket updates
- Payment integration
- Order history
- Advanced inventory management
- Analytics dashboard
- Email notifications
- Receipt printing

## License

MIT License - Free for educational use
