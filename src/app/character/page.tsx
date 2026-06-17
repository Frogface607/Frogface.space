import { FrogfaceViewer } from '@/components/character/FrogfaceViewer';
import { AssetFactoryPanel } from '@/components/character/AssetFactoryPanel';

export default function CharacterPage() {
  return (
    <main className="bg-[#101610]">
      <AssetFactoryPanel />
      <FrogfaceViewer />
    </main>
  );
}
