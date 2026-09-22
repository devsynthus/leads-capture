"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StepShell } from "@/components/form/StepShell";
import { useAvailability } from "@/hooks/useAvailability";
import type { BookingRequestInput } from "@/lib/validation/schemas";
import type { TimeSlot } from "@/types/lead";
import { DateSelector } from "./DateSelector";
import { TimeSlotGrid } from "./TimeSlotGrid";
import { ConfirmMeeting } from "./ConfirmMeeting";
import { formatSlotTime } from "./timeFormat";

type SubStep = "date" | "time" | "confirm";

const NETWORK_ERROR = "We couldn't reach the server. Please check your connection and try again.";

interface BookedResult {
  eventId: string;
  leadId: string;
  date: string;
  dateLabel: string;
  timeLabel: string;
  meetLink?: string;
}

interface MeetingSchedulerProps {
  leadCore: Omit<BookingRequestInput, "meeting">;
  onBack: () => void;
  onBooked: (result: BookedResult) => void;
  stepIndexBase: number;
  stepTotal: number;
}

export function MeetingScheduler({
  leadCore,
  onBack,
  onBooked,
  stepIndexBase,
  stepTotal,
}: MeetingSchedulerProps) {
  const { days, loading, error, refetch, hasPrevious, goToPreviousWeek, goToNextWeek } = useAvailability();
  const [subStep, setSubStep] = useState<SubStep>("date");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slotTakenMessage, setSlotTakenMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedDay = days.find((d) => d.date === selectedDate) ?? null;

  const handleConfirm = async () => {
    if (!selectedSlot || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: BookingRequestInput = {
        ...leadCore,
        meeting: {
          date: selectedSlot.date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        },
      };
      const response = await fetch("/api/calendar/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json().catch(() => null);

      if (response.status === 409) {
        setSlotTakenMessage(
          json?.error ?? "That time was just booked by someone else. Please choose another available time."
        );
        setSelectedSlot(null);
        setSubStep("time");
        refetch();
        return;
      }

      if (!response.ok) {
        setSubmitError(json?.error ?? NETWORK_ERROR);
        return;
      }

      onBooked({
        eventId: json.eventId,
        leadId: json.leadId,
        date: selectedSlot.date,
        dateLabel: selectedDay?.label ?? selectedSlot.date,
        timeLabel: formatSlotTime(selectedSlot.startUtc),
        meetLink: json.meetLink,
      });
    } catch {
      setSubmitError(NETWORK_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  if (subStep === "date") {
    return (
      <StepShell
        title="Pick a date"
        subtitle="Choose a day that works for you."
        stepIndex={stepIndexBase + 1}
        stepTotal={stepTotal}
        error={error}
        footer={
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>
        }
      >
        {loading ? (
          <p>Loading available dates…</p>
        ) : (
          <DateSelector
            days={days}
            selectedDate={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              setSelectedSlot(null);
              setSubStep("time");
            }}
            onPreviousWeek={goToPreviousWeek}
            onNextWeek={goToNextWeek}
            hasPrevious={hasPrevious}
          />
        )}
      </StepShell>
    );
  }

  if (subStep === "time") {
    return (
      <StepShell
        title={selectedDay ? selectedDay.label : "Pick a time"}
        subtitle="Choose an available time slot."
        stepIndex={stepIndexBase + 2}
        stepTotal={stepTotal}
        error={slotTakenMessage}
        footer={
          <Button type="button" variant="ghost" onClick={() => setSubStep("date")}>
            Back
          </Button>
        }
      >
        <TimeSlotGrid
          slots={selectedDay?.slots ?? []}
          selectedSlot={selectedSlot}
          onSelect={(slot) => {
            setSelectedSlot(slot);
            setSlotTakenMessage(null);
            setSubStep("confirm");
          }}
        />
      </StepShell>
    );
  }

  if (!selectedSlot || !selectedDay) {
    return null;
  }

  return (
    <ConfirmMeeting
      fullName={leadCore.fullName}
      email={leadCore.email}
      dateLabel={selectedDay.label}
      timeLabel={formatSlotTime(selectedSlot.startUtc)}
      submitting={submitting}
      error={submitError}
      onConfirm={handleConfirm}
      onBack={() => setSubStep("time")}
      stepIndex={stepIndexBase + 3}
      stepTotal={stepTotal}
    />
  );
}
