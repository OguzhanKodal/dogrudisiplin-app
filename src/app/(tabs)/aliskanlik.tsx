import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Baslik, Dugme, Ekran, Kart, M } from '@/components/ui';
import { Bosluk, Renk, Yazi } from '@/constants/theme';
import { tik } from '@/lib/ses';
import { buHafta, gunAnahtari, KISA_GUNLER } from '@/lib/tarih';
import { toplamGun, useVeri, type Aliskanlik } from '@/store';

export default function Aliskanliklar() {
  const aliskanliklar = useVeri((s) => s.aliskanliklar);

  return (
    <Ekran>
      <View style={st.ust}>
        <Baslik metin="ALIŞKANLIK" boyut={40} />
        <Pressable onPress={() => router.push('/aliskanlik-ekle')} hitSlop={10} accessibilityRole="button">
          <M tur="etiket" renk={Renk.volt}>
            + Ekle
          </M>
        </Pressable>
      </View>
      <M tur="kucuk">
        Kareye dokun: yaptım. Basılı tut: küçük hâlini yaptım (yarım kare, o da sayılır). Seri yok; toplam gün ve haftalık hedef var.
      </M>

      {aliskanliklar.length === 0 ? (
        <Kart>
          <M tur="normal">Bir alışkanlıkla başla. Küçük olsun, her gün yapılabilsin.</M>
          <Dugme metin="İlk alışkanlığını ekle" onPress={() => router.push('/aliskanlik-ekle')} />
        </Kart>
      ) : (
        aliskanliklar.map((a) => <HaftaKarti key={a.id} a={a} />)
      )}
    </Ekran>
  );
}

function HaftaKarti({ a }: { a: Aliskanlik }) {
  const isaretler = useVeri((s) => s.isaretler);
  const isaretle = useVeri((s) => s.isaretle);
  const sil = useVeri((s) => s.aliskanlikSil);
  const hafta = buHafta();
  const bugun = gunAnahtari();
  const buHaftaYapilan = hafta.filter((g) => isaretler[g]?.[a.id]).length;
  const hedefTamam = buHaftaYapilan >= a.haftalikHedef;

  return (
    <Kart>
      <Pressable
        style={st.baslikSatir}
        onLongPress={() =>
          Alert.alert(a.ad, 'Bu alışkanlığı silmek istiyor musun? Geçmiş kayıtları da gider.', [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Sil', style: 'destructive', onPress: () => sil(a.id) },
          ])
        }>
        <Text style={{ fontSize: 22 }}>{a.simge}</Text>
        <View style={{ flex: 1 }}>
          <M tur="buyuk">{a.ad}</M>
          <M tur="kucuk">Küçük hâli: {a.kucuk}</M>
        </View>
      </Pressable>
      <View style={st.hafta}>
        {hafta.map((g, i) => {
          const isaret = isaretler[g]?.[a.id];
          const gelecek = g > bugun;
          return (
            <Pressable
              key={g}
              disabled={gelecek}
              onPress={() => {
                tik();
                isaretle(a.id, isaret ? null : 'tam', g);
              }}
              onLongPress={() => isaretle(a.id, 'kucuk', g)}
              style={st.gun}>
              <Text style={[st.gunAd, g === bugun && { color: Renk.volt }]}>{KISA_GUNLER[i]}</Text>
              <View style={[st.kare, gelecek && st.kareGelecek, isaret === 'tam' && st.kareTam]}>
                {isaret === 'kucuk' ? <View style={st.yarim} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={st.altSatir}>
        <M tur="kucuk" renk={hedefTamam ? Renk.volt : Renk.soluk}>
          Bu hafta {buHaftaYapilan}/{a.haftalikHedef} {hedefTamam ? '✓ hedef tamam' : ''}
        </M>
        <M tur="kucuk">Toplam {toplamGun(isaretler, a.id)} gün</M>
      </View>
    </Kart>
  );
}

const st = StyleSheet.create({
  ust: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  baslikSatir: { flexDirection: 'row', alignItems: 'center', gap: Bosluk.m },
  hafta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Bosluk.s },
  gun: { alignItems: 'center', gap: 6, flex: 1 },
  gunAd: { fontFamily: Yazi.orta, fontSize: 11, color: Renk.soluk },
  kare: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Renk.gece3,
    overflow: 'hidden',
  },
  kareGelecek: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Renk.gece3, borderStyle: 'dashed' },
  kareTam: { backgroundColor: Renk.volt },
  yarim: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', backgroundColor: Renk.volt },
  altSatir: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Bosluk.s },
});
