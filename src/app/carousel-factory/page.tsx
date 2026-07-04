import type { Metadata } from 'next';
import { SimpleCarouselPicker } from '@/components/carousel/SimpleCarouselPicker';

export const metadata: Metadata = {
  title: 'Carousel Factory - Frogface',
  description: 'Фабрика каруселей Frogface: дневник, Receptor, запуски и кейсы.',
};

export default function CarouselFactoryPage() {
  return <SimpleCarouselPicker />;
}
