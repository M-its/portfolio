import Text from "../components/text";
import AnimatedSection from "../components/animated-section";

export default function AboutContainer() {
  return (
    <AnimatedSection className="flex flex-col gap-6">
      <Text
        as="h3"
        className="text-xl lg:text-2xl font-semibold tracking-tight leading-snug"
      >
        Resolvendo problemas complexos <br />
        <span className="text-text-primary/60 italic font-light">
          com codigo elegante e escalavel.
        </span>
      </Text>

      <div className="space-y-4">
        <Text as="p" className="text-base leading-relaxed text-text-primary/90">
          Full-stack developer especialista no ecossistema{" "}
          <strong className="font-medium">JavaScript</strong>. Foco na criação
          de interfaces de alta performance e arquiteturas robustas utilizando{" "}
          <strong className="font-medium">React, TypeScript e Node.js</strong>.
        </Text>

        <Text
          as="p"
          className="text-sm leading-relaxed text-text-primary/80 font-light"
        >
          Transformo requisitos técnicos em produtos digitais sustentáveis,
          priorizando sempre a manutenibilidade e a experiência final do
          usuário.
        </Text>
      </div>
    </AnimatedSection>
  );
}
