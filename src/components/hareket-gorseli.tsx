import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Kose, Renk, Yazi } from '@/constants/theme';
import { trBuyuk } from '@/lib/metin';

// GPT (gpt-image-2) çizimleri: hareket başına 1–2 poz + kas kartı. Anahtar = hareket id'si.
// Tarifler: ~/Desktop/dogrudisiplin-gorseller/uygulama/ham/ (./hareket-ciz.sh <id>)
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

export const kasGorseli = (id: string) => POZLAR[id]?.kas;

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
  const kayit = POZLAR[id];
  const [kare, setKare] = useState(0);
  useEffect(() => {
    if (!oynuyor || !kayit || kayit.pozlar.length < 2) return;
    const t = setInterval(() => setKare((k) => (k + 1) % kayit.pozlar.length), tempoMs);
    return () => clearInterval(t);
  }, [oynuyor, id, tempoMs]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!kayit) {
    return (
      <View style={[st.yer, { width: boyut, height: boyut * 0.62 }]}>
        <Text style={st.yerYazi}>{trBuyuk(ad)}</Text>
        <Text style={st.yerAlt}>Çizim yakında</Text>
      </View>
    );
  }
  return (
    <Image
      source={kayit.pozlar[oynuyor ? kare % kayit.pozlar.length : 0]}
      style={{ width: boyut, height: boyut, borderRadius: Kose.m }}
      contentFit="cover"
      transition={{ duration: 260, effect: 'cross-dissolve' }}
      accessibilityLabel={ad}
    />
  );
}

const st = StyleSheet.create({
  yer: {
    borderRadius: Kose.m,
    borderWidth: 1.5,
    borderColor: Renk.gece3,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  yerYazi: { fontFamily: Yazi.baslik, color: Renk.kemik, fontSize: 26, lineHeight: 36, textAlign: 'center', paddingHorizontal: 12 },
  yerAlt: { fontFamily: Yazi.normal, color: Renk.soluk, fontSize: 12 },
});
