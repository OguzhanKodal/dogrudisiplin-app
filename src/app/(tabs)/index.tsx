import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AliskanlikSatiri } from '@/components/aliskanlik-satiri';
import { kapakGorseli, Karo } from '@/components/hareket-gorseli';
import { Baslik, Bolum, Cubuk, Dugme, Ekran, IsaretKare, Kart, M, Sayi } from '@/components/ui';
import { Bosluk, Kose, Yazi } from '@/constants/theme';
import { programBul } from '@/data/programlar';
import { buHafta, gunAnahtari, KISA_GUNLER, uzunTarih } from '@/lib/tarih';
import { disiplinGunu, gunDurumu, useVeri, uzunBugun } from '@/store';
import { stil, useRenk } from '@/lib/tema';

const BOS = {};

export default function Bugun() {
  const Renk = useRenk();
  const st = useSt();
  const aliskanliklar = useVeri((s) => s.aliskanliklar);
  const isaretler = useVeri((s) => s.isaretler);
  const bugunIsaret: Record<string, unknown> = useVeri((s) => s.isaretler[gunAnahtari()] ?? BOS);
  const antrenmanlar = useVeri((s) => s.antrenmanlar);
  const uzun = useVeri((s) => s.uzun);

  const bugun = gunAnahtari();
  const yapilan = aliskanliklar.filter((a) => bugunIsaret[a.id]).length;
  const bugunAntrenman = antrenmanlar.some((a) => a.tarih === bugun && a.programId === 'sabah-5');
  const antrenmanGunleri = useMemo(() => new Set(antrenmanlar.map((a) => a.tarih)), [antrenmanlar]);
  const toplam = disiplinGunu(isaretler, antrenmanGunleri);
  const hafta = buHafta();

  const sabah = programBul('sabah-5')!;
  const sinav = programBul('sinav-30')!;
  const sinavIl = uzun['sinav-30'];
  const sinavGun = uzunBugun(sinavIl, sinav.gunler!.length);
  const sinavHedef = sinav.gunler![sinavGun - 1];
  const sinavBugunYapildi = sinavIl ? sinavIl.tamam[sinavGun] !== undefined : false;

  return (
    <Ekran>
      {/* Üst: tarih + ayarlar */}
      <View style={st.ust}>
        <M tur="etiket">{uzunTarih()}</M>
        <Link href="/hakkinda" asChild>
          <Pressable accessibilityLabel="Ayarlar" hitSlop={10}>
            <Image source={require('@/assets/images/icon.png')} style={st.avatar} />
          </Pressable>
        </Link>
      </View>

      {/* Disiplin günü sayacı: hiç sıfırlanmaz */}
      <View style={st.sayac}>
        <Sayi deger={toplam} boyut={88} />
        <View style={st.sayacYazi}>
          <Text style={st.sayacBaslik}>disiplin günü</Text>
          <M tur="kucuk">bu sayı hiç sıfırlanmaz</M>
        </View>
      </View>

      {/* Bu hafta */}
      <View style={st.hafta}>
        {hafta.map((g, i) => (
          <View key={g} style={st.haftaGun}>
            <IsaretKare durum={gunDurumu(g, isaretler, antrenmanGunleri)} boyut={36} kose={10} bugun={g === bugun} gelecek={g > bugun} />
            <Text style={[st.haftaAd, g === bugun && { color: Renk.vurgu }]}>{KISA_GUNLER[i]}</Text>
          </View>
        ))}
      </View>

      {/* Bugünün antrenmanı */}
      <Pressable onPress={() => router.push('/oynatici/sabah-5')} style={({ pressed }) => pressed && { opacity: 0.9 }}>
        <Kart vurgulu={!bugunAntrenman} style={{ gap: Bosluk.m }}>
          <View style={st.seri}>
            {sabah.seans!.hareketler.slice(0, 4).map((h, i) => (
              <View key={h.id} style={{ flex: 1 }}>
                <View style={{ aspectRatio: 1 }}>
                  <OlcekliKaro kaynak={kapakGorseli(h.id)} />
                </View>
                <Sayi deger={`0${i + 1}`} boyut={14} style={st.seriNo} />
              </View>
            ))}
          </View>
          <View style={{ gap: 2 }}>
            <M tur="etiket" renk={Renk.vurgu}>
              {bugunAntrenman ? 'Bugünkü antrenman bitti ✓' : 'Bugünün antrenmanı'}
            </M>
            <View style={st.satir}>
              <View style={{ flex: 1 }}>
                <Baslik metin="Sabah 5 dakika" boyut={24} />
                <M tur="kucuk">8 hareket · ekipmansız · sesli</M>
              </View>
              <View style={[st.oyna, bugunAntrenman && { backgroundColor: Renk.gece3 }]}>
                <Text style={[st.oynaYazi, bugunAntrenman && { color: Renk.kemik }]}>{bugunAntrenman ? '↻' : '▶'}</Text>
              </View>
            </View>
          </View>
        </Kart>
      </Pressable>

      {/* 30 gün şınav */}
      <Pressable onPress={() => router.push('/program/sinav-30')} style={({ pressed }) => pressed && { opacity: 0.9 }}>
        <Kart style={st.uzunKart}>
          <Karo kaynak={kapakGorseli('sinav')} boyut={64} />
          <View style={{ flex: 1, gap: 4 }}>
            <View style={st.satir}>
              <M tur="etiket">30 gün şınav</M>
              <M tur="kucuk">{sinavIl ? `Gün ${sinavGun}/30` : 'Başlamadın'}</M>
            </View>
            <M tur="buyuk">
              {!sinavIl
                ? 'Her gün biraz daha fazla'
                : sinavHedef.dinlenme
                  ? 'Bugün dinlenme günü'
                  : sinavBugunYapildi
                    ? `Bugün ${sinavIl.tamam[sinavGun]} şınav ✓`
                    : `Bugün hedef: ${sinavHedef.hedef} şınav`}
            </M>
            {sinavIl ? <Cubuk oran={Object.keys(sinavIl.tamam).length / 30} /> : null}
          </View>
        </Kart>
      </Pressable>

      <Bolum
        baslik={aliskanliklar.length ? `Alışkanlıklar · ${yapilan}/${aliskanliklar.length}` : 'Alışkanlıklar'}
        sag={
          <Link href="/aliskanlik-ekle" asChild>
            <Pressable hitSlop={10}>
              <M tur="etiket" renk={Renk.vurgu}>
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
          <View>
            {aliskanliklar.map((a, i) => (
              <AliskanlikSatiri key={a.id} a={a} son={i === aliskanliklar.length - 1} />
            ))}
          </View>
        )}
        {aliskanliklar.length > 0 ? (
          <M tur="kucuk" style={{ textAlign: 'center' }}>
            Basılı tutarsan küçük hâlini yapmış sayılırsın. Zor günde de zincir kopmaz.
          </M>
        ) : null}
      </Bolum>
    </Ekran>
  );
}

/** Genişliği kapsayıcıdan alan kare çizim (köşe oranı korunur). */
function OlcekliKaro({ kaynak }: { kaynak?: number }) {
  const Renk = useRenk();
  return (
    <View style={{ flex: 1, borderRadius: Kose.s, overflow: 'hidden', backgroundColor: Renk.gece3 }}>
      {kaynak ? <Image source={kaynak} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
    </View>
  );
}

const useSt = stil((Renk) => ({
  ust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: 38, height: 38, borderRadius: 12 },
  sayac: { flexDirection: 'row', alignItems: 'flex-end', gap: Bosluk.m, marginTop: -Bosluk.s },
  sayacYazi: { paddingBottom: 18, gap: 2 },
  sayacBaslik: { fontFamily: Yazi.kalin, color: Renk.kemik, fontSize: 17 },
  hafta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -Bosluk.s },
  haftaGun: { alignItems: 'center', gap: 6 },
  haftaAd: { fontFamily: Yazi.orta, color: Renk.soluk, fontSize: 11 },
  seri: { flexDirection: 'row', gap: 6 },
  seriNo: { position: 'absolute', left: 6, top: 2 },
  satir: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Bosluk.m },
  oyna: { width: 50, height: 50, borderRadius: 25, backgroundColor: Renk.volt, alignItems: 'center', justifyContent: 'center' },
  oynaYazi: { color: Renk.voltUstu, fontSize: 18, marginLeft: 3 },
  uzunKart: { flexDirection: 'row', alignItems: 'center', gap: Bosluk.m, padding: Bosluk.m },
}));
