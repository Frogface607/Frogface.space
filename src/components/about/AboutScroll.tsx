'use client';

import { useRef } from 'react';
import Image from 'next/image';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from 'framer-motion';

type Panel = {
  num: string;
  era: string;
  place: string;
  title: string;
  image: string;
  text: string;
};

const PANELS: Panel[] = [
  {
    num: '01',
    era: 'детство',
    place: 'Новоленино, Иркутск',
    title: 'Откуда я',
    image: '/about/p01-novolenino-v2.webp',
    text: 'Я с Новоленино. Район, где могут и пизды дать, но где ты впервые понимаешь, кто ты. В пять лет я уже там — книжки, ролики, ПАЗик у подъезда.',
  },
  {
    num: '02',
    era: 'школа',
    place: 'первые деньги',
    title: 'Сначала — руками',
    image: '/about/p02-soundboard-v2.webp',
    text: 'Первые деньги зарабатывал руками. Грузчиком на Pepsi таскал ящики, маляром красил подъёмный кран. А первая официальная работа — звукооператор: школьные концерты, аппарат, чек, музыку вовремя врубить. Копейки на сберкнижку. Но свои.',
  },
  {
    num: '03',
    era: 'филфак',
    place: 'реклама и PR',
    title: 'Придумывать миры',
    image: '/about/p03-adman-v2.webp',
    text: 'Все ждали, что пойду в технари. Я пошёл на филфак, на рекламу. Делал кампании Сбербанку — придумывал, а не исполнял. Тогда и понял: моё — придумывать миры.',
  },
  {
    num: '04',
    era: '3 курс',
    place: '«Метка»',
    title: 'Первый продукт',
    image: '/about/p04-metka-v2.webp',
    text: 'С друзьями сделали одежду про свой район. Бренд «Метка», ПАЗик на футболках. Шили аж в Пакистане. Погорело. Но я рано понял кайф делать настоящий продукт, а не картинки.',
  },
  {
    num: '05',
    era: 'Evidence / Markers',
    place: 'дизайн-студии',
    title: 'Подсел на рестораны',
    image: '/about/p05-studio-v2.webp',
    text: 'Потом свои студии — Evidence, Markers. Брендили почти весь общепит Иркутска: меню, фирстили, упаковка. Так я и подсел на рестораны.',
  },
  {
    num: '06',
    era: 'музыка',
    place: 'сцена',
    title: '«С лицом лягушки»',
    image: '/about/p06-mic-v2.webp',
    text: 'Всю жизнь — музыка. Рэп-кор, фристайл, сцена. «С лицом лягушки» родилось из пьяных грустных фристайлов. Отсюда, кстати, и лягуха.',
  },
  {
    num: '07',
    era: '2016',
    place: 'Edison Bar',
    title: 'Это надо было сделать давно',
    image: '/about/p07-edison-build-v2.webp',
    text: 'Отец спросил: открываем крафтовый бар? Я: это надо было сделать давно. Построили с нуля в пустом цоколе. Лампы Эдисона на разной высоте — отсюда и название.',
  },
  {
    num: '08',
    era: '2016 — 2026',
    place: 'Edison Bar',
    title: 'Я был всем',
    image: '/about/p08-edison-allroles-v2.webp',
    text: 'В Edison я был всем — от грузчика до звукооператора. ~300 концертов в год, тысячи афиш. Топит грунтовкой — играет джаз, а я выношу воду ведром. В ковид наливал пиво по гугл-форме. Ставил Баха в баре. Привозил мировых звёзд.',
  },
  {
    num: '09',
    era: '2024',
    place: '«Нечто»',
    title: 'Самый дорогой урок',
    image: '/about/p09-nechto-v2.webp',
    text: 'Бургерная «Нечто». НЛО-бургеры, ретрофутуризм, лавовые лампы. Тысячи бургеров по моим рецептам. Красиво — делал как видел. Но не вытянул: не хватило системы. Самый дорогой урок.',
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

function PanelBlock({ p, index }: { p: Panel; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // gentle vertical parallax on the artwork (disabled for reduced motion)
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-7%', '7%']);

  return (
    <motion.article
      ref={ref}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px -8% 0px' }}
      className="grid gap-6 md:grid-cols-[7rem_1fr] md:gap-10"
    >
      {/* Sticky chapter index (desktop) */}
      <motion.div variants={rise} className="md:sticky md:top-28 md:self-start">
        <div className="font-display text-5xl md:text-6xl leading-none text-canon-olive/30 tabular-nums">
          {p.num}
        </div>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-canon-tan">
          {p.era}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-canon-ink/40">
          {p.place}
        </div>
      </motion.div>

      <div className="space-y-5">
        <motion.h2
          variants={rise}
          className="font-display font-bold text-3xl md:text-5xl leading-tight text-canon-ink"
        >
          {p.title}
        </motion.h2>

        <motion.div
          variants={rise}
          className="relative aspect-video w-full overflow-hidden rounded-sm bg-canon-ink/5 ring-1 ring-canon-ink/10 shadow-[0_18px_50px_-24px_rgba(47,47,47,0.5)]"
        >
          <motion.div style={{ y }} className="absolute inset-[-8%]">
            <Image
              src={p.image}
              alt={p.title}
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover"
              priority={index === 0}
            />
          </motion.div>
        </motion.div>

        <motion.p
          variants={rise}
          className="font-body text-[19px] md:text-xl leading-[1.7] text-canon-ink/85 max-w-2xl whitespace-pre-line"
        >
          {p.text}
        </motion.p>
      </div>
    </motion.article>
  );
}

export default function AboutScroll() {
  return (
    <section className="relative z-10 px-6 pb-28 max-w-4xl mx-auto space-y-28 md:space-y-40">
      {PANELS.map((p, i) => (
        <PanelBlock key={p.num} p={p} index={i} />
      ))}
    </section>
  );
}
