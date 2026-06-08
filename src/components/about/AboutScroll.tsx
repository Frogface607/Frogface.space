'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
    image: '/about/p01-novolenino.webp',
    text: 'Я с Новоленино. Район, где могут и пизды дать, но где ты впервые понимаешь, кто ты. В пять лет я уже там — книжки, ролики, ПАЗик у подъезда.',
  },
  {
    num: '02',
    era: 'школа',
    place: 'первые деньги',
    title: 'Сначала — руками',
    image: '/about/p02-soundboard.webp',
    text: 'Первые деньги зарабатывал руками. Грузчиком на Pepsi таскал ящики, маляром красил подъёмный кран. А первая официальная работа — звукооператор: школьные концерты, аппарат, чек, музыку вовремя врубить. Копейки на сберкнижку. Но свои.',
  },
  {
    num: '03',
    era: 'филфак',
    place: 'реклама и PR',
    title: 'Придумывать миры',
    image: '/about/p03-adman.webp',
    text: 'Все ждали, что пойду в технари. Я пошёл на филфак, на рекламу. Делал кампании Сбербанку — придумывал, а не исполнял. Тогда и понял: моё — придумывать миры.',
  },
  {
    num: '04',
    era: '3 курс',
    place: '«Метка»',
    title: 'Первый продукт',
    image: '/about/p04-metka.webp',
    text: 'С друзьями сделали одежду про свой район. Бренд «Метка», ПАЗик на футболках. Шили аж в Пакистане. Погорело. Но я рано понял кайф делать настоящий продукт, а не картинки.',
  },
  {
    num: '05',
    era: 'Evidence / Markers',
    place: 'дизайн-студии',
    title: 'Подсел на рестораны',
    image: '/about/p05-studio.webp',
    text: 'Потом свои студии — Evidence, Markers. Брендили почти весь общепит Иркутска: меню, фирстили, упаковка. Так я и подсел на рестораны.',
  },
  {
    num: '06',
    era: 'музыка',
    place: 'сцена',
    title: '«С лицом лягушки»',
    image: '/about/p06-mic.webp',
    text: 'Всю жизнь — музыка. Рэп-кор, фристайл, сцена. «С лицом лягушки» родилось из пьяных грустных фристайлов. Отсюда, кстати, и лягуха.',
  },
  {
    num: '07',
    era: '2016',
    place: 'Edison Bar',
    title: 'Это надо было сделать давно',
    image: '/about/p07-edison-build.webp',
    text: 'Отец спросил: открываем крафтовый бар? Я: это надо было сделать давно. Построили с нуля в пустом цоколе. Лампы Эдисона на разной высоте — отсюда и название.',
  },
  {
    num: '08',
    era: '2016 — 2026',
    place: 'Edison Bar',
    title: 'Я был всем',
    image: '/about/p08-edison-allroles.webp',
    text: 'В Edison я был всем — от грузчика до звукооператора. ~300 концертов в год, тысячи афиш. Топит грунтовкой — играет джаз, а я выношу воду ведром. В ковид наливал пиво по гугл-форме. Ставил Баха в баре. Привозил мировых звёзд.',
  },
  {
    num: '09',
    era: '2024',
    place: '«Нечто»',
    title: 'Самый дорогой урок',
    image: '/about/p09-nechto.webp',
    text: 'Бургерная «Нечто». НЛО-бургеры, ретрофутуризм, лавовые лампы. Тысячи бургеров по моим рецептам. Красиво — делал как видел. Но не вытянул: не хватило системы. Самый дорогой урок.',
  },
  {
    num: '10',
    era: 'сейчас',
    place: 'болото → башня',
    title: 'Выбираюсь',
    image: '/about/p10-swamp-to-tower.webp',
    text: 'Потом нейросети. Собрал Edison сайт-операционку, сбросил 90% рутины. А Edison закрыли. И вот я один, в болоте. Заебался жить ради чужих ожиданий. Теперь выбираюсь к своей башне — спокойно, без вины. Делаю так же интересно, но системно. И хочу за это достойные деньги.',
  },
];

export default function AboutScroll() {
  return (
    <section className="px-6 pb-24 max-w-3xl mx-auto space-y-28 md:space-y-40">
      {PANELS.map((p, i) => (
        <motion.article
          key={p.num}
          className="space-y-6"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px -10% 0px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-canon-tan">
            <span className="text-canon-olive">/ {p.num} /</span>
            <span>{p.era}</span>
            <span className="opacity-50">·</span>
            <span>{p.place}</span>
          </div>

          <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight">
            {p.title}
          </h2>

          <motion.div
            className="relative aspect-video w-full overflow-hidden rounded-sm bg-canon-ink/5 ring-1 ring-canon-ink/10"
            initial={{ scale: 1.04 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={p.image}
              alt={p.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority={i === 0}
            />
          </motion.div>

          <p className="text-lg text-canon-ink/85 leading-relaxed max-w-2xl whitespace-pre-line">
            {p.text}
          </p>
        </motion.article>
      ))}
    </section>
  );
}
