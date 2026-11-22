import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Dugme, M } from '@/components/ui';
import { Bosluk, Kose, Renk, Yazi } from '@/constants/theme';
import { basari } from '@/lib/ses';
import { useVeri } from '@/store';

const sayiyaCevir = (s: string) => {
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) && n >= 25 && n <= 350 ? Math.round(n * 10) / 10 : undefined;
};

export default function Kilo() {
  const sonKilo = useVeri((s) => s.kilolar.at(-1)?.kg);
  const hedefKg = useVeri((s) => s.hedefKg);
  const kiloEkle = useVeri((s) => s.kiloEkle);
  const hedefAyarla = useVeri((s) => s.hedefKgAyarla);
  const [kg, setKg] = useState(sonKilo ? String(sonKilo).replace('.', ',') : '');
  const [hedef, setHedef] = useState(hedefKg ? String(hedefKg).replace('.', ',') : '');

  const kgSayi = sayiyaCevir(kg);

  return (
    <View style={st.ekran}>
      <M tur="etiket">Bugünkü kilon</M>
      <TextInput
        value={kg}
        onChangeText={setKg}
        keyboardType="decimal-pad"
        placeholder="ör. 78,4"
        placeholderTextColor={Renk.soluk}
        style={st.girdi}
        autoFocus
      />
      <M tur="etiket">Hedef (isteğe bağlı)</M>
      <TextInput
        value={hedef}
        onChangeText={setHedef}
        keyboardType="decimal-pad"
        placeholder="ör. 75"
        placeholderTextColor={Renk.soluk}
        style={[st.girdi, { fontSize: 22 }]}
      />
      <Dugme
        metin="Kaydet"
        disabled={!kgSayi}
        onPress={() => {
          if (!kgSayi) return;
          kiloEkle(kgSayi);
          hedefAyarla(sayiyaCevir(hedef));
          basari();
          router.back();
        }}
      />
    </View>
  );
}

const st = StyleSheet.create({
  ekran: { flex: 1, backgroundColor: Renk.gece, padding: Bosluk.l, gap: Bosluk.m },
  girdi: {
    backgroundColor: Renk.gece2,
    borderRadius: Kose.m,
    padding: Bosluk.l,
    color: Renk.kemik,
    fontFamily: Yazi.baslik,
    fontSize: 34,
  },
});
