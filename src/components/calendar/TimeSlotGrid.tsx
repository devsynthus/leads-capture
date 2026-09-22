"use client";

import type { TimeSlot } from "@/types/lead";
import { formatSlotTime } from "./timeFormat";
import styles from "./TimeSlotGrid.module.css";

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelect: (slot: TimeSlot) => void;
}

export function TimeSlotGrid({ slots, selectedSlot, onSelect }: TimeSlotGridProps) {
  const available = slots.filter((slot) => slot.available);

  if (available.length === 0) {
    return <p className={styles.empty}>No times left for this day. Please choose another date.</p>;
  }

  return (
    <div className={styles.grid} role="group" aria-label="Choose a time">
      {available.map((slot) => {
        const selected =
          selectedSlot?.date === slot.date && selectedSlot?.startTime === slot.startTime;
        return (
          <button
            key={`${slot.date}-${slot.startTime}`}
            type="button"
            className={`${styles.slotButton} ${selected ? styles.slotSelected : ""}`.trim()}
            aria-pressed={selected}
            onClick={() => onSelect(slot)}
          >
            {formatSlotTime(slot.startUtc)}
          </button>
        );
      })}
    </div>
  );
}
