import React, { useEffect, useState } from "react";
import {
  getItems,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} from "../services/firebaseApi";
import styles from "./InventoryPage.module.css";

// ── Snacks ──────────────────────────────────────────────────────────────────
// ── Stationery & Print ───────────────────────────────────────────────────────
const PRESET_IMAGES = [
  // SNACKS

{ label: "Veg Puff",        url: "https://images.unsplash.com/photo-1604908177522-0408f8f8e8f4?w=400&h=400&fit=crop" },
  { label: "Chicken Roll",    url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=400&fit=crop" },
  { label: "Samosa",          url: "https://images.unsplash.com/photo-1601050690117-6a8f9c6a2d7d?w=400&h=400&fit=crop" },
  { label: "Masala Maggi",    url: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=400&fit=crop" },
  { label: "Veg Sandwich",    url: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400&h=400&fit=crop" },
  { label: "Cold Coffee",     url: "https://images.unsplash.com/photo-1529892485617-25f63cd7b1e9?w=400&h=400&fit=crop" },
  { label: "Lime Juice",      url: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=400&fit=crop" },
  { label: "Brownie",         url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop" },
  { label: "Tea",             url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop" },
  { label: "Burger",          url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop" },
  { label: "Pizza Slice",     url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop" },
  { label: "Chips / Crisps",  url: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop" },
  { label: "Water Bottle",    url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec6?w=400&h=400&fit=crop" },
  { label: "Fruit Juice",     url: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop" },
  { label: "Cookies",         url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop" },
  { label: "Instant Noodles", url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop" },

  { label: "Notebook",        url: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop" },
  { label: "Pen / Pencil",    url: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=400&fit=crop" },
  { label: "Highlighters",    url: "https://images.unsplash.com/photo-1617957718587-59b41f4fa699?w=400&h=400&fit=crop" },
  { label: "Sticky Notes",    url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=400&fit=crop" },
  { label: "Stapler",         url: "https://images.unsplash.com/photo-1604231800732-c4b4d2cb1567?w=400&h=400&fit=crop" },
  { label: "Scissors",        url: "https://images.unsplash.com/photo-1603513492128-ba7bc9b3e143?w=400&h=400&fit=crop" },
  { label: "Eraser",          url: "https://images.unsplash.com/photo-1577741314755-048d8525d31e?w=400&h=400&fit=crop" },
  { label: "Ruler",           url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop" },
  // PRINT
  { label: "Printed Pages",   url: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop" },
  { label: "Spiral Binding",  url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop" },
  { label: "Lamination",      url: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop" },
  { label: "Colour Print",    url: "https://images.unsplash.com/photo-1562564055-71e051d33c19?w=400&h=400&fit=crop" },

];

const EMPTY_FORM = { name: "", price: "", stock: "", image: "", category: "Snacks" };

const InventoryPage = () => {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerCat, setPickerCat] = useState("Snacks");

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await getItems();
      setItems(data || []);
    } catch (err) {
      console.log("Error loading items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.price || !form.stock) {
      alert("Fill in name, price and stock");
      return;
    }
    const stockNum = Number(form.stock);
    try {
      await addInventoryItem({
        name: form.name,
        price: Number(form.price),
        stock: stockNum,
        inStock: stockNum > 0,
        image: form.image || "",
        category: form.category,
        deleted: false
      });
      setForm(EMPTY_FORM);
      setShowPicker(false);
      loadItems();
    } catch (err) {
      console.log(err);
      alert("Failed to add item");
    }
  };

  const handleUpdateStock = async (id, newStock) => {
    const stockNum = Number(newStock);
    try {
      await updateInventoryItem(id, { stock: stockNum, inStock: stockNum > 0 });
      loadItems();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await deleteInventoryItem(id);
      loadItems();
    } catch (err) {
      console.log(err);
    }
  };

  const visiblePresets = pickerCat === "All"
  ? PRESET_IMAGES
  : PRESET_IMAGES.filter((_, i) => {
      if (pickerCat === "Snacks")     return i < 16;
      if (pickerCat === "Stationery") return i >= 16 && i < 24;
      if (pickerCat === "Print")      return i >= 24;
      return true;
    });

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.hero}>
          <h1>Inventory Management</h1>
          <p>Add and manage store items</p>
        </div>

        {/* ── ADD FORM ── */}
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Add New Item</h2>

          <div className={styles.formBody}>
            {/* Image picker trigger */}
            <div
              className={styles.imagePicker}
              onClick={() => setShowPicker(!showPicker)}
              title="Pick an image"
            >
              {form.image ? (
                <img src={form.image} alt="preview" className={styles.imagePickerImg} />
              ) : (
                <div className={styles.imagePickerPlaceholder}>
                  <span>📷</span>
                  <span>Pick photo</span>
                </div>
              )}
            </div>

            <div className={styles.formFields}>
              <div className={styles.formGrid}>
                <input
                  className={styles.input}
                  placeholder="Item name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  className={styles.input}
                  placeholder="Price (Rs) *"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
                <input
                  className={styles.input}
                  placeholder="Stock *"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
                <select
                  className={styles.input}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option>Snacks</option>
                  <option>Stationery</option>
                  <option>Print</option>
                </select>
              </div>
              <button className={styles.addButton} onClick={handleAdd}>
                + Add Item
              </button>
            </div>
          </div>

          {/* Preset picker */}
          {showPicker && (
            <div className={styles.pickerPanel}>
              <div className={styles.pickerTabs}>
                {["All", "Snacks", "Stationery", "Print"].map(cat => (
                  <button
                    key={cat}
                    className={`${styles.pickerTab} ${pickerCat === cat ? styles.pickerTabActive : ''}`}
                    onClick={() => setPickerCat(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className={styles.presetGrid}>
                {visiblePresets.map((img) => (
                  <div
                    key={img.url}
                    className={`${styles.presetItem} ${form.image === img.url ? styles.presetSelected : ''}`}
                    onClick={() => { setForm({ ...form, image: img.url }); setShowPicker(false); }}
                  >
                    <img src={img.url} alt={img.label} className={styles.presetImg} />
                    <span className={styles.presetLabel}>{img.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── ITEM GRID ── */}
        {loading ? (
          <p className={styles.message}>Loading inventory...</p>
        ) : items.length === 0 ? (
          <p className={styles.message}>No items yet. Add one above.</p>
        ) : (
          <div className={styles.grid}>
            {items.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.imageContainer}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className={styles.image} />
                  ) : (
                    <div className={styles.imageFallback}>No Image</div>
                  )}
                  <span className={`badge ${item.inStock ? 'badge-success' : 'badge-danger'} ${styles.badge}`}>
                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <div className={styles.content}>
                  <h3 className={styles.name}>{item.name}</h3>
                  <p className={styles.price}>Rs {Number(item.price).toFixed(2)}</p>

                  <div className={styles.stockRow}>
                    <span className={styles.stockLabel}>Stock</span>
                    <input
                      type="number"
                      className={styles.stockInput}
                      defaultValue={item.stock}
                      min="0"
                      onBlur={(e) => handleUpdateStock(item.id, e.target.value)}
                    />
                  </div>

                  <button className={styles.deleteButton} onClick={() => handleDelete(item.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;