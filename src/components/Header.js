import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

const Header = ({ cartItemsCount = 0 }) => {
  const location = useLocation();
  const isStaffView = location.pathname.startsWith('/staff');

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link to={isStaffView ? '/staff/dashboard' : '/'} className={styles.logo}>
          <span>{isStaffView ? 'Staff Portal' : 'College Store'}</span>
        </Link>

        {!isStaffView && (
          <nav className={styles.nav}>
            <Link to="/status" className={styles.navLink}>
              Track Order
            </Link>
            <Link to="/cart" className={styles.cartButton}>
              Cart
              {cartItemsCount > 0 && (
                <span className={styles.cartBadge}>{cartItemsCount}</span>
              )}
            </Link>
          </nav>
        )}

        {isStaffView && (
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
            <Link to="/" className={styles.navLink}>
              Student View
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
