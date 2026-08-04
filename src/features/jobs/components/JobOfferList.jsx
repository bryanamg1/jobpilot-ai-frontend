import { dashboardText } from '../../../constants/dashboardText.js';
import { JobOfferCard } from './JobOfferCard.jsx';
import styles from './JobOfferList.module.css';

export function JobOfferList({ jobs }) {
  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h2>{dashboardText.list.title}</h2>
      </div>

      {jobs.length ? (
        <div className={styles.list}>
          {jobs.map((job) => (
            <JobOfferCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>{dashboardText.list.empty}</div>
      )}
    </section>
  );
}
