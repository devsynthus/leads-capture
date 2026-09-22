"use client";

import { useEffect, useState } from "react";
import { useLeadForm } from "@/hooks/useLeadForm";
import type { LeadFormData } from "@/hooks/useLeadForm";
import { useStepTransition } from "@/components/animations/useStepTransition";
import { MeetingScheduler } from "@/components/calendar/MeetingScheduler";
import { readPersistedState, writePersistedState, clearPersistedState } from "@/lib/utils/sessionPersist";
import type { FollowUpMethod } from "@/types/lead";
import srOnly from "@/components/ui/sr-only.module.css";
import { WelcomeStep } from "./WelcomeStep";
import { ContactStep } from "./ContactStep";
import { DetailsStep } from "./DetailsStep";
import { OpportunityStep } from "./OpportunityStep";
import { FollowUpStep } from "./FollowUpStep";
import { SuccessScreen } from "./SuccessScreen";
import { LoadingScreen } from "./LoadingScreen";
import { BrandLogo } from "@/components/ui/BrandLogo";
import styles from "./LeadFormFlow.module.css";

type Screen =
  | "welcome"
  | "contact"
  | "details"
  | "opportunity"
  | "followup"
  | "meeting"
  | "success";

const STEP_ANNOUNCEMENTS: Record<Screen, string> = {
  welcome: "Welcome",
  contact: "Step 1 of 4: your contact details",
  details: "Step 2 of 4: about your work",
  opportunity: "Step 3 of 4: opportunity",
  followup: "Step 4 of 4: follow-up method",
  meeting: "Schedule a meeting",
  success: "All done",
};

const NETWORK_ERROR = "We couldn't reach the server. Please check your connection and try again.";
const MEETING_STEP_TOTAL = 7;
const BASE_STEP_TOTAL = 4;

interface SuccessInfo {
  meetingBooked: boolean;
  dateLabel?: string;
  timeLabel?: string;
  meetLink?: string;
}

// Only screens with no live/server-dependent state are safe to restore verbatim on refresh.
const RESTORABLE_SCREENS: readonly Screen[] = ["contact", "details", "opportunity", "followup"];

interface PersistedState {
  screen: Screen;
  data: LeadFormData;
  followUpMethod: FollowUpMethod | null;
}

export function LeadFormFlow() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const { containerRef, runExit } = useStepTransition(screen);
  const leadForm = useLeadForm();
  const [followUpMethod, setFollowUpMethod] = useState<FollowUpMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  // Restore after mount only — reading sessionStorage during the initial render would
  // diverge from the server-rendered markup and trigger a hydration mismatch. That
  // constraint means this restore genuinely has to setState from inside an effect.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const persisted = readPersistedState<PersistedState>();
    if (persisted && persisted.screen !== "success") {
      // Restore entered data even if they'd backed up to Welcome — only the *screen*
      // itself is conditional below, so a refresh never silently drops typed fields.
      leadForm.restore(persisted.data);
      setFollowUpMethod(persisted.followUpMethod);
      if (persisted.screen !== "welcome") {
        // "meeting" depends on a live availability fetch, so resume one step back instead of replaying it.
        const restoredScreen: Screen = RESTORABLE_SCREENS.includes(persisted.screen)
          ? persisted.screen
          : "followup";
        setScreen(restoredScreen);
      }
    }
    setIsHydrating(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    // Guarding on state (not a ref) matters: this effect must only ever see the
    // fully-restored values in the same render as isHydrating flips to false —
    // never a transitional render with stale/default data — or it would overwrite
    // the just-restored sessionStorage entry with blank data for one write.
    if (isHydrating) return;
    if (screen === "success") return;
    writePersistedState<PersistedState>({ screen, data: leadForm.data, followUpMethod });
  }, [isHydrating, screen, leadForm.data, followUpMethod]);

  const goTo = (next: Screen) => {
    runExit(() => setScreen(next));
  };

  const stepTotal = followUpMethod === "meeting" ? MEETING_STEP_TOTAL : BASE_STEP_TOTAL;

  const handleContactContinue = () => {
    if (leadForm.validateStep("contact")) goTo("details");
  };

  const handleDetailsContinue = () => {
    if (leadForm.validateStep("details")) goTo("opportunity");
  };

  const handleOpportunityContinue = () => {
    if (leadForm.validateStep("opportunity")) goTo("followup");
  };

  const submitEmailLead = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadForm.toEmailLeadPayload()),
      });
      const json = await response.json().catch(() => null);

      if (!response.ok) {
        if (json?.fieldErrors) {
          const step = leadForm.applyServerFieldErrors(json.fieldErrors);
          if (step) {
            setSubmitError("Please review the highlighted field(s).");
            goTo(step);
            return;
          }
        }
        setSubmitError(json?.error ?? NETWORK_ERROR);
        return;
      }

      clearPersistedState();
      setSuccessInfo({ meetingBooked: false });
      goTo("success");
    } catch {
      setSubmitError(NETWORK_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFollowUpContinue = () => {
    if (followUpMethod === "meeting") {
      setSubmitError(null);
      goTo("meeting");
    } else if (followUpMethod === "email") {
      submitEmailLead();
    }
  };

  const handleStartOver = () => {
    clearPersistedState();
    leadForm.reset();
    setFollowUpMethod(null);
    setSuccessInfo(null);
    setSubmitError(null);
    goTo("welcome");
  };

  return (
    <div className={styles.shell}>
      <div aria-live="polite" className={srOnly.srOnly}>
        {STEP_ANNOUNCEMENTS[screen]}
      </div>
      {screen !== "welcome" && (
        <div className={styles.brandRow}>
          <BrandLogo height={48} />
        </div>
      )}
      <div ref={containerRef} className={styles.stage}>
        {isHydrating && <LoadingScreen />}

        {!isHydrating && screen === "welcome" && <WelcomeStep onStart={() => goTo("contact")} />}

        {screen === "contact" && (
          <ContactStep
            data={leadForm.data}
            errors={leadForm.errors}
            onChange={leadForm.update}
            onContinue={handleContactContinue}
            onBack={() => goTo("welcome")}
            stepIndex={1}
            stepTotal={stepTotal}
          />
        )}

        {screen === "details" && (
          <DetailsStep
            data={leadForm.data}
            errors={leadForm.errors}
            onChange={leadForm.update}
            onContinue={handleDetailsContinue}
            onBack={() => goTo("contact")}
            stepIndex={2}
            stepTotal={stepTotal}
          />
        )}

        {screen === "opportunity" && (
          <OpportunityStep
            data={leadForm.data}
            errors={leadForm.errors}
            onChange={leadForm.update}
            onContinue={handleOpportunityContinue}
            onBack={() => goTo("details")}
            stepIndex={3}
            stepTotal={stepTotal}
          />
        )}

        {screen === "followup" && (
          <FollowUpStep
            data={leadForm.data}
            followUpMethod={followUpMethod}
            onFollowUpChange={setFollowUpMethod}
            onContinue={handleFollowUpContinue}
            onBack={() => goTo("opportunity")}
            submitting={submitting}
            submitError={submitError}
            stepIndex={4}
            stepTotal={stepTotal}
          />
        )}

        {screen === "meeting" && (
          <MeetingScheduler
            leadCore={leadForm.toBookingCoreFields()}
            onBack={() => goTo("followup")}
            onBooked={(result) => {
              clearPersistedState();
              setSuccessInfo({
                meetingBooked: true,
                dateLabel: result.dateLabel,
                timeLabel: result.timeLabel,
                meetLink: result.meetLink,
              });
              goTo("success");
            }}
            stepIndexBase={4}
            stepTotal={MEETING_STEP_TOTAL}
          />
        )}

        {screen === "success" && successInfo && (
          <SuccessScreen
            meetingBooked={successInfo.meetingBooked}
            meetingDateLabel={successInfo.dateLabel}
            meetingTimeLabel={successInfo.timeLabel}
            meetingLink={successInfo.meetLink}
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </div>
  );
}
