import styles from './live.module.css';

/* eslint-disable-next-line */
export interface LiveProps {}

export function Live(props: LiveProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Live!</h1>
    </div>
  );
}

export default Live;
