import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Basilabilir, Bolum, Dugme, Kart, M, SecimGrubu } from '@/components/ui';
import { Bosluk, Kose, Yazi } from '@/constants/theme';
import { PAKETLER } from '@/data/aliskanlik-paketleri';
import { basari } from '@/lib/ses';
import { useVeri } from '@/store';
import { stil, useRenk } from '@/lib/tema';

const SIMGELER = ['💪', '📖', '💧', '📵', '🧘', '🏃', '🛏️', '✍️', '🥗', '🚫', '🔥', '👟'];
const HEDEFLER = [3, 4, 5, 6, 7].map((n) => ({ deger: n, ad: String(n), okunus: `Haftada ${n} gün` }));

export default function AliskanlikEkle() {
  const Renk = useRenk();
  const st = useSt();
  const ins = useSafeAreaInsets();
  const ekle = useVeri((s) => s.aliskanlikEkle);
  const mevcut = useVeri((s) => s.aliskanliklar);
  const [ad, setAd] = useState('');
  const [kucuk, setKucuk] = useState('');
  const [simge, setSimge] = useState(SIMGELER[0]);
  const [hedef, setHedef] = useState(7);

  const kaydet = () => {
    ekle({ ad: ad.trim(), kucuk: kucuk.trim() || 'Sadece 2 dakika yap', simge, haftalikHedef: hedef });
    basari();
    router.back();
  };

  const paketEkle = (id: string) => {
    const p = PAKETLER.find((x) => x.id === id)!;
    for (const a of p.aliskanliklar) {
      if (mevcut.some((m) => m.ad === a.ad)) continue;
      ekle({ ad: a.ad, kucuk: a.kucuk, simge: a.simge, haftalikHedef: 7, program: a.program });
    }
    basari();
    router.back();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Renk.gece }}
      contentContainerStyle={{ padding: Bosluk.l, paddingBottom: ins.bottom + 40, gap: Bosluk.xl }}
      keyboardShouldPersistTaps="handled">
      <Bolum baslik="Kendi alışkanlığın">
        <TextInput
          value={ad}
          onChangeText={setAd}
          placeholder="Ne yapacaksın? (ör. 10 sayfa oku)"
          placeholderTextColor={Renk.soluk}
          style={st.girdi}
          maxLength={40}
        />
        <TextInput
          value={kucuk}
          onChangeText={setKucuk}
          placeholder="Zor günde küçük hâli (ör. 1 sayfa oku)"
          placeholderTextColor={Renk.soluk}
          style={st.girdi}
          maxLength={40}
        />
        <M tur="kucuk">Küçük hâli, canının istemediği gün için. Onu yapan da o günü kazanır.</M>
        <View style={st.simgeler} accessibilityRole="radiogroup" accessibilityLabel="Simge">
          {SIMGELER.map((s) => (
            <Basilabilir
              key={s}
              onPress={() => setSimge(s)}
              accessibilityRole="radio"
              accessibilityLabel={s}
              accessibilityState={{ checked: simge === s, selected: simge === s }}
              style={[st.simge, simge === s && st.simgeSecili]}>
              <Text style={st.simgeYazi}>{s}</Text>
            </Basilabilir>
          ))}
        </View>
        <M tur="normal">Haftada kaç gün?</M>
        <SecimGrubu etiket="Haftada kaç gün" secenekler={HEDEFLER} secili={hedef} sec={setHedef} />
        <Dugme metin="Ekle" disabled={ad.trim().length < 2} onPress={kaydet} />
      </Bolum>

      <Bolum baslik="Hazır paketler">
        {PAKETLER.map((p) => (
          <Kart key={p.id}>
            <M tur="buyuk">{p.ad}</M>
            <M tur="kucuk">{p.aciklama}</M>
            {p.aliskanliklar.map((a) => (
              <M key={a.ad} tur="normal">
                {a.simge} {a.ad}
              </M>
            ))}
            <Dugme metin="Paketi ekle" tur="ikincil" style={{ marginTop: Bosluk.s }} onPress={() => paketEkle(p.id)} />
          </Kart>
        ))}
      </Bolum>
    </ScrollView>
  );
}

const useSt = stil((Renk) => ({
  girdi: {
    backgroundColor: Renk.gece2,
    borderRadius: Kose.m,
    padding: Bosluk.l,
    color: Renk.kemik,
    fontFamily: Yazi.normal,
    fontSize: 16,
    minHeight: 56,
    includeFontPadding: false,
  },
  simgeler: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  simge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Renk.gece2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simgeSecili: { borderWidth: 2, borderColor: Renk.volt },
  simgeYazi: { fontSize: 22, lineHeight: 28, includeFontPadding: false },
}));
