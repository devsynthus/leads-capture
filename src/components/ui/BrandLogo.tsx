import Image from "next/image";
import { brand } from "@/lib/config/brand";
import styles from "./BrandLogo.module.css";

const LOGO_ASPECT_RATIO = 4232 / 1184;

interface BrandLogoProps {
  height?: number;
}

/** Swap the source file here to change the logo everywhere it's used. */
export function BrandLogo({ height = 32 }: BrandLogoProps) {
  return (
    <Image
      src="/brand/logo-variant-1.png"
      alt={brand.logoAlt}
      width={Math.round(LOGO_ASPECT_RATIO * height)}
      height={height}
      className={styles.mark}
      priority
    />
  );
}
