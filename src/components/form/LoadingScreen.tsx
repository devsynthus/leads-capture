import { BrandLogo } from "@/components/ui/BrandLogo";
import srOnly from "@/components/ui/sr-only.module.css";
import styles from "./LoadingScreen.module.css";

/** Shown only for the brief window between mount and session-restore resolving, so a refresh never flashes the wrong screen. */
export function LoadingScreen() {
  return (
    <div className={styles.wrap}>
      <span className={styles.pulse}>
        <BrandLogo height={40} />
      </span>
      <span className={srOnly.srOnly}>Loading your progress…</span>
    </div>
  );
}
