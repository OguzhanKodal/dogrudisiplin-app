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
    pozlar: [require('@/assets/images/hareket/kol-cevirme-1.webp'), require('@/assets/images/hareket/kol-cevirme-2.webp')],
    kas: require('@/assets/images/hareket/kol-cevirme-kas.webp'),
  },
  squat: {
    pozlar: [require('@/assets/images/hareket/squat-1.webp'), require('@/assets/images/hareket/squat-2.webp')],
    kas: require('@/assets/images/hareket/squat-kas.webp'),
  },
  sinav: {
    pozlar: [require('@/assets/images/hareket/sinav-1.webp'), require('@/assets/images/hareket/sinav-2.webp')],
    kas: require('@/assets/images/hareket/sinav-kas.webp'),
  },
  hamle: {
    pozlar: [require('@/assets/images/hareket/hamle-1.webp'), require('@/assets/images/hareket/hamle-2.webp')],
    kas: require('@/assets/images/hareket/hamle-kas.webp'),
  },
  plank: {
    pozlar: [require('@/assets/images/hareket/plank-1.webp')],
    kas: require('@/assets/images/hareket/plank-kas.webp'),
  },
  kopru: {
    pozlar: [require('@/assets/images/hareket/kopru-1.webp'), require('@/assets/images/hareket/kopru-2.webp')],
    kas: require('@/assets/images/hareket/kopru-kas.webp'),
  },
  mekik: {
    pozlar: [require('@/assets/images/hareket/mekik-1.webp'), require('@/assets/images/hareket/mekik-2.webp')],
    kas: require('@/assets/images/hareket/mekik-kas.webp'),
  },
  'diz-cekme': {
    pozlar: [require('@/assets/images/hareket/diz-cekme-1.webp'), require('@/assets/images/hareket/diz-cekme-2.webp')],
    kas: require('@/assets/images/hareket/diz-cekme-kas.webp'),
  },
  'arka-bacak-esneme': {
    pozlar: [require('@/assets/images/hareket/arka-bacak-esneme-1.webp'), require('@/assets/images/hareket/arka-bacak-esneme-2.webp')],
    kas: require('@/assets/images/hareket/arka-bacak-esneme-kas.webp'),
  },
  barfiks: {
    pozlar: [require('@/assets/images/hareket/barfiks-1.webp'), require('@/assets/images/hareket/barfiks-2.webp')],
    kas: require('@/assets/images/hareket/barfiks-kas.webp'),
  },
  burpee: {
    pozlar: [require('@/assets/images/hareket/burpee-1.webp'), require('@/assets/images/hareket/burpee-2.webp')],
    kas: require('@/assets/images/hareket/burpee-kas.webp'),
  },
  'cocuk-pozu': {
    pozlar: [require('@/assets/images/hareket/cocuk-pozu-1.webp')],
    kas: require('@/assets/images/hareket/cocuk-pozu-kas.webp'),
  },
  dagci: {
    pozlar: [require('@/assets/images/hareket/dagci-1.webp')],
    kas: require('@/assets/images/hareket/dagci-kas.webp'),
  },
  'dizde-sinav': {
    pozlar: [require('@/assets/images/hareket/dizde-sinav-1.webp'), require('@/assets/images/hareket/dizde-sinav-2.webp')],
    kas: require('@/assets/images/hareket/dizde-sinav-kas.webp'),
  },
  'duvar-oturusu': {
    pozlar: [require('@/assets/images/hareket/duvar-oturusu-1.webp')],
    kas: require('@/assets/images/hareket/duvar-oturusu-kas.webp'),
  },
  'kedi-inek': {
    pozlar: [require('@/assets/images/hareket/kedi-inek-1.webp'), require('@/assets/images/hareket/kedi-inek-2.webp')],
    kas: require('@/assets/images/hareket/kedi-inek-kas.webp'),
  },
  'omuz-sinavi': {
    pozlar: [require('@/assets/images/hareket/omuz-sinavi-1.webp'), require('@/assets/images/hareket/omuz-sinavi-2.webp')],
    kas: require('@/assets/images/hareket/omuz-sinavi-kas.webp'),
  },
  'sandalye-dips': {
    pozlar: [require('@/assets/images/hareket/sandalye-dips-1.webp'), require('@/assets/images/hareket/sandalye-dips-2.webp')],
    kas: require('@/assets/images/hareket/sandalye-dips-kas.webp'),
  },
  superman: {
    pozlar: [require('@/assets/images/hareket/superman-1.webp'), require('@/assets/images/hareket/superman-2.webp')],
    kas: require('@/assets/images/hareket/superman-kas.webp'),
  },
  'yan-plank': {
    pozlar: [require('@/assets/images/hareket/yan-plank-1.webp')],
    kas: require('@/assets/images/hareket/yan-plank-kas.webp'),
  },
  'yildiz-ziplama': {
    pozlar: [require('@/assets/images/hareket/yildiz-ziplama-1.webp'), require('@/assets/images/hareket/yildiz-ziplama-2.webp')],
    kas: require('@/assets/images/hareket/yildiz-ziplama-kas.webp'),
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
  if (!kaynak)
    return (
      <View
        style={[
          {
            width: boyut,
            height: boyut,
            borderRadius: kose,
            backgroundColor: Renk.gece3,
          },
          style,
        ]}
      />
    );
  return (
    <View style={[{ width: boyut, height: boyut, borderRadius: kose, overflow: 'hidden' }, style]}>
      <Image source={kaynak} style={{ width: boyut, height: boyut }} contentFit="cover" cachePolicy="memory" />
    </View>
  );
}

/**
 * Sıradaki hareketin çizimlerini görünmeden belleğe yükler (oynatıcı): adım değişince resim boş kare beklemeden gelir.
 * Aynı `boyut` verilmeli; küçültülmüş resim önbellekte o boyutla tutulur.
 */
export function OnYukle({ id, boyut }: { id?: string; boyut: number }) {
  const kayit = id ? POZLAR[id] : undefined;
  if (!kayit) return null;
  return (
    <View style={gizli} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {[...kayit.pozlar, kayit.kas].map((k, i) => (
        <Image key={i} source={k} style={{ width: boyut, height: boyut }} cachePolicy="memory" />
      ))}
    </View>
  );
}
const gizli = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: 1,
  height: 1,
  opacity: 0,
  overflow: 'hidden',
} as const;

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
  const pozSayisi = kayit?.pozlar.length ?? 0;
  useEffect(() => {
    if (!oynuyor || pozSayisi < 2) return;
    const t = setInterval(() => setKare((k) => (k + 1) % pozSayisi), tempoMs);
    return () => clearInterval(t);
  }, [oynuyor, pozSayisi, tempoMs]);

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
    <View
      style={{
        width: boyut,
        height: boyut,
        borderRadius: kose,
        overflow: 'hidden',
      }}>
      <Image
        source={kayit.pozlar[oynuyor ? kare % kayit.pozlar.length : 0]}
        style={{ width: boyut, height: boyut }}
        contentFit="cover"
        cachePolicy="memory"
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
  yerYazi: {
    fontFamily: Yazi.kalin,
    color: Renk.kemik,
    fontSize: 20,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  yerAlt: { fontFamily: Yazi.normal, color: Renk.soluk, fontSize: 12 },
}));
