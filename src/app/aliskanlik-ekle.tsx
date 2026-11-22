import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bolum, Dugme, Kart, M } from '@/components/ui';
import { Bosluk, Kose, Renk, Yazi } from '@/constants/theme';
import { PAKETLER } from '@/data/aliskanlik-paketleri';
import { basari } from '@/lib/ses';
import { useVeri } from '@/store';

const SIMGELER = ['💪', '📖', '💧', '📵', '🧘', '🏃', '🛏️', '✍️', '🥗', '🚫', '🔥', '👟'];

export default function AliskanlikEkle() {
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
        <View style={st.simgeler}>
          {SIMGELER.map((s) => (
            <Pressable key={s} onPress={() => setSimge(s)} style={[st.simge, simge === s && st.simgeSecili]}>
              <Text style={{ fontSize: 22 }}>{s}</Text>
            </Pressable>
          ))}
        </View>
        <View style={st.hedefSatir}>
          <M tur="normal">Haftada kaç gün?</M>
          <View style={st.hedefler}>
            {[3, 4, 5, 6, 7].map((n) => (
              <Pressable key={n} onPress={() => setHedef(n)} style={[st.hedef, hedef === n && st.hedefSecili]}>
                <Text style={[st.hedefYazi, hedef === n && { color: Renk.gece }]}>{n}</Text>
              </Pressable>
            ))}
          </View>
        </View>
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

const st = StyleSheet.create({
  girdi: {
    backgroundColor: Renk.gece2,
    borderRadius: Kose.m,
    padding: Bosluk.l,
    color: Renk.kemik,
    fontFamily: Yazi.normal,
    fontSize: 16,
  },
  simgeler: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  simge: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: Renk.gece2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simgeSecili: { borderWidth: 2, borderColor: Renk.volt },
  hedefSatir: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hedefler: { flexDirection: 'row', gap: 6 },
  hedef: { width: 36, height: 36, borderRadius: 18, backgroundColor: Renk.gece2, alignItems: 'center', justifyContent: 'center' },
  hedefSecili: { backgroundColor: Renk.volt },
  hedefYazi: { fontFamily: Yazi.kalin, color: Renk.kemik, fontSize: 14 },
});
