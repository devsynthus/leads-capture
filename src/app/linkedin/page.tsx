import Image from "next/image";
import type { Metadata } from "next";
import { brand } from "@/lib/config/brand";
import { BrandLogo } from "@/components/ui/BrandLogo";
import styles from "../connect/page.module.css";

export const metadata: Metadata = {
  title: `${brand.name} — Scan to connect on LinkedIn`,
};

export default function LinkedInPage() {
  return (
    <div className={styles.shell}>
      <BrandLogo height={72} />
      <h1 className={styles.heading}>Scan the QR to connect on LinkedIn</h1>
      <Image
        src="/brand/qr-code-linkedin.png"
        alt="Scan to open our LinkedIn page on your phone"
        width={1148}
        height={1148}
        priority
        className={styles.qrImage}
      />
    </div>
  );
}
