import { Appearance, Platform, StyleSheet, useColorScheme } from 'react-native';

import { ACIK, KOYU, type Palet } from '@/constants/theme';
import { useVeri, type TemaTercihi } from '@/store';

// Ayarlar'daki seçim yerel bileşenlere de geçsin (Alert, Switch, klavye, sistem çubukları, sekme çubuğu):
// "Açık"/"Koyu" seçilince uygulamanın renk şeması o yöne kilitlenir; "Telefona uy" kilidi kaldırır.
// Depo senkron yüklendiği için ilk karede doğru tema gelir (açılışta renk sıçraması olmaz).
function semayiUygula(t: TemaTercihi) {
  if (Platform.OS === 'web') return;
  Appearance.setColorScheme(t === 'acik' ? 'light' : t === 'koyu' ? 'dark' : 'unspecified');
}
semayiUygula(useVeri.getState().tema);
useVeri.subscribe((s, once) => {
  if (s.tema !== once.tema) semayiUygula(s.tema);
});

/** Seçili tema: Ayarlar'daki tercih; "sistem" ise telefonun açık/koyu ayarı. */
export function useAcikMi() {
  const tercih = useVeri((s) => s.tema);
  const sistem = useColorScheme();
  return tercih === 'acik' || (tercih === 'sistem' && sistem === 'light');
}

export function useRenk(): Palet {
  return useAcikMi() ? ACIK : KOYU;
}

type Stiller = Parameters<typeof StyleSheet.create>[0];

/** Temaya bağlı stil: `const useSt = stil((Renk) => ({ ... }))`, bileşende `const st = useSt()`. */
export function stil<S extends Stiller>(kur: (Renk: Palet) => S & Stiller) {
  const onbellek = new Map<Palet, Readonly<S>>();
  return function useStil(): Readonly<S> {
    const R = useRenk();
    let v = onbellek.get(R);
    if (v === undefined) {
      v = StyleSheet.create(kur(R));
      onbellek.set(R, v);
    }
    return v;
  };
}
