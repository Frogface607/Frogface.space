import { PageStub } from "@/components/page-stub";

export const metadata = { title: "Playground — Frogface" };

export default function PlaygroundPage() {
  return (
    <PageStub
      num="06"
      kicker="easter eggs"
      title="комната для лягух"
      hint="Сюда поедут интерактивные эксперименты, шейдеры, мини-игры, mini-comics. Опционально, для тех кто долез."
    />
  );
}
