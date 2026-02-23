import React from 'react';
import styles from './LoadingSkeleton.module.css';

const LoadingSkeleton = ({ type = 'card', count = 4 }) => {
  if (type === 'card') {
    return (
      <div className={styles.grid}>
        {[...Array(count)].map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonImage}></div>
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonLine} style={{ width: '70%' }}></div>
              <div className={styles.skeletonLine} style={{ width: '40%' }}></div>
              <div className={styles.skeletonButton}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <div className="loading-spinner"></div>;
};

export default LoadingSkeleton;
