import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Yazi } from '@/constants/theme';
import { stil, useRenk } from '@/lib/tema';

// GPT (gpt-image-2) çizimleri: hareket başına 1–2 poz + kas kartı. Anahtar = hareket id'si.
// Çizimin kendi koyu yuvarlak karesi var; köşe yarıçapı kenarın ~%12'si (KOSE_ORANI) olmalı ki dış köşeler görünmesin.
// Tarifler: ~/Desktop/dogrudisiplin-gorseller/uygulama/yeni-stil/ (./hareket.sh <id>, 2x2 karo, karo kesici ile bölünür)
const POZLAR: Record<string, { pozlar: number[]; kas: number }> = {
  'kol-cevirme': {
    pozlar: [require('@/assets/images/hareket/kol-cevirme-1.png'), require('@/assets/images/hareket/kol-cevirme-2.png')],
    kas: require('@/assets/images/hareket/kol-cevirme-kas.png'),
  },
  squat: {
    pozlar: [require('@/assets/images/hareket/squat-1.png'), require('@/assets/images/hareket/squat-2.png')],
    kas: require('@/assets/images/hareket/squat-kas.png'),
  },
  sinav: {
    pozlar: [require('@/assets/images/hareket/sinav-1.png'), require('@/assets/images/hareket/sinav-2.png')],
    kas: require('@/assets/images/hareket/sinav-kas.png'),
  },
  hamle: {
    pozlar: [require('@/assets/images/hareket/hamle-1.png'), require('@/assets/images/hareket/hamle-2.png')],
    kas: require('@/assets/images/hareket/hamle-kas.png'),
  },
  plank: {
    pozlar: [require('@/assets/images/hareket/plank-1.png')], // sabit duruş: tek poz
    kas: require('@/assets/images/hareket/plank-kas.png'),
  },
  kopru: {
    pozlar: [require('@/assets/images/hareket/kopru-1.png'), require('@/assets/images/hareket/kopru-2.png')],
    kas: require('@/assets/images/hareket/kopru-kas.png'),
  },
  mekik: {
    pozlar: [require('@/assets/images/hareket/mekik-1.png'), require('@/assets/images/hareket/mekik-2.png')],
    kas: require('@/assets/images/hareket/mekik-kas.png'),
  },
  'diz-cekme': {
    pozlar: [require('@/assets/images/hareket/diz-cekme-1.png'), require('@/assets/images/hareket/diz-cekme-2.png')],
    kas: require('@/assets/images/hareket/diz-cekme-kas.png'),
  },
};

export const KOSE_ORANI = 0.13;
export const kasGorseli = (id: string) => POZLAR[id]?.kas;
/** Hareketin en anlatan pozu (küçük resimler için): varsa 2. poz. */
export const kapakGorseli = (id: string) => {
  const k = POZLAR[id];
  return k ? k.pozlar[k.pozlar.length - 1] : undefined;
};

/** Sabit hareket karesi (liste, kart küçük resimleri). */
export function Karo({ kaynak, boyut, style }: { kaynak?: number; boyut: number; style?: StyleProp<ViewStyle> }) {
  const Renk = useRenk();
  const kose = Math.round(boyut * KOSE_ORANI);
  if (!kaynak) return <View style={[{ width: boyut, height: boyut, borderRadius: kose, backgroundColor: Renk.gece3 }, style]} />;
  return (
    <View style={[{ width: boyut, height: boyut, borderRadius: kose, overflow: 'hidden' }, style]}>
      <Image source={kaynak} style={{ width: boyut, height: boyut }} contentFit="cover" />
    </View>
  );
}

/** Çalışırken pozlar arasında yumuşak geçişle gidip gelir (tempo: `tempoMs`). */
export function HareketGorseli({
  id,
  ad,
  oynuyor,
  tempoMs = 1100,
  boyut = 300,
}: {
  id: string;
  ad: string;
  oynuyor: boolean;
  tempoMs?: number;
  boyut?: number;
}) {
  const st = useSt();
  const kayit = POZLAR[id];
  const [kare, setKare] = useState(0);
  useEffect(() => {
    if (!oynuyor || !kayit || kayit.pozlar.length < 2) return;
    const t = setInterval(() => setKare((k) => (k + 1) % kayit.pozlar.length), tempoMs);
    return () => clearInterval(t);
  }, [oynuyor, id, tempoMs]); // eslint-disable-line react-hooks/exhaustive-deps

  const kose = Math.round(boyut * KOSE_ORANI);
  if (!kayit) {
    return (
      <View style={[st.yer, { width: boyut, height: boyut, borderRadius: kose }]}>
        <Text style={st.yerYazi}>{ad}</Text>
        <Text style={st.yerAlt}>Çizim yakında</Text>
      </View>
    );
  }
  return (
    <View style={{ width: boyut, height: boyut, borderRadius: kose, overflow: 'hidden' }}>
      <Image
        source={kayit.pozlar[oynuyor ? kare % kayit.pozlar.length : 0]}
        style={{ width: boyut, height: boyut }}
        contentFit="cover"
        transition={{ duration: 260, effect: 'cross-dissolve' }}
        accessibilityLabel={ad}
      />
    </View>
  );
}

const useSt = stil((Renk) => ({
  yer: {
    backgroundColor: Renk.gece2,
    borderWidth: 1,
    borderColor: Renk.cizgi,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  yerYazi: { fontFamily: Yazi.kalin, color: Renk.kemik, fontSize: 20, textAlign: 'center', paddingHorizontal: 12 },
  yerAlt: { fontFamily: Yazi.normal, color: Renk.soluk, fontSize: 12 },
}));
