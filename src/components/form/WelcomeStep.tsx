import Image from "next/image";
import { brand } from "@/lib/config/brand";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import styles from "./WelcomeStep.module.css";

interface WelcomeStepProps {
  onStart: () => void;
}

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <div className={styles.row}>
      <div className={styles.wrap}>
        <BrandLogo height={48} />
        <div>
          <h1 className={styles.title}>{brand.tagline}</h1>
          <p className={styles.subtitle}>{brand.subtagline}</p>
        </div>
        <Button onClick={onStart} autoFocus className={styles.startButton}>
          Get started
        </Button>
      </div>
      <a
        href="https://connect.devsynth.us/"
        className={styles.qrLink}
        aria-label="Open connect.devsynth.us on your phone"
      >
        <Image
          src="/brand/qr-code.png"
          alt=""
          width={512}
          height={512}
          className={styles.qrImage}
        />
        <span className={styles.qrCaption}>Scan to open on your phone</span>
      </a>
    </div>
  );
}
