import { PageStub } from "@/components/page-stub";

export const metadata = { title: "Now — Frogface" };

export default function NowPage() {
  return (
    <PageStub
      num="03"
      kicker="now / now / now"
      title="что я делаю прямо сейчас"
      hint="Now-страница по образцу nownownow.com от Derek Sivers. Где нахожусь, над чем работаю, что в фокусе. Живая, обновляется регулярно."
    />
  );
}
