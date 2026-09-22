import { Button } from "@/components/ui/Button";
import styles from "./SuccessScreen.module.css";

interface SuccessScreenProps {
  meetingBooked: boolean;
  meetingDateLabel?: string;
  meetingTimeLabel?: string;
  meetingLink?: string;
  onStartOver: () => void;
}

export function SuccessScreen({
  meetingBooked,
  meetingDateLabel,
  meetingTimeLabel,
  meetingLink,
  onStartOver,
}: SuccessScreenProps) {
  return (
    <div className={styles.wrap}>
      <span className={styles.icon} aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div>
        <h1 className={styles.title}>
          {meetingBooked ? "Your meeting is booked" : "Thanks — you're all set"}
        </h1>
        <p className={styles.subtitle}>
          {meetingBooked
            ? "We've sent a confirmation and look forward to speaking with you."
            : "We've received your information and will follow up by email shortly."}
        </p>
      </div>
      {meetingBooked && meetingDateLabel && meetingTimeLabel && (
        <div className={styles.meetingCard}>
          <span className={styles.meetingLabel}>Confirmed</span>
          <span className={styles.meetingValue}>
            {meetingDateLabel} · {meetingTimeLabel}
          </span>
          {meetingLink && (
            <a
              className={styles.meetingLink}
              href={meetingLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join with Google Meet
            </a>
          )}
        </div>
      )}
      <Button variant="secondary" onClick={onStartOver}>
        Start over
      </Button>
    </div>
  );
}
