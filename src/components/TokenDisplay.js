import React from 'react';
import styles from './TokenDisplay.module.css';

const TokenDisplay = ({ token, label = "Your Token", variant = "success" }) => {
  return (
    <div className={`${styles.tokenDisplay} ${styles[variant]}`}>
      <div className={styles.label}>{label}</div>
      <div className={styles.tokenContainer}>
        <div className={styles.token}>{token}</div>
      </div>
    </div>
  );
};

export default TokenDisplay;
