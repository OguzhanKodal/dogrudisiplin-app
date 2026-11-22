import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bosluk, Kose, Renk, Yazi } from '@/constants/theme';
import { tik } from '@/lib/ses';
import { gunAnahtari } from '@/lib/tarih';
import { useVeri, type Aliskanlik } from '@/store';

/** Dokun: yaptım. Basılı tut: küçük hâlini yaptım (o da sayılır). Tekrar dokun: geri al. */
export function AliskanlikSatiri({ a, gun = gunAnahtari() }: { a: Aliskanlik; gun?: string }) {
  const isaret = useVeri((s) => s.isaretler[gun]?.[a.id]);
  const isaretle = useVeri((s) => s.isaretle);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!isaret }}
      accessibilityHint="Basılı tutarsan küçük hâlini yaptın sayılır"
      onPress={() => {
        tik();
        isaretle(a.id, isaret ? null : 'tam', gun);
      }}
      onLongPress={() => {
        tik(true);
        isaretle(a.id, 'kucuk', gun);
      }}
      style={({ pressed }) => [st.satir, pressed && { opacity: 0.85 }]}>
      <View style={[st.kutu, isaret === 'tam' && st.kutuTam, isaret === 'kucuk' && st.kutuKucuk]}>
        {isaret === 'tam' ? <Text style={st.tik}>✓</Text> : null}
        {isaret === 'kucuk' ? <View style={st.yarim} /> : null}
      </View>
      <Text style={st.simge}>{a.simge}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[st.ad, isaret && { color: Renk.soluk }]}>{a.ad}</Text>
        <Text style={st.kucuk}>
          {isaret === 'kucuk' ? `Küçük hâli yapıldı: ${a.kucuk}` : `Zor gün mü? ${a.kucuk}`}
        </Text>
      </View>
    </Pressable>
  );
}

const st = StyleSheet.create({
  satir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Bosluk.m,
    backgroundColor: Renk.gece2,
    borderRadius: Kose.m,
    padding: Bosluk.m,
    paddingVertical: 14,
  },
  kutu: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Renk.volt,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  kutuTam: { backgroundColor: Renk.volt },
  kutuKucuk: {},
  yarim: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', backgroundColor: Renk.volt },
  tik: { color: Renk.gece, fontFamily: Yazi.kalin, fontSize: 16, marginTop: -1 },
  simge: { fontSize: 22 },
  ad: { fontFamily: Yazi.orta, color: Renk.kemik, fontSize: 15 },
  kucuk: { fontFamily: Yazi.normal, color: Renk.soluk, fontSize: 12, marginTop: 2 },
});
