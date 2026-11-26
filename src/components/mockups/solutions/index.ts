import type { SolutionId } from "@/content/copy";
import { GatewayMock } from "./Gateway";
import { LinkMock } from "./PaymentLink";
import { PixMock } from "./Pix";
import { CreditMock } from "./Credit";
import { DebitMock } from "./Debit";
import { AdvanceMock } from "./Advance";
import { ManagementMock } from "./Management";

/** Um mockup ilustrativo para cada solução da copy oficial. */
export const solutionMockups: Record<SolutionId, () => React.ReactElement> = {
  gateway: GatewayMock,
  link: LinkMock,
  pix: PixMock,
  credito: CreditMock,
  debito: DebitMock,
  antecipacao: AdvanceMock,
  gestao: ManagementMock,
};
