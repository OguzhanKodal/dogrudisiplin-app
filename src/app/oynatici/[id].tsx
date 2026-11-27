// "Birlikte yap" oynatıcısı: YouTube #01'deki gibi sesli anons, dairesel geri sayım, "3 / 8", sıradaki hareket.
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams, usePreventRemove } from 'expo-router';
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { Alert, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Halka } from '@/components/halka';
import { HareketGorseli, Karo, kasGorseli, OnYukle } from '@/components/hareket-gorseli';
import { Simge } from '@/components/simge';
import { Basilabilir, Baslik, Dugme, M, Sayi, YuvarlakDugme } from '@/components/ui';
import { Bosluk } from '@/constants/theme';
import { programBul, type Hareket } from '@/data/programlar';
import { basari, konus, sus, tik } from '@/lib/ses';
import { stil, useRenk } from '@/lib/tema';
import { useVeri } from '@/store';

type Adim = { tur: 'giris'; sure: number } | { tur: 'hazirlan'; i: number; sure: number } | { tur: 'calis'; i: number; sure: number };

/** Konuşma süresini kabaca tahmin eder (Türkçe ~2,5 kelime/sn). */
const konusmaSuresi = (metin: string) => metin.split(/\s+/).length / 2.5;

function adimlariKur(hareketler: Hareket[], giris: string, dinlenme: number): Adim[] {
  const adimlar: Adim[] = [{ tur: 'giris', sure: Math.min(25, Math.max(6, Math.ceil(konusmaSuresi(giris)))) }];
  hareketler.forEach((h, i) => {
    adimlar.push({ tur: 'hazirlan', i, sure: Math.max(dinlenme, Math.ceil(konusmaSuresi(h.onAnons) + 1.5)) });
    adimlar.push({ tur: 'calis', i, sure: h.sure });
  });
  return adimlar;
}

const iki = (n: number) => String(n).padStart(2, '0');

/** "8 hareket, her biri 25 saniye." ya da süreler farklıysa "8 hareket, 30–40 saniye." */
function girisIpucu(hareketler: Hareket[]) {
  const s = hareketler.map((h) => h.sure);
  const en = Math.min(...s);
  const ek = Math.max(...s);
  const sure = en === ek ? `her biri ${en} saniye` : `${en}–${ek} saniye`;
  return `${hareketler.length} hareket, ${sure}. Telefonu yere koy.`;
}

// İlerleme ve halka bilgi taşır: azaltılmış harekette de akmalı (yoksa hemen sona atlar).
const DOGRUSAL = { easing: Easing.linear, reduceMotion: ReduceMotion.Never } as const;

export default function Oynatici() {
  const Renk = useRenk();
  const st = useSt();
  useKeepAwake();
  const ins = useSafeAreaInsets();
  const { width: en, height: boy } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const program = programBul(id);
  const seans = program?.seans;
  const antrenmanBitir = useVeri((s) => s.antrenmanBitir);

  const adimlar = useMemo(() => (seans ? adimlariKur(seans.hareketler, seans.giris, seans.dinlenme) : []), [seans]);
  const [adimNo, setAdimNo] = useState(0);
  // Saat ref'te akar (100 ms); ekran yalnız gösterilen saniye değişince ya da duraklatınca yeniden çizilir.
  const gecenRef = useRef(0);
  const [gecen, setGecen] = useState(0);
  const [duraklatildi, setDuraklatildi] = useState(false);
  const [bitti, setBitti] = useState(false);
  const [bitisDk, setBitisDk] = useState(0);
  const [devir, setDevir] = useState(0); // her adım değişiminde artar: halka yeniden başlar
  const toplamSn = useRef(0);
  const sonTik = useRef(-1);
  const ortaSoylendi = useRef(false);
  const ilerleme = useSharedValue(0); // çalışılan hareketin üst çubuktaki dolumu (UI thread)

  const adim = adimlar[adimNo];

  function git(n: number) {
    if (n >= adimlar.length) {
      bitir();
      return;
    }
    gecenRef.current = 0;
    setAdimNo(Math.max(0, n));
    setGecen(0);
    setDevir((d) => d + 1);
  }

  function bitir() {
    setBitisDk(Math.max(1, Math.round(toplamSn.current / 60)));
    setBitti(true);
    basari();
    if (seans) konus(seans.kapanis);
    antrenmanBitir({ programId: id, sureSn: Math.round(toplamSn.current), sinav: 0 });
  }

  function duraklat() {
    setGecen(gecenRef.current);
    setDuraklatildi(true);
    sus();
  }

  // Adım başında anons.
  const adimBasladi = useEffectEvent(() => {
    if (!seans || !adim) return;
    sonTik.current = -1;
    ortaSoylendi.current = false;
    if (adim.tur === 'giris') konus(seans.giris);
    if (adim.tur === 'hazirlan') konus(seans.hareketler[adim.i].onAnons);
    if (adim.tur === 'calis') {
      tik(true);
      konus('Başla!');
    }
  });
  useEffect(() => {
    if (!bitti) adimBasladi();
  }, [adimNo, bitti]);

  // Saat atışı: ortada ipucu, son 3 sn titreşim, süre dolunca sonraki adım. true dönerse saat durur.
  const atis = useEffectEvent((fark: number): boolean => {
    if (!adim || !seans) return true;
    toplamSn.current += fark;
    const onceki = adim.sure - gecenRef.current;
    gecenRef.current += fark;
    const g = gecenRef.current;
    const kalan = adim.sure - g;
    if (adim.tur === 'calis') {
      const h = seans.hareketler[adim.i];
      if (!ortaSoylendi.current && h.ortaAnons && g >= adim.sure * 0.4) {
        ortaSoylendi.current = true;
        konus(h.ortaAnons);
      }
      const sn = Math.ceil(kalan);
      if (sn <= 3 && sn > 0 && sn !== sonTik.current) {
        sonTik.current = sn;
        tik();
      }
    }
    if (kalan <= 0) {
      git(adimNo + 1);
      return true;
    }
    if (Math.ceil(kalan) !== Math.ceil(onceki)) setGecen(g);
    return false;
  });
  useEffect(() => {
    if (duraklatildi || bitti) return;
    let onceki = Date.now();
    const t = setInterval(() => {
      const simdi = Date.now();
      const dur = atis((simdi - onceki) / 1000);
      onceki = simdi;
      if (dur) clearInterval(t);
    }, 100);
    return () => clearInterval(t);
  }, [duraklatildi, bitti, adimNo]);

  // Üst çubukta çalışılan hareketin dolumu: halka gibi UI thread'de akar, JS saatine bağlı değil.
  const cubukAyarla = useEffectEvent(() => {
    cancelAnimation(ilerleme);
    if (!adim || adim.tur !== 'calis') {
      ilerleme.value = 0;
      return;
    }
    const oran = Math.min(1, gecenRef.current / adim.sure);
    ilerleme.value = oran;
    if (!duraklatildi && oran < 1) {
      ilerleme.value = withTiming(1, { duration: (adim.sure - gecenRef.current) * 1000, ...DOGRUSAL });
    }
  });
  useEffect(() => {
    cubukAyarla();
  }, [adimNo, duraklatildi]);
  const dolum = useAnimatedStyle(() => ({ transform: [{ scaleX: ilerleme.value }] }));

  useEffect(() => () => sus(), []);

  // Antrenman ortasında çıkış (kapat düğmesi, Android geri tuşu) onay ister; giriş anonsunda ve bitince sormaz.
  const [cikisOnayli, setCikisOnayli] = useState(false);
  usePreventRemove(!!seans && !bitti && !cikisOnayli && adimNo > 0, ({ repeat }) => {
    const zatenDurdu = duraklatildi;
    duraklat();
    Alert.alert('Antrenmanı bırakıyor musun?', 'Bu antrenman kaydedilmez.', [
      { text: 'Devam et', style: 'cancel', onPress: () => !zatenDurdu && setDuraklatildi(false) },
      {
        text: 'Bırak',
        style: 'destructive',
        onPress: () => {
          setCikisOnayli(true);
          repeat();
        },
      },
    ]);
  });

  function kapat() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  if (!seans || !program) {
    return (
      <View style={[st.ekran, { paddingTop: ins.top + 40, gap: Bosluk.l }]}>
        <M>Program bulunamadı.</M>
        <Dugme metin="Geri" onPress={kapat} />
      </View>
    );
  }

  if (bitti) {
    return (
      <View style={[st.ekran, st.ortala, { paddingTop: ins.top, paddingBottom: ins.bottom + Bosluk.l }]}>
        <Animated.View entering={FadeIn.duration(320)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Bosluk.m }}>
          <Simge ad="tik" boyut={72} renk={Renk.vurgu} />
          <Baslik metin="Bitti" boyut={56} />
          <M tur="normal" style={{ textAlign: 'center' }}>
            {bitisDk} dakikanı kendine verdin.{'\n'}Yarın aynı saatte yine buradayız.
          </M>
        </Animated.View>
        <Dugme metin="Bugüne dön" onPress={kapat} style={{ alignSelf: 'stretch' }} />
      </View>
    );
  }

  const hareketNo = adim.tur === 'giris' ? 0 : adim.i;
  const hareket = seans.hareketler[hareketNo];
  const siradaki = adim.tur === 'calis' ? seans.hareketler[adim.i + 1] : undefined;
  const kalan = Math.max(0, adim.sure - gecen);
  const calisiyor = adim.tur === 'calis';
  const etiket = adim.tur === 'giris' ? 'Hazır ol' : adim.tur === 'hazirlan' ? 'Sıradaki' : 'Çalış';
  // Çizim: dikeyde ekranın eninde kare (kısa telefonda yüksekliğe, açık katlanabilirde 520'ye göre küçülür);
  // yatayda (dönmüş telefon, açık katlanabilir yatay) solda, yüksekliğe sığacak boyda.
  const yatay = en > boy;
  const gorselBoyut = Math.round(
    yatay ? Math.min(boy - ins.top - ins.bottom - 96, (en - ins.left - ins.right) * 0.46) : Math.min(en - Bosluk.l * 2, boy * 0.42, 520),
  );
  const ipucu = adim.tur === 'giris' ? girisIpucu(seans.hareketler) : calisiyor ? hareket.ortaAnons : 'Çalışan kaslar';
  const kasGoster = !calisiyor && adim.tur !== 'giris' && !!kasGorseli(hareket.id);
  // Bir sonraki ekranda gelecek çizim: hazırlanırken bu hareketin pozları, çalışırken sıradakinin kas kartı.
  const onYuklenecek = calisiyor ? siradaki?.id : hareket.id;

  return (
    <View
      style={[
        st.ekran,
        {
          paddingTop: ins.top + Bosluk.s,
          paddingBottom: ins.bottom + Bosluk.m,
          paddingLeft: ins.left + Bosluk.l,
          paddingRight: ins.right + Bosluk.l,
        },
      ]}>
      <OnYukle id={onYuklenecek} boyut={gorselBoyut} />

      {/* Üst: kapat + ilerleme */}
      <View style={st.ust}>
        <YuvarlakDugme simge="kapat" tur="sade" boyut={40} etiket="Antrenmanı kapat" onPress={kapat} />
        <View style={st.parcalar} accessible accessibilityLabel={`${hareketNo + 1}. hareket, toplam ${seans.hareketler.length}`}>
          {seans.hareketler.map((_, i) => (
            <View key={i} style={st.parca}>
              {i < hareketNo ? <View style={[st.parcaDolu, { width: '100%' }]} /> : null}
              {i === hareketNo && calisiyor ? <Animated.View style={[st.parcaDolu, st.parcaAkan, dolum]} /> : null}
            </View>
          ))}
        </View>
      </View>

      {yatay ? (
        <View style={st.yanYana}>
          {/* Orta: çizim */}
          <View style={st.orta}>
            <Animated.View key={`${kasGoster ? 'k' : 'p'}${hareketNo}`} entering={FadeIn.duration(260)}>
              {kasGoster ? (
                <Karo kaynak={kasGorseli(hareket.id)} boyut={gorselBoyut} />
              ) : (
                <HareketGorseli id={hareket.id} ad={hareket.ad} oynuyor={calisiyor && !duraklatildi} boyut={gorselBoyut} />
              )}
            </Animated.View>
            {ipucu ? (
              <M tur="kucuk" style={st.ipucu}>
                {ipucu}
              </M>
            ) : null}
          </View>
          <View style={st.sagSutun}>
            {/* Başlık: forma numarası + hareket adı (yeni harekette yumuşakça belirir) */}
            <Animated.View key={`b${hareketNo}`} entering={FadeIn.duration(220)} style={st.baslik}>
              <Sayi deger={iki(hareketNo + 1)} boyut={58} renk={calisiyor ? Renk.volt : Renk.soluk} />
              <View style={{ flex: 1, paddingBottom: 10 }}>
                <M tur="etiket" renk={calisiyor ? Renk.vurgu : Renk.soluk}>
                  {`${etiket} · ${hareketNo + 1} / ${seans.hareketler.length}`}
                </M>
                <Baslik metin={hareket.ad} boyut={hareket.ad.length > 18 ? 22 : 28} />
              </View>
            </Animated.View>

            {/* Alt: geri sayım + kontroller */}
            <View style={st.alt}>
              <View style={st.kontroller}>
                <YuvarlakDugme simge="geri" etiket="Önceki adım" onPress={() => git(adimNo - (adim.tur === 'calis' ? 1 : 2))} />
                <Basilabilir
                  sinirsiz
                  onPress={() => {
                    tik();
                    if (duraklatildi) setDuraklatildi(false);
                    else duraklat();
                  }}
                  accessibilityLabel={duraklatildi ? 'Devam et' : 'Duraklat'}
                  accessibilityValue={{ text: `${Math.ceil(kalan)} saniye kaldı` }}>
                  <Halka
                    kalan={kalan}
                    toplam={adim.sure}
                    oynuyor={!duraklatildi}
                    anahtar={devir}
                    boyut={132}
                    renk={calisiyor ? Renk.volt : Renk.kemik}
                    alt={duraklatildi ? 'DURDU' : undefined}
                  />
                </Basilabilir>
                <YuvarlakDugme simge="ileri" etiket="Sonraki adım" onPress={() => git(adimNo + 1)} />
              </View>
              <M tur="kucuk" renk={!siradaki && calisiyor ? Renk.vurgu : Renk.soluk}>
                {siradaki
                  ? `Sıradaki: ${siradaki.ad}`
                  : calisiyor
                    ? 'Son hareket, bırakma!'
                    : duraklatildi
                      ? 'Devam için halkaya dokun'
                      : 'Durdurmak için halkaya dokun'}
              </M>
            </View>
          </View>
        </View>
      ) : (
        <>
          {/* Başlık: forma numarası + hareket adı (yeni harekette yumuşakça belirir) */}
          <Animated.View key={`b${hareketNo}`} entering={FadeIn.duration(220)} style={st.baslik}>
            <Sayi deger={iki(hareketNo + 1)} boyut={58} renk={calisiyor ? Renk.volt : Renk.soluk} />
            <View style={{ flex: 1, paddingBottom: 10 }}>
              <M tur="etiket" renk={calisiyor ? Renk.vurgu : Renk.soluk}>
                {`${etiket} · ${hareketNo + 1} / ${seans.hareketler.length}`}
              </M>
              <Baslik metin={hareket.ad} boyut={hareket.ad.length > 18 ? 22 : 28} />
            </View>
          </Animated.View>

          {/* Orta: çizim */}
          <View style={st.orta}>
            <Animated.View key={`${kasGoster ? 'k' : 'p'}${hareketNo}`} entering={FadeIn.duration(260)}>
              {kasGoster ? (
                <Karo kaynak={kasGorseli(hareket.id)} boyut={gorselBoyut} />
              ) : (
                <HareketGorseli id={hareket.id} ad={hareket.ad} oynuyor={calisiyor && !duraklatildi} boyut={gorselBoyut} />
              )}
            </Animated.View>
            {ipucu ? (
              <M tur="kucuk" style={st.ipucu}>
                {ipucu}
              </M>
            ) : null}
          </View>

          {/* Alt: geri sayım + kontroller */}
          <View style={st.alt}>
            <View style={st.kontroller}>
              <YuvarlakDugme simge="geri" etiket="Önceki adım" onPress={() => git(adimNo - (adim.tur === 'calis' ? 1 : 2))} />
              <Basilabilir
                sinirsiz
                onPress={() => {
                  tik();
                  if (duraklatildi) setDuraklatildi(false);
                  else duraklat();
                }}
                accessibilityLabel={duraklatildi ? 'Devam et' : 'Duraklat'}
                accessibilityValue={{ text: `${Math.ceil(kalan)} saniye kaldı` }}>
                <Halka
                  kalan={kalan}
                  toplam={adim.sure}
                  oynuyor={!duraklatildi}
                  anahtar={devir}
                  boyut={132}
                  renk={calisiyor ? Renk.volt : Renk.kemik}
                  alt={duraklatildi ? 'DURDU' : undefined}
                />
              </Basilabilir>
              <YuvarlakDugme simge="ileri" etiket="Sonraki adım" onPress={() => git(adimNo + 1)} />
            </View>
            <M tur="kucuk" renk={!siradaki && calisiyor ? Renk.vurgu : Renk.soluk}>
              {siradaki
                ? `Sıradaki: ${siradaki.ad}`
                : calisiyor
                  ? 'Son hareket, bırakma!'
                  : duraklatildi
                    ? 'Devam için halkaya dokun'
                    : 'Durdurmak için halkaya dokun'}
            </M>
          </View>
        </>
      )}
    </View>
  );
}

const useSt = stil((Renk) => ({
  ekran: { flex: 1, backgroundColor: Renk.gece, paddingHorizontal: Bosluk.l },
  ortala: { alignItems: 'center' },
  ust: { flexDirection: 'row', alignItems: 'center', gap: Bosluk.m, height: 48 },
  parcalar: { flex: 1, flexDirection: 'row', gap: 4 },
  parca: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Renk.gece3, overflow: 'hidden' },
  parcaDolu: { height: '100%', backgroundColor: Renk.volt },
  parcaAkan: { width: '100%', transformOrigin: 'left' },
  baslik: { flexDirection: 'row', alignItems: 'flex-end', gap: Bosluk.m, marginTop: Bosluk.s },
  orta: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Bosluk.m },
  ipucu: { textAlign: 'center', maxWidth: 290 },
  alt: { alignItems: 'center', gap: Bosluk.s },
  kontroller: { flexDirection: 'row', alignItems: 'center', gap: Bosluk.xl },
  yanYana: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Bosluk.xl },
  sagSutun: { flex: 1, justifyContent: 'center', gap: Bosluk.l },
}));
