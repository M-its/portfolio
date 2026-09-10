import { Link } from "react-router-dom";
import Button from "../components/button";
import Container from "../components/container";
import Text from "../components/text";

export default function PageProjectNotFound() {
  return (
    <Container
      as="main"
      className="flex min-h-screen flex-col items-center justify-center pt-28 text-center"
    >
      <span className="text-sm font-semibold uppercase tracking-[0.3em] opacity-60">
        404
      </span>
      <Text as="h1" className="mt-5 text-4xl font-semibold md:text-6xl">
        Projeto não encontrado
      </Text>
      <Text
        as="p"
        variant="paragraph-medium"
        className="mt-5 max-w-xl opacity-75"
      >
        Este estudo de caso não existe ou foi movido para outra rota.
      </Text>
      <Button as={Link} to="/" variant="outline" className="mt-8">
        Voltar à página inicial
      </Button>
    </Container>
  );
}
