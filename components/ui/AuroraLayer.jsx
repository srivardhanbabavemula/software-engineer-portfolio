import styles from '@/styles/ui/AuroraLayer.module.css'

/**
 * Soft drifting aurora light behind section content.
 * variant: 'hero' | 'calm' | 'cool' | 'warm' | 'night'
 */
export default function AuroraLayer({ variant = 'calm', grain = true, className = '' }) {
  return (
    <div className={`${styles.aurora} ${styles[variant] ?? ''} ${className}`} aria-hidden>
      <span className={`${styles.blob} ${styles.b1}`} />
      <span className={`${styles.blob} ${styles.b2}`} />
      <span className={`${styles.blob} ${styles.b3}`} />
      {grain && <span className={styles.grain} />}
    </div>
  )
}
