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
{ label: "Veg Puff",        url: "https://picsum.photos/seed/vegpuff/400/400" },
{ label: "Chicken Roll",    url: "https://picsum.photos/seed/chickenroll/400/400" },
{ label: "Samosa",          url: "https://picsum.photos/seed/samosa/400/400" },
{ label: "Masala Maggi",    url: "https://picsum.photos/seed/maggi/400/400" },
{ label: "Veg Sandwich",    url: "https://picsum.photos/seed/sandwich/400/400" },
{ label: "Cold Coffee",     url: "https://picsum.photos/seed/coldcoffee/400/400" },
{ label: "Lime Juice",      url: "https://picsum.photos/seed/limejuice/400/400" },
{ label: "Brownie",         url: "https://picsum.photos/seed/brownie/400/400" },
{ label: "Tea",             url: "https://picsum.photos/seed/tea/400/400" },
{ label: "Burger",          url: "https://picsum.photos/seed/burger/400/400" },
{ label: "Pizza Slice",     url: "https://picsum.photos/seed/pizza/400/400" },
{ label: "Chips / Crisps",  url: "https://picsum.photos/seed/chips/400/400" },
{ label: "Water Bottle",    url: "https://picsum.photos/seed/waterbottle/400/400" },
{ label: "Fruit Juice",     url: "https://picsum.photos/seed/fruitjuice/400/400" },
{ label: "Cookies",         url: "https://picsum.photos/seed/cookies/400/400" },
{ label: "Instant Noodles", url: "https://picsum.photos/seed/noodles/400/400" },
  // STATIONERY
{ label: "Notebook",        url: "https://picsum.photos/seed/notebook/400/400" },
{ label: "Pen / Pencil",    url: "https://picsum.photos/seed/pen/400/400" },
{ label: "Highlighters",    url: "https://picsum.photos/seed/highlight/400/400" },
{ label: "Sticky Notes",    url: "https://picsum.photos/seed/sticky/400/400" },
{ label: "Stapler",         url: "https://picsum.photos/seed/stapler/400/400" },
{ label: "Scissors",        url: "https://picsum.photos/seed/scissors/400/400" },
{ label: "Eraser",          url: "https://picsum.photos/seed/eraser/400/400" },
{ label: "Ruler",           url: "https://picsum.photos/seed/ruler/400/400" },
// PRINT
{ label: "Printed Pages",   url: "https://picsum.photos/seed/printpage/400/400" },
{ label: "Spiral Binding",  url: "https://picsum.photos/seed/spiral/400/400" },
{ label: "Lamination",      url: "https://picsum.photos/seed/laminate/400/400" },
{ label: "Colour Print",    url: "https://picsum.photos/seed/colourprint/400/400" },
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