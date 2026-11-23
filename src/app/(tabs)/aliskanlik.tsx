import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Baslik, Dugme, Ekran, IsaretKare, Kart, M, Sayi } from '@/components/ui';
import { Bosluk, Renk, Yazi } from '@/constants/theme';
import { tik } from '@/lib/ses';
import { buHafta, gunAnahtari, KISA_GUNLER } from '@/lib/tarih';
import { toplamGun, useVeri, type Aliskanlik } from '@/store';

export default function Aliskanliklar() {
  const aliskanliklar = useVeri((s) => s.aliskanliklar);

  return (
    <Ekran>
      <View style={st.ust}>
        <Baslik metin="Alışkanlıklar" boyut={34} />
        <Pressable onPress={() => router.push('/aliskanlik-ekle')} hitSlop={10} accessibilityRole="button" style={st.ekle}>
          <Text style={st.ekleYazi}>+</Text>
        </Pressable>
      </View>
      <View style={st.aciklama}>
        <View style={st.aciklamaSatir}>
          <IsaretKare durum="tam" boyut={16} kose={5} />
          <M tur="kucuk">dokun: yaptım</M>
        </View>
        <View style={st.aciklamaSatir}>
          <IsaretKare durum="kucuk" boyut={16} kose={5} />
          <M tur="kucuk">basılı tut: küçük hâli (o da sayılır)</M>
        </View>
      </View>

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
    <Kart style={{ gap: Bosluk.m }}>
      <Pressable
        style={st.baslikSatir}
        onLongPress={() =>
          Alert.alert(a.ad, 'Bu alışkanlığı silmek istiyor musun? Geçmiş kayıtları da gider.', [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Sil', style: 'destructive', onPress: () => sil(a.id) },
          ])
        }>
        <View style={{ flex: 1 }}>
          <M tur="buyuk">
            {a.simge} {a.ad}
          </M>
          <M tur="kucuk">Küçük hâli: {a.kucuk}</M>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Sayi deger={toplamGun(isaretler, a.id)} boyut={30} renk={Renk.kemik} />
          <M tur="etiket" style={{ fontSize: 9, marginTop: -4 }}>
            toplam gün
          </M>
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
              onLongPress={() => {
                tik(true);
                isaretle(a.id, 'kucuk', g);
              }}
              style={st.gun}>
              <IsaretKare durum={isaret} boyut={36} kose={10} bugun={g === bugun} gelecek={gelecek} />
              <Text style={[st.gunAd, g === bugun && { color: Renk.volt }]}>{KISA_GUNLER[i]}</Text>
            </Pressable>
          );
        })}
      </View>
      <M tur="kucuk" renk={hedefTamam ? Renk.volt : Renk.soluk}>
        Bu hafta {buHaftaYapilan}/{a.haftalikHedef}
        {hedefTamam ? ' · hedef tamam ✓' : ''}
      </M>
    </Kart>
  );
}

const st = StyleSheet.create({
  ust: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ekle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Renk.volt, alignItems: 'center', justifyContent: 'center' },
  ekleYazi: { fontFamily: Yazi.kalin, color: Renk.gece, fontSize: 24, lineHeight: 28 },
  aciklama: { gap: 6, marginTop: -Bosluk.s },
  aciklamaSatir: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  baslikSatir: { flexDirection: 'row', alignItems: 'center', gap: Bosluk.m },
  hafta: { flexDirection: 'row', justifyContent: 'space-between' },
  gun: { alignItems: 'center', gap: 6 },
  gunAd: { fontFamily: Yazi.orta, fontSize: 11, color: Renk.soluk },
});
