import styles from './headquarter.module.css';

/* eslint-disable-next-line */
export interface HeadquarterProps {}

export function Headquarter(props: HeadquarterProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Headquarter!</h1>
    </div>
  );
}

export default Headquarter;
