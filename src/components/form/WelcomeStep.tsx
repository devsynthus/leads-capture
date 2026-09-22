import { brand } from "@/lib/config/brand";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import styles from "./WelcomeStep.module.css";

interface WelcomeStepProps {
  onStart: () => void;
}

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <div className={styles.wrap}>
      <BrandLogo height={48} />
      <div>
        <h1 className={styles.title}>{brand.tagline}</h1>
        <p className={styles.subtitle}>{brand.subtagline}</p>
      </div>
      <Button onClick={onStart} autoFocus>
        Get started
      </Button>
    </div>
  );
}
