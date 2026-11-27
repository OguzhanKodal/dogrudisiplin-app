import { StyleSheet, Text, View } from 'react-native';

import { Basilabilir, IsaretKare } from '@/components/ui';
import { Bosluk, Yazi } from '@/constants/theme';
import { tik } from '@/lib/ses';
import { gunAnahtari } from '@/lib/tarih';
import { useVeri, type Aliskanlik } from '@/store';
import { stil, useRenk } from '@/lib/tema';

/** Dokun: yaptım. Basılı tut: küçük hâlini yaptım (o da sayılır). Tekrar dokun: geri al. */
export function AliskanlikSatiri({ a, gun = gunAnahtari(), son }: { a: Aliskanlik; gun?: string; son?: boolean }) {
  const Renk = useRenk();
  const st = useSt();
  const isaret = useVeri((s) => s.isaretler[gun]?.[a.id]);
  const isaretle = useVeri((s) => s.isaretle);

  return (
    <Basilabilir
      accessibilityRole="checkbox"
      accessibilityLabel={a.ad}
      accessibilityState={{ checked: isaret === 'tam' ? true : isaret === 'kucuk' ? 'mixed' : false }}
      accessibilityHint="Basılı tutarsan küçük hâlini yaptın sayılır"
      onPress={() => {
        tik();
        isaretle(a.id, isaret ? null : 'tam', gun);
      }}
      onLongPress={() => {
        tik(true);
        isaretle(a.id, 'kucuk', gun);
      }}
      olcek={false}
      style={[st.satir, !son && st.cizgi]}>
      <IsaretKare durum={isaret} boyut={28} tikli />
      <View style={{ flex: 1 }}>
        <Text style={[st.ad, isaret && { color: Renk.soluk }]}>{a.ad}</Text>
        <Text style={st.kucuk}>{isaret === 'kucuk' ? `Küçük hâli yapıldı · ${a.kucuk}` : `Küçük hâli: ${a.kucuk}`}</Text>
      </View>
      <Text style={st.simge}>{a.simge}</Text>
    </Basilabilir>
  );
}

const useSt = stil((Renk) => ({
  satir: { flexDirection: 'row', alignItems: 'center', gap: Bosluk.m, paddingVertical: 14 },
  cizgi: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Renk.pasif },
  simge: { fontSize: 20, opacity: 0.9 },
  ad: { fontFamily: Yazi.orta, color: Renk.kemik, fontSize: 16 },
  kucuk: { fontFamily: Yazi.normal, color: Renk.soluk, fontSize: 12.5, marginTop: 2 },
}));
