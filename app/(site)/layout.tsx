import { AuroraBackground } from "@/components/effects/aurora-background";
import { CustomCursor } from "@/components/effects/custom-cursor";
import { SmoothScroll } from "@/components/effects/smooth-scroll";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AuroraBackground />
      <SmoothScroll />
      <CustomCursor />
      <Header />
      <main id="main" className="relative">
        {children}
      </main>
      <Footer />
    </>
  );
}
