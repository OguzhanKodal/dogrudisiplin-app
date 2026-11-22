import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Baslik, Bolum, Ekran, M } from '@/components/ui';
import { Bosluk, Kose, Renk, Yazi } from '@/constants/theme';
import { PROGRAMLAR, type Program } from '@/data/programlar';

const GRUPLAR: { tur: Program['tur']; baslik: string }[] = [
  { tur: 'kisa', baslik: 'Birlikte yap' },
  { tur: 'uzun', baslik: 'Uzun programlar' },
  { tur: 'rehber', baslik: 'Rehberler' },
];

export default function Programlar() {
  return (
    <Ekran>
      <Baslik metin="PROGRAMLAR" boyut={40} />
      {GRUPLAR.map((g) => (
        <Bolum key={g.tur} baslik={g.baslik}>
          {PROGRAMLAR.filter((p) => p.tur === g.tur).map((p) => (
            <ProgramKarti key={p.id} p={p} />
          ))}
        </Bolum>
      ))}
    </Ekran>
  );
}

function ProgramKarti({ p }: { p: Program }) {
  return (
    <Pressable
      disabled={p.yakinda}
      onPress={() => router.push(`/program/${p.id}`)}
      style={({ pressed }) => [st.kart, pressed && { opacity: 0.85 }, p.yakinda && { opacity: 0.5 }]}>
      <View style={st.serit} />
      <View style={{ flex: 1, gap: 4 }}>
        <M tur="buyuk">{p.ad}</M>
        <M tur="kucuk">{p.altBaslik}</M>
        <View style={st.etiketler}>
          <M style={st.etiket}>{p.sure}</M>
          <M style={st.etiket}>{p.seviye}</M>
          {p.yakinda ? <M style={[st.etiket, { color: Renk.volt }]}>Yakında</M> : null}
        </View>
      </View>
      <M tur="buyuk" renk={Renk.volt}>
        ›
      </M>
    </Pressable>
  );
}

const st = StyleSheet.create({
  kart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Bosluk.m,
    backgroundColor: Renk.gece2,
    borderRadius: Kose.m,
    padding: Bosluk.l,
    overflow: 'hidden',
  },
  serit: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: Renk.volt },
  etiketler: { flexDirection: 'row', gap: 6, marginTop: 4 },
  etiket: {
    fontFamily: Yazi.orta,
    fontSize: 11,
    color: Renk.kemik,
    backgroundColor: Renk.gece3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
});
