import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Política de privacidade" };

export default function Page() {
  return <LegalPage title="Política de privacidade" />;
}
