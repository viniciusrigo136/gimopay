import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Solutions } from "@/components/sections/Solutions";
import { PaymentLink } from "@/components/sections/PaymentLink";
import { Integrations } from "@/components/sections/Integrations";
import { Segments } from "@/components/sections/Segments";
import { Mobility } from "@/components/sections/Mobility";
import { Differentials } from "@/components/sections/Differentials";
import { Contact } from "@/components/sections/Contact";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Solutions />
        <PaymentLink />
        <Integrations />
        <Segments />
        <Mobility />
        <Differentials />
        <Contact />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
