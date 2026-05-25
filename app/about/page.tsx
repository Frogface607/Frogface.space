import { PageStub } from "@/components/page-stub";

export const metadata = { title: "About — Frogface" };

export default function AboutPage() {
  return (
    <PageStub
      num="02"
      kicker="history"
      title="моя история"
      hint="Новоленино → филфак → Сбер → дизайн-студия → бургерная → Edison → Бангкок → сюда. Завтра записываю голосовое интервью на улице — и здесь появится скролл-комикс с этой биографией."
    />
  );
}
