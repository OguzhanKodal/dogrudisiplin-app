import { router } from 'expo-router';
import { View } from 'react-native';

import { kapakGorseli, Karo } from '@/components/hareket-gorseli';
import { Simge } from '@/components/simge';
import { Baslik, Bolum, Ekran, KartDugme, M, Sayi } from '@/components/ui';
import { Bosluk, Yazi } from '@/constants/theme';
import { PROGRAMLAR, type Program } from '@/data/programlar';
import { stil, useRenk } from '@/lib/tema';

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
  const Renk = useRenk();
  const st = useSt();
  const kapak = p.kapak ? kapakGorseli(p.kapak) : undefined;
  // Kapak çizimi yoksa: hareket / gün / bölüm sayısı.
  const [sayi, birim] = p.seans
    ? [p.seans.hareketler.length, 'hareket']
    : p.gunler
      ? [p.gunler.length, 'gün']
      : [p.bolumler?.length, 'bölüm'];
  return (
    <KartDugme
      disabled={p.yakinda}
      onPress={() => router.push(`/program/${p.id}`)}
      accessibilityLabel={`${p.ad}. ${p.altBaslik}. ${p.sure}, ${p.seviye}${p.yakinda ? '. Yakında' : ''}`}
      style={st.kart}>
      {kapak ? (
        <Karo kaynak={kapak} boyut={84} />
      ) : (
        <View style={st.yerKaro}>
          <Sayi deger={sayi ?? '—'} boyut={34} />
          <M tur="etiket" style={{ fontSize: 9 }}>
            {birim}
          </M>
        </View>
      )}
      <View style={{ flex: 1, gap: 3 }}>
        <M tur="buyuk">{p.ad}</M>
        <M tur="kucuk">{p.altBaslik}</M>
        <View style={st.etiketler}>
          <M style={st.etiket}>{p.sure}</M>
          <M style={st.etiket}>{p.seviye}</M>
          {p.yakinda ? <M style={[st.etiket, { color: Renk.voltUstu, backgroundColor: Renk.volt }]}>Yakında</M> : null}
        </View>
      </View>
      {p.yakinda ? null : <Simge ad="sag" boyut={18} renk={Renk.soluk} />}
    </KartDugme>
  );
}

const useSt = stil((Renk) => ({
  kart: { flexDirection: 'row', alignItems: 'center', gap: Bosluk.m, padding: Bosluk.m, paddingRight: Bosluk.l },
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
}));
