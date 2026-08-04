import styles from './AppShell.module.css';

export function AppShell({ eyebrow, title, subtitle, children }) {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
