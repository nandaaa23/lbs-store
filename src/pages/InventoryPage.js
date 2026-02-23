import React, { useState, useEffect } from 'react';
import { getInventory, updateInventoryItem, addInventoryItem, deleteInventoryItem } from '../services/api';
import styles from './InventoryPage.module.css';

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    stock: '',
    image: ''
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await getInventory();
      setItems(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item.id);
    setEditStock(item.stock.toString());
    setEditPrice(item.price.toString());
  };

  const handleSaveItem = async (item) => {
    const stock = parseInt(editStock, 10);
    const price = parseFloat(editPrice);

    if (isNaN(stock) || stock < 0) {
      alert('Please enter a valid stock number');
      return;
    }

    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    try {
      await updateInventoryItem(item.id, { stock, price });
      await loadInventory();
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    }
  };

  const handleToggleStock = async (item) => {
    try {
      await updateInventoryItem(item.id, {
        stock: item.inStock ? 0 : Math.max(item.stock, 1)
      });
      await loadInventory();
    } catch (error) {
      console.error('Error toggling stock:', error);
      alert('Failed to toggle stock status');
    }
  };

  const handleAddItem = async (event) => {
    event.preventDefault();

    const stock = parseInt(newItem.stock, 10);
    const price = parseFloat(newItem.price);

    if (!newItem.name.trim()) {
      alert('Please enter an item name');
      return;
    }

    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    if (isNaN(stock) || stock < 0) {
      alert('Please enter a valid stock number');
      return;
    }

    try {
      await addInventoryItem({
        name: newItem.name,
        price,
        stock,
        image: newItem.image
      });
      setNewItem({ name: '', price: '', stock: '', image: '' });
      await loadInventory();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    }
  };

  const handleDeleteItem = async (item) => {
    const confirmed = window.confirm(`Delete "${item.name}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setDeletingItemId(item.id);
    try {
      await deleteInventoryItem(item.id);
      await loadInventory();
      alert(`${item.name} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    } finally {
      setDeletingItemId(null);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inStockCount = items.filter(i => i.inStock).length;
  const outOfStockCount = items.filter(i => !i.inStock).length;
  const totalItems = items.reduce((sum, item) => sum + item.stock, 0);
  const lowStockCount = items.filter(i => i.stock > 0 && i.stock < 10).length;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Inventory Management</h1>
          <p>Manage stock levels, pricing, and item availability</p>
        </div>

        <form onSubmit={handleAddItem} className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Add New Item</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr auto', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              required
            />
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Price"
              value={newItem.price}
              onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
              className="input"
              required
            />
            <input
              type="number"
              min="0"
              placeholder="Stock"
              value={newItem.stock}
              onChange={(e) => setNewItem(prev => ({ ...prev, stock: e.target.value }))}
              className="input"
              required
            />
            <input
              type="url"
              placeholder="Image URL (optional)"
              value={newItem.image}
              onChange={(e) => setNewItem(prev => ({ ...prev, image: e.target.value }))}
              className="input"
            />
            <button type="submit" className="btn btn-primary">Add Item</button>
          </div>
        </form>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Total Items</span>
              <div className={styles.statIcon} />
            </div>
            <div className={styles.statValue}>{totalItems}</div>
            <div className={styles.statDescription}>units in stock</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>In Stock</span>
              <div className={styles.statIcon} />
            </div>
            <div className={styles.statValue}>{inStockCount}</div>
            <div className={styles.statDescription}>items available</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Out of Stock</span>
              <div className={styles.statIcon} />
            </div>
            <div className={styles.statValue}>{outOfStockCount}</div>
            <div className={styles.statDescription}>items unavailable</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Low Stock</span>
              <div className={styles.statIcon} />
            </div>
            <div className={styles.statValue}>{lowStockCount}</div>
            <div className={styles.statDescription}>items &lt; 10 units</div>
          </div>
        </div>

        <div className={styles.searchBar}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items..."
            className={styles.searchInput}
          />
        </div>

        {loading ? (
          <div className="loading-spinner"></div>
        ) : (
          <div className={styles.inventoryTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className={styles.itemInfo}>
                        <img src={item.image} alt={item.name} className={styles.itemImage} />
                        <span className={styles.itemName}>{item.name}</span>
                      </div>
                    </td>
                    <td>
                      {editingItem === item.id ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className={styles.stockInput}
                          min="0.01"
                          step="0.01"
                        />
                      ) : (
                        <>Rs {item.price.toFixed(2)}</>
                      )}
                    </td>
                    <td>
                      {editingItem === item.id ? (
                        <div className={styles.stockControls}>
                          <input
                            type="number"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className={styles.stockInput}
                            min="0"
                          />
                          <button
                            onClick={() => handleSaveItem(item)}
                            className={`${styles.iconButton} ${styles.save}`}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className={`${styles.iconButton} ${styles.cancel}`}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className={styles.stockControls}>
                          <span className={`${styles.stockDisplay} ${
                            item.stock === 0 ? styles.out : item.stock < 10 ? styles.low : ''
                          }`}>
                            {item.stock} units
                          </span>
                          <button
                            onClick={() => handleEditClick(item)}
                            className={`${styles.iconButton} ${styles.edit}`}
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${item.inStock ? 'badge-success' : 'badge-danger'}`}>
                        {item.inStock ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleToggleStock(item)}
                          className={styles.toggleButton}
                          style={{
                            background: item.inStock ? 'var(--color-danger)' : 'var(--color-success)',
                            color: 'white'
                          }}
                        >
                          {item.inStock ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className={styles.toggleButton}
                          disabled={deletingItemId === item.id}
                          style={{
                            background: '#7f1d1d',
                            color: 'white',
                            opacity: deletingItemId === item.id ? 0.7 : 1
                          }}
                        >
                          {deletingItemId === item.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
