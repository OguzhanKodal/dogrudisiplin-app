// Ekran düzeni: telefon, katlanabilir (açık/kapalı), tablet ve yatay. Değerler pencere boyutundan gelir;
// katlanan telefon açılıp kapanınca ya da ekran dönünce kendiliğinden güncellenir.
import { useWindowDimensions } from 'react-native';

/** İçeriğin en fazla genişliği: açık katlanabilir ekranda satırlar okunur uzunlukta kalsın. */
export const ICERIK_EN = 760;

export function useDuzen() {
  const { width: en, height: boy } = useWindowDimensions();
  const genis = en >= 600; // Android "orta genişlik" sınıfı: açık katlanabilir, tablet
  return { en, boy, genis, yatay: en > boy, sutun: genis ? 2 : 1 } as const;
}
