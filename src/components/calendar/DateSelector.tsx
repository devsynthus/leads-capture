"use client";

import type { DayAvailability } from "@/hooks/useAvailability";
import styles from "./DateSelector.module.css";

interface DateSelectorProps {
  days: DayAvailability[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  hasPrevious: boolean;
}

export function DateSelector({
  days,
  selectedDate,
  onSelect,
  onPreviousWeek,
  onNextWeek,
  hasPrevious,
}: DateSelectorProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.nav}>
        <button
          type="button"
          className={styles.navButton}
          onClick={onPreviousWeek}
          disabled={!hasPrevious}
          aria-label="Previous week"
        >
          ← Previous week
        </button>
        <button type="button" className={styles.navButton} onClick={onNextWeek} aria-label="Next week">
          Next week →
        </button>
      </div>
      {days.length === 0 ? (
        <p className={styles.empty}>No dates are available right now.</p>
      ) : (
        <div className={styles.grid} role="group" aria-label="Choose a date">
          {days.map((day) => {
            const availableCount = day.slots.filter((s) => s.available).length;
            const disabled = availableCount === 0;
            const selected = selectedDate === day.date;
            return (
              <button
                key={day.date}
                type="button"
                className={`${styles.dayButton} ${selected ? styles.daySelected : ""}`.trim()}
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => onSelect(day.date)}
              >
                <span>{day.label}</span>
                <span className={styles.dayMeta}>
                  {disabled ? "No times left" : `${availableCount} time${availableCount === 1 ? "" : "s"}`}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
