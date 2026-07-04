import type { Metadata } from 'next';
import { DiaryFactory } from '@/components/diary/DiaryFactory';

export const metadata: Metadata = {
  title: 'Carousel Factory - Frogface',
  description: 'Фабрика каруселей Frogface: дневник, Receptor, запуски и кейсы.',
};

export default function DiaryFactoryPage() {
  return <DiaryFactory />;
}
