// Düğme simgeleri: iki platformda aynı çizilen SVG.
// Unicode işaretleri (▶ ⏮ ⏭) Android'de renkli emoji olarak çıkabiliyor, rengi tutmuyordu.
import Svg, { Path } from 'react-native-svg';

export type SimgeAd = 'oyna' | 'durdur' | 'geri' | 'ileri' | 'kapat' | 'arti' | 'eksi' | 'yenile' | 'sag' | 'tik';

// 24×24 tuval. `dolu` olanlar dolgu, ötekiler 2.4 kalınlıkta yuvarlak uçlu çizgi.
const YOLLAR: Record<SimgeAd, { d: string; dolu?: boolean }> = {
  oyna: { d: 'M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2Z', dolu: true },
  durdur: { d: 'M7 5h3.2v14H7zM13.8 5H17v14h-3.2z', dolu: true },
  geri: { d: 'M6 5.5v13M19 6.3v11.4a.8.8 0 0 1-1.25.66L9.6 12.66a.8.8 0 0 1 0-1.32l8.15-5.7A.8.8 0 0 1 19 6.3Z' },
  ileri: { d: 'M18 5.5v13M5 6.3v11.4a.8.8 0 0 0 1.25.66l8.15-5.7a.8.8 0 0 0 0-1.32L6.25 5.64A.8.8 0 0 0 5 6.3Z' },
  kapat: { d: 'M6.5 6.5l11 11M17.5 6.5l-11 11' },
  arti: { d: 'M12 5v14M5 12h14' },
  eksi: { d: 'M5 12h14' },
  yenile: { d: 'M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4.2h-4.2' },
  sag: { d: 'M9.5 5.5 16 12l-6.5 6.5' },
  tik: { d: 'M5 12.5l4.5 4.5L19 7.5' },
};

export function Simge({ ad, boyut = 20, renk }: { ad: SimgeAd; boyut?: number; renk: string }) {
  const y = YOLLAR[ad];
  return (
    <Svg width={boyut} height={boyut} viewBox="0 0 24 24" pointerEvents="none">
      {y.dolu ? (
        <Path d={y.d} fill={renk} />
      ) : (
        <Path d={y.d} stroke={renk} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      )}
    </Svg>
  );
}
