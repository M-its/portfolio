import Text from "../components/text";

export default function About() {
  return (
    <div className="max-w-3xl">
      <Text as="h2" variant="heading-section" className="mb-10 tracking-wider">
        About me
      </Text>
      <Text as="p" variant="paragraph-medium" className="mb-6">
        I have been developing applications since 2021 as a full-stack
        JavaScript developer. I create modern, scalable, and high-performing
        solutions using fundamental technologies like React, TypeScript, NodeJS,
        and SQL.
      </Text>
      <Text as="p" variant="paragraph-medium">
        I'm enthusiastic about every step of the development process, from
        creating user interfaces to creating backend architecture, and I
        constantly strive to combine excellent user experience with high
        technical quality. I'm a firm believer in the value of teamwork and
        lifelong learning, and I'm always looking for innovative approaches to
        creating things that have an impact.
      </Text>
    </div>
  );
}
