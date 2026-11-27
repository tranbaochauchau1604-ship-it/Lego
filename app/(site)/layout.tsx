import { AuroraBackground } from "@/components/effects/aurora-background";
import { CustomCursor } from "@/components/effects/custom-cursor";
import { SmoothScroll } from "@/components/effects/smooth-scroll";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { getContacts } from "@/lib/data/settings";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const contacts = await getContacts();
  return (
    <>
      <AuroraBackground />
      <SmoothScroll />
      <CustomCursor />
      <Header />
      <main id="main" className="relative">
        {children}
      </main>
      <Footer contacts={contacts} />
    </>
  );
}
