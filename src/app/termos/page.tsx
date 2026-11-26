import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Termos de uso" };

export default function Page() {
  return <LegalPage title="Termos de uso" />;
}
