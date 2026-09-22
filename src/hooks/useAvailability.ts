"use client";

import { useCallback, useEffect, useState } from "react";
import type { TimeSlot } from "@/types/lead";

export interface DayAvailability {
  date: string;
  label: string;
  slots: TimeSlot[];
}

interface AvailabilityState {
  days: DayAvailability[];
  windowStart: string | null;
  hasPrevious: boolean;
  loading: boolean;
  error: string | null;
}

const FRIENDLY_FALLBACK = "We couldn't load available times right now. Please try again.";

export function useAvailability() {
  const [state, setState] = useState<AvailabilityState>({
    days: [],
    windowStart: null,
    hasPrevious: false,
    loading: true,
    error: null,
  });

  const fetchAvailability = useCallback(async (start?: string, showLoading: boolean = true) => {
    if (showLoading) {
      setState((prev) => ({ ...prev, loading: true, error: null }));
    }
    try {
      const url = start ? `/api/calendar/availability?start=${start}` : "/api/calendar/availability";
      const response = await fetch(url);
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        setState({
          days: [],
          windowStart: null,
          hasPrevious: false,
          loading: false,
          error: (json && typeof json.error === "string" && json.error) || FRIENDLY_FALLBACK,
        });
        return;
      }
      setState({
        days: json?.days ?? [],
        windowStart: json?.windowStart ?? null,
        hasPrevious: json?.hasPrevious ?? false,
        loading: false,
        error: null,
      });
    } catch {
      setState({ days: [], windowStart: null, hasPrevious: false, loading: false, error: FRIENDLY_FALLBACK });
    }
  }, []);

  useEffect(() => {
    // No data-fetching library is available in this project (constraint: no new deps),
    // so fetch-on-mount is the only option; the eventual setState happens after the
    // await, not synchronously within the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAvailability(undefined, false);
  }, [fetchAvailability]);

  const refetch = useCallback(() => fetchAvailability(state.windowStart ?? undefined, true), [
    fetchAvailability,
    state.windowStart,
  ]);

  const goToNextWeek = useCallback(() => {
    if (!state.windowStart) return;
    const [y, m, d] = state.windowStart.split("-").map(Number);
    const next = new Date(Date.UTC(y, m - 1, d));
    next.setUTCDate(next.getUTCDate() + 7);
    fetchAvailability(next.toISOString().slice(0, 10), true);
  }, [fetchAvailability, state.windowStart]);

  const goToPreviousWeek = useCallback(() => {
    if (!state.windowStart) return;
    const [y, m, d] = state.windowStart.split("-").map(Number);
    const prev = new Date(Date.UTC(y, m - 1, d));
    prev.setUTCDate(prev.getUTCDate() - 7);
    fetchAvailability(prev.toISOString().slice(0, 10), true);
  }, [fetchAvailability, state.windowStart]);

  return { ...state, refetch, goToNextWeek, goToPreviousWeek };
}
