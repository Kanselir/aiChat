import { PhysiPalChat } from '@/components/physipal/PhysiPalChat';

export default function Home() {
  return (
    <main className="dark"> {/* Ensure dark mode is applied */}
      <PhysiPalChat />
    </main>
  );
}
