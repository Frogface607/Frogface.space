import {
  FROGFACE_CANON,
  FROGFACE_OUTFITS,
  FROGFACE_SITUATIONS,
  buildFrogfaceBiographySeed,
  buildFrogfaceImagePrompt,
} from '@/lib/frogface/assetFactory';

const SAMPLE_PROMPTS = [
  {
    title: 'Studio hero',
    prompt: buildFrogfaceImagePrompt({
      outfitId: 'studio',
      situationId: 'studio-hero',
      extra:
        'Frogface stands in a compact swamp-tech studio with monitors, product maps, warm desk light, and handmade operational tools.',
    }),
  },
  {
    title: 'Biography portrait',
    prompt: buildFrogfaceImagePrompt({
      outfitId: 'default',
      situationId: 'biography',
      extra:
        'Quiet desk scene, coffee, laptop, old bar/music artifacts, feeling of a founder after a long night of building.',
    }),
  },
  {
    title: 'Playable sprite',
    prompt: buildFrogfaceImagePrompt({
      outfitId: 'default',
      situationId: 'world-sprite',
      extra:
        'Side-view walking pose, clean full body, magenta chroma-key background, no floor shadow, suitable for sprite extraction.',
    }),
  },
];

export function AssetFactoryPanel() {
  return (
    <section className="bg-[#101610] px-5 py-14 text-[#f4ead5] md:px-8 md:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#b6ff3a]">
            asset factory
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-none md:text-6xl">
            Canon first.
            <br />
            Clothes second.
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-7 text-[#f4ead5]/68 md:text-base">
            Frogface assets are generated from a stable identity, then adapted by outfit and situation.
            This keeps biography, studio, world sprites, project cards, and social images consistent
            without forcing one outfit into every context.
          </p>

          <div className="mt-8 border border-[#f4ead5]/12 bg-black/25 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#e9c46a]">
              biography seed
            </p>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#f4ead5]/72">
              {buildFrogfaceBiographySeed()}
            </p>
          </div>

          <div className="mt-6 border border-[#f4ead5]/12 bg-[#f4ead5]/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#b6ff3a]">
              jewelry rule
            </p>
            <p className="mt-3 text-sm leading-6 text-[#f4ead5]/68">
              {FROGFACE_CANON.jewelry}
            </p>
          </div>

          <div className="mt-4 border border-[#f4ead5]/12 bg-black/25 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#e9c46a]">
              visual canon status
            </p>
            <p className="mt-3 text-sm leading-6 text-[#f4ead5]/68">
              The text canon is authoritative. Presentation mode explicitly has no hoodie and no
              hood; visual sheets with a chain growing from clothing stay out of production assets.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8c9a6b]">
              outfits
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {FROGFACE_OUTFITS.map((outfit) => (
                <article key={outfit.id} className="border border-[#f4ead5]/12 bg-[#f4ead5]/5 p-4">
                  <h3 className="font-display text-xl font-bold">{outfit.name}</h3>
                  <p className="mt-2 text-xs leading-5 text-[#f4ead5]/62">{outfit.clothing}</p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#b6ff3a]/80">
                    {outfit.useWhen}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8c9a6b]">
              situations
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {FROGFACE_SITUATIONS.map((situation) => (
                <span
                  key={situation.id}
                  className="rounded-full border border-[#f4ead5]/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f4ead5]/70"
                >
                  {situation.name}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {SAMPLE_PROMPTS.map((item) => (
              <details key={item.title} className="border border-[#f4ead5]/12 bg-black/25 p-4">
                <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.24em] text-[#e9c46a]">
                  {item.title}
                </summary>
                <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-5 text-[#f4ead5]/70">
                  {item.prompt}
                </pre>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
