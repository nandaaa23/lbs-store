## Quick Test

### Student Flow:
1. Browse items on homepage
2. Click "Add to Cart" on in-stock items
3. View cart (top right)
4. Adjust quantities
5. Click "Place Order"
6. Note your token (e.g., T-105)
7. Check status page

### Staff Flow:
1. Navigate to `/staff/dashboard`
2. View orders with tokens
3. Click "Mark Served"
4. Go to `/staff/inventory`
5. Edit stock numbers
6. Toggle item availability

## Backend Ready

All API logic is in `src/services/api.js`:

```javascript
// Current (mock)
export const getItems = async () => {
  return mockData;
};

// Future (real API)
export const getItems = async () => {
  const response = await fetch('/api/items');
  return response.json();
};
```