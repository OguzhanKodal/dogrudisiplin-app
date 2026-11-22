import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AliskanlikSatiri } from '@/components/aliskanlik-satiri';
import { Baslik, Bolum, Cubuk, Dugme, Ekran, Kart, M } from '@/components/ui';
import { Bosluk, Renk } from '@/constants/theme';
import { programBul } from '@/data/programlar';
import { gunAnahtari, uzunTarih } from '@/lib/tarih';
import { useVeri, uzunBugun } from '@/store';

const BOS = {};

export default function Bugun() {
  const aliskanliklar = useVeri((s) => s.aliskanliklar);
  const bugunIsaret: Record<string, unknown> = useVeri((s) => s.isaretler[gunAnahtari()] ?? BOS);
  const antrenmanlar = useVeri((s) => s.antrenmanlar);
  const uzun = useVeri((s) => s.uzun);

  const bugun = gunAnahtari();
  const yapilan = aliskanliklar.filter((a) => bugunIsaret[a.id]).length;
  const bugunAntrenman = antrenmanlar.some((a) => a.tarih === bugun && a.programId === 'sabah-5');
  const toplamGunSayisi = new Set(antrenmanlar.map((a) => a.tarih)).size;

  const sinav = programBul('sinav-30')!;
  const sinavIl = uzun['sinav-30'];
  const sinavGun = uzunBugun(sinavIl, sinav.gunler!.length);
  const sinavHedef = sinav.gunler![sinavGun - 1];
  const sinavBugunYapildi = sinavIl ? sinavIl.tamam[sinavGun] !== undefined : false;

  return (
    <Ekran>
      <View style={st.ust}>
        <View style={{ flex: 1 }}>
          <M tur="etiket">{uzunTarih()}</M>
          <Baslik metin="BUGÜN" vurgu={aliskanliklar.length ? `${yapilan}/${aliskanliklar.length}` : undefined} boyut={40} />
        </View>
        <Link href="/hakkinda" asChild>
          <Pressable accessibilityLabel="Ayarlar" hitSlop={10}>
            <Image source={require('@/assets/images/icon.png')} style={st.avatar} />
          </Pressable>
        </Link>
      </View>

      <Kart vurgulu={!bugunAntrenman}>
        <M tur="etiket" renk={Renk.volt}>
          {bugunAntrenman ? 'Bugünkü antrenman bitti ✓' : 'Bugünün antrenmanı'}
        </M>
        <Baslik metin="SABAH 5 DAKİKA" boyut={26} />
        <M tur="kucuk">8 hareket · ekipmansız · seninle birlikte sesli</M>
        <Dugme
          metin={bugunAntrenman ? 'Bir daha yap' : 'Başla'}
          tur={bugunAntrenman ? 'ikincil' : 'ana'}
          style={{ marginTop: Bosluk.s }}
          onPress={() => router.push('/oynatici/sabah-5')}
        />
      </Kart>

      <Pressable onPress={() => router.push('/program/sinav-30')}>
        <Kart>
          <View style={st.satir}>
            <M tur="etiket">30 gün şınav</M>
            <M tur="kucuk">{sinavIl ? `Gün ${sinavGun}/30` : 'Başlamadın'}</M>
          </View>
          {sinavIl ? (
            <>
              <M tur="buyuk">
                {sinavHedef.dinlenme
                  ? 'Bugün dinlenme günü'
                  : sinavBugunYapildi
                    ? `Bugün ${sinavIl.tamam[sinavGun]} şınav ✓`
                    : `Bugün hedef: ${sinavHedef.hedef} şınav`}
              </M>
              <Cubuk oran={Object.keys(sinavIl.tamam).length / 30} />
            </>
          ) : (
            <M tur="normal">Her gün biraz daha fazla. Başlamak için dokun.</M>
          )}
        </Kart>
      </Pressable>

      <Bolum
        baslik="Alışkanlıklar"
        sag={
          <Link href="/aliskanlik-ekle" asChild>
            <Pressable hitSlop={10}>
              <M tur="etiket" renk={Renk.volt}>
                + Ekle
              </M>
            </Pressable>
          </Link>
        }>
        {aliskanliklar.length === 0 ? (
          <Kart>
            <M tur="normal">Henüz alışkanlık yok. Kendin ekle ya da hazır paketlerden seç.</M>
            <Dugme metin="Alışkanlık ekle" tur="ikincil" onPress={() => router.push('/aliskanlik-ekle')} />
          </Kart>
        ) : (
          aliskanliklar.map((a) => <AliskanlikSatiri key={a.id} a={a} />)
        )}
        {aliskanliklar.length > 0 ? (
          <M tur="kucuk" style={{ textAlign: 'center' }}>
            Basılı tutarsan küçük hâlini yapmış sayılırsın. Zor günde de zincir kopmaz.
          </M>
        ) : null}
      </Bolum>

      <Kart>
        <M tur="etiket">Toplam</M>
        <Baslik metin={`${toplamGunSayisi} GÜN`} boyut={34} />
        <M tur="kucuk">antrenman yaptığın gün. Bu sayı hiç sıfırlanmaz.</M>
      </Kart>
    </Ekran>
  );
}

const st = StyleSheet.create({
  ust: { flexDirection: 'row', alignItems: 'flex-end', gap: Bosluk.m },
  avatar: { width: 44, height: 44, borderRadius: 12 },
  satir: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
