import { router } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Basilabilir, Baslik, Dugme, Ekran, IsaretKare, Kart, M, Sayi, YuvarlakDugme } from '@/components/ui';
import { Bosluk, Yazi } from '@/constants/theme';
import { tik } from '@/lib/ses';
import { buHafta, gunAnahtari, KISA_GUNLER } from '@/lib/tarih';
import { toplamGun, useVeri, type Aliskanlik } from '@/store';
import { stil, useRenk } from '@/lib/tema';

const GUN_ADLARI = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export default function Aliskanliklar() {
  const st = useSt();
  const aliskanliklar = useVeri((s) => s.aliskanliklar);

  return (
    <Ekran>
      <View style={st.ust}>
        <Baslik metin="Alışkanlıklar" boyut={34} />
        <YuvarlakDugme simge="arti" tur="ana" boyut={40} etiket="Alışkanlık ekle" onPress={() => router.push('/aliskanlik-ekle')} />
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
  const Renk = useRenk();
  const st = useSt();
  const hafta = buHafta();
  // Yalnız bu alışkanlığın bu haftası ve toplamı izlenir: başka bir kartta işaretleme bu kartı yeniden çizmez.
  const haftaIsaret = useVeri(useShallow((s) => hafta.map((g) => s.isaretler[g]?.[a.id])));
  const toplam = useVeri((s) => toplamGun(s.isaretler, a.id));
  const isaretle = useVeri((s) => s.isaretle);
  const sil = useVeri((s) => s.aliskanlikSil);
  const bugun = gunAnahtari();
  const buHaftaYapilan = haftaIsaret.filter(Boolean).length;
  const hedefTamam = buHaftaYapilan >= a.haftalikHedef;

  return (
    <Kart style={{ gap: Bosluk.m }}>
      <Pressable
        style={st.baslikSatir}
        accessibilityHint="Silmek için basılı tut"
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
          <Sayi deger={toplam} boyut={30} renk={Renk.kemik} />
          <M tur="etiket" style={{ fontSize: 9, marginTop: -4 }}>
            toplam gün
          </M>
        </View>
      </Pressable>
      <View style={st.hafta}>
        {hafta.map((g, i) => {
          const isaret = haftaIsaret[i];
          const gelecek = g > bugun;
          return (
            <Basilabilir
              key={g}
              sinirsiz
              disabled={gelecek}
              accessibilityRole="checkbox"
              accessibilityLabel={GUN_ADLARI[i]}
              accessibilityState={{ checked: isaret === 'tam' ? true : isaret === 'kucuk' ? 'mixed' : false, disabled: gelecek }}
              accessibilityHint="Basılı tutarsan küçük hâli sayılır"
              hitSlop={{ left: 4, right: 4 }}
              onPress={() => {
                tik();
                isaretle(a.id, isaret ? null : 'tam', g);
              }}
              onLongPress={() => {
                tik(true);
                isaretle(a.id, 'kucuk', g);
              }}
              pasifSoluk={false}
              style={st.gun}>
              <IsaretKare durum={isaret} boyut={36} kose={10} bugun={g === bugun} gelecek={gelecek} />
              <Text style={[st.gunAd, g === bugun && { color: Renk.vurgu }]}>{KISA_GUNLER[i]}</Text>
            </Basilabilir>
          );
        })}
      </View>
      <M tur="kucuk" renk={hedefTamam ? Renk.vurgu : Renk.soluk}>
        Bu hafta {buHaftaYapilan}/{a.haftalikHedef}
        {hedefTamam ? ' · hedef tamam ✓' : ''}
      </M>
    </Kart>
  );
}

const useSt = stil((Renk) => ({
  ust: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aciklama: { gap: 6, marginTop: -Bosluk.s },
  aciklamaSatir: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  baslikSatir: { flexDirection: 'row', alignItems: 'center', gap: Bosluk.m },
  hafta: { flexDirection: 'row', justifyContent: 'space-between' },
  gun: { alignItems: 'center', gap: 6 },
  gunAd: { fontFamily: Yazi.orta, fontSize: 11, color: Renk.soluk },
}));
