import AboutContainer from "./about-container";
import AnimatedSection from "../components/animated-section";
import Text from "../components/text";

export default function AboutSection() {
  return (
    <section>
      <AnimatedSection>
        <div className="flex items-center gap-4 opacity-70 mb-10">
          <Text as="span" className="text-[13px] font-black tracking-[0.4em]">
            01
          </Text>
          <div className="h-px w-10 bg-current" />
          <Text
            as="h2"
            variant="heading-section"
            className="font-bold uppercase tracking-[0.4em]"
          >
            <span className="lg:hidden">Sobre</span>
            <span className="hidden lg:inline">Sobre & Stack</span>
          </Text>
        </div>
      </AnimatedSection>
      <AboutContainer />
    </section>
  );
}
