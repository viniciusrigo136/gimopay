import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Política de cookies" };

export default function Page() {
  return <LegalPage title="Política de cookies" />;
}
