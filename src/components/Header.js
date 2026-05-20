import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

const Header = ({ cartItemsCount = 0 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isStaffView = location.pathname.startsWith('/staff');
  const isStaffStorePreview = location.pathname === '/staff/store';

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link to={isStaffView ? '/staff/dashboard' : '/store'} className={styles.logo}>
          <span>{isStaffView ? 'Staff Portal' : 'College Store'}</span>
        </Link>

        {/* Student nav */}
        {!isStaffView && (
          <nav className={styles.nav}>
            <Link to="/status" className={styles.navLink}>Track Order</Link>
            <Link to="/cart" className={styles.cartButton}>
              Cart
              {cartItemsCount > 0 && (
                <span className={styles.cartBadge}>{cartItemsCount}</span>
              )}
            </Link>
          </nav>
        )}

        {/* Staff nav — dashboard pages */}
        {isStaffView && !isStaffStorePreview && (
          <nav className={styles.nav}>
            <Link
              to="/staff/dashboard"
              className={styles.navLink}
              style={location.pathname === '/staff/dashboard' ? { color: 'var(--color-text)' } : {}}
            >
              Orders
            </Link>
            <Link
              to="/staff/inventory"
              className={styles.navLink}
              style={location.pathname === '/staff/inventory' ? { color: 'var(--color-text)' } : {}}
            >
              Inventory
            </Link>
            <Link to="/staff/store" className={styles.navLink}>
              Student View
            </Link>
          </nav>
        )}

        {/* Staff nav — store preview mode */}
        {isStaffStorePreview && (
          <nav className={styles.nav}>
            <span className={styles.previewBadge}>👁 Preview Mode</span>
            <button
              onClick={() => navigate('/staff/dashboard')}
              className={styles.backButton}
            >
              ← Back to Dashboard
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;