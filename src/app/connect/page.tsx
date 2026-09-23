import Image from "next/image";
import type { Metadata } from "next";
import { brand } from "@/lib/config/brand";
import { BrandLogo } from "@/components/ui/BrandLogo";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `${brand.name} — Scan to connect`,
};

export default function ConnectPage() {
  return (
    <div className={styles.shell}>
      <BrandLogo height={72} />
      <h1 className={styles.heading}>Scan the QR to connect and meet</h1>
      <Image
        src="/brand/qr-code.png"
        alt="Scan to open connect.devsynth.us on your phone"
        width={1147}
        height={1147}
        priority
        className={styles.qrImage}
      />
    </div>
  );
}
