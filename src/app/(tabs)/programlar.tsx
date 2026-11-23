import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { kapakGorseli, Karo } from '@/components/hareket-gorseli';
import { Baslik, Bolum, Ekran, M, Sayi } from '@/components/ui';
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
      <Baslik metin="Programlar" boyut={34} />
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
  const kapak = p.kapak ? kapakGorseli(p.kapak) : undefined;
  return (
    <Pressable
      disabled={p.yakinda}
      onPress={() => router.push(`/program/${p.id}`)}
      style={({ pressed }) => [st.kart, pressed && { opacity: 0.85 }, p.yakinda && { opacity: 0.55 }]}>
      {kapak ? (
        <Karo kaynak={kapak} boyut={84} />
      ) : (
        <View style={st.yerKaro}>
          <Sayi deger={p.bolumler?.length ?? '—'} boyut={34} />
          <M tur="etiket" style={{ fontSize: 9 }}>
            bölüm
          </M>
        </View>
      )}
      <View style={{ flex: 1, gap: 3 }}>
        <M tur="buyuk">{p.ad}</M>
        <M tur="kucuk">{p.altBaslik}</M>
        <View style={st.etiketler}>
          <M style={st.etiket}>{p.sure}</M>
          <M style={st.etiket}>{p.seviye}</M>
          {p.yakinda ? <M style={[st.etiket, { color: Renk.gece, backgroundColor: Renk.volt }]}>Yakında</M> : null}
        </View>
      </View>
      <M tur="buyuk" renk={Renk.soluk}>
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
    borderRadius: Kose.l,
    borderWidth: 1,
    borderColor: Renk.cizgi,
    padding: Bosluk.m,
    paddingRight: Bosluk.l,
  },
  yerKaro: {
    width: 84,
    height: 84,
    borderRadius: 11,
    backgroundColor: Renk.gece3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etiketler: { flexDirection: 'row', gap: 6, marginTop: 4 },
  etiket: {
    fontFamily: Yazi.orta,
    fontSize: 11,
    color: Renk.kemik,
    backgroundColor: Renk.gece3,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
