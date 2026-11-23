// "Birlikte yap" oynatıcısı: YouTube #01'deki gibi sesli anons, dairesel geri sayım, "3 / 8", sıradaki hareket.
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Halka } from '@/components/halka';
import { HareketGorseli, Karo, kasGorseli } from '@/components/hareket-gorseli';
import { Baslik, Dugme, M, Sayi } from '@/components/ui';
import { Bosluk, Renk, Yazi } from '@/constants/theme';
import { programBul, type Hareket } from '@/data/programlar';
import { basari, konus, sus, tik } from '@/lib/ses';
import { useVeri } from '@/store';

type Adim =
  | { tur: 'giris'; sure: number }
  | { tur: 'hazirlan'; i: number; sure: number }
  | { tur: 'calis'; i: number; sure: number };

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

export default function Oynatici() {
  useKeepAwake();
  const ins = useSafeAreaInsets();
  const { width: en, height: boy } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const program = programBul(id);
  const seans = program?.seans;
  const antrenmanBitir = useVeri((s) => s.antrenmanBitir);

  const adimlar = useMemo(() => (seans ? adimlariKur(seans.hareketler, seans.giris, seans.dinlenme) : []), [seans]);
  const [adimNo, setAdimNo] = useState(0);
  const [gecen, setGecen] = useState(0); // bu adımda geçen sn
  const [duraklatildi, setDuraklatildi] = useState(false);
  const [bitti, setBitti] = useState(false);
  const [devir, setDevir] = useState(0); // her adım değişiminde artar: halka yeniden başlar
  const toplamSn = useRef(0);
  const sonTik = useRef(-1);
  const ortaSoylendi = useRef(false);

  const adim = adimlar[adimNo];

  // Adım başında anons.
  useEffect(() => {
    if (!seans || !adim || bitti) return;
    sonTik.current = -1;
    ortaSoylendi.current = false;
    if (adim.tur === 'giris') konus(seans.giris);
    if (adim.tur === 'hazirlan') konus(seans.hareketler[adim.i].onAnons);
    if (adim.tur === 'calis') {
      tik(true);
      konus('Başla!');
    }
  }, [adimNo, bitti]); // eslint-disable-line react-hooks/exhaustive-deps

  // Saat: 200 ms adımlarla (halka kendi animasyonuyla akar) ilerler, duraklatılınca durur.
  useEffect(() => {
    if (duraklatildi || bitti || !adim) return;
    let onceki = Date.now();
    const t = setInterval(() => {
      const simdi = Date.now();
      const fark = (simdi - onceki) / 1000;
      onceki = simdi;
      toplamSn.current += fark;
      setGecen((g) => g + fark);
    }, 200);
    return () => clearInterval(t);
  }, [duraklatildi, bitti, adimNo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Süre olayları: ortada ipucu, son 3 sn titreşim, süre dolunca sonraki adım.
  useEffect(() => {
    if (!adim || bitti || !seans) return;
    const kalan = adim.sure - gecen;
    if (adim.tur === 'calis') {
      const h = seans.hareketler[adim.i];
      if (!ortaSoylendi.current && h.ortaAnons && gecen >= adim.sure * 0.4) {
        ortaSoylendi.current = true;
        konus(h.ortaAnons);
      }
      const sn = Math.ceil(kalan);
      if (sn <= 3 && sn > 0 && sn !== sonTik.current) {
        sonTik.current = sn;
        tik();
      }
    }
    if (kalan <= 0) git(adimNo + 1);
  }, [gecen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => sus(), []);

  function git(n: number) {
    if (n >= adimlar.length) {
      bitir();
      return;
    }
    setAdimNo(Math.max(0, n));
    setGecen(0);
    setDevir((d) => d + 1);
  }

  function bitir() {
    setBitti(true);
    basari();
    if (seans) konus(seans.kapanis);
    antrenmanBitir({ programId: id, sureSn: Math.round(toplamSn.current), sinav: 0 });
  }

  function kapat() {
    sus();
    router.back();
  }

  if (!seans || !program) {
    return (
      <View style={[st.ekran, { paddingTop: ins.top + 40 }]}>
        <M>Program bulunamadı.</M>
        <Dugme metin="Geri" onPress={kapat} />
      </View>
    );
  }

  if (bitti) {
    return (
      <View style={[st.ekran, st.ortala, { paddingTop: ins.top, paddingBottom: ins.bottom + Bosluk.l }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Bosluk.m }}>
          <Text style={st.bittiIsaret}>✓</Text>
          <Baslik metin="Bitti" boyut={56} />
          <M tur="normal" style={{ textAlign: 'center' }}>
            {Math.round(toplamSn.current / 60)} dakikanı kendine verdin.{'\n'}Yarın aynı saatte yine buradayız.
          </M>
        </View>
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
  // Çizim: ekranın eninde kare; kısa telefonlarda yüksekliğe göre küçülür.
  const gorselBoyut = Math.min(en - Bosluk.l * 2, boy * 0.4);
  const ipucu = adim.tur === 'giris' ? '8 hareket, her biri 25 saniye. Telefonu yere koy.' : calisiyor ? hareket.ortaAnons : 'Çalışan kaslar';

  return (
    <View style={[st.ekran, { paddingTop: ins.top + Bosluk.s, paddingBottom: ins.bottom + Bosluk.m }]}>
      {/* Üst: kapat + ilerleme */}
      <View style={st.ust}>
        <Pressable onPress={kapat} hitSlop={12} accessibilityLabel="Antrenmanı kapat" style={st.kapat}>
          <Text style={st.kapatYazi}>✕</Text>
        </Pressable>
        <View style={st.parcalar}>
          {seans.hareketler.map((_, i) => (
            <View key={i} style={st.parca}>
              {i < hareketNo ? <View style={[st.parcaDolu, { width: '100%' }]} /> : null}
              {i === hareketNo && calisiyor ? <View style={[st.parcaDolu, { width: `${(gecen / adim.sure) * 100}%` }]} /> : null}
            </View>
          ))}
        </View>
      </View>

      {/* Başlık: forma numarası + hareket adı */}
      <View style={st.baslik}>
        <Sayi deger={`0${hareketNo + 1}`} boyut={58} renk={calisiyor ? Renk.volt : Renk.pasif} />
        <View style={{ flex: 1, paddingBottom: 10 }}>
          <M tur="etiket" renk={calisiyor ? Renk.volt : Renk.soluk}>
            {`${etiket} · ${hareketNo + 1} / ${seans.hareketler.length}`}
          </M>
          <Baslik metin={hareket.ad} boyut={hareket.ad.length > 18 ? 22 : 28} />
        </View>
      </View>

      {/* Orta: çizim */}
      <View style={st.orta}>
        {!calisiyor && adim.tur !== 'giris' && kasGorseli(hareket.id) ? (
          <Karo kaynak={kasGorseli(hareket.id)} boyut={gorselBoyut} />
        ) : (
          <HareketGorseli id={hareket.id} ad={hareket.ad} oynuyor={calisiyor && !duraklatildi} boyut={gorselBoyut} />
        )}
        {ipucu ? (
          <M tur="kucuk" style={st.ipucu}>
            {ipucu}
          </M>
        ) : null}
      </View>

      {/* Alt: geri sayım + kontroller */}
      <View style={st.alt}>
        <View style={st.kontroller}>
          <Kontrol simge="⏮" etiket="Geri" onPress={() => git(adimNo - (adim.tur === 'calis' ? 1 : 2))} />
          <Pressable
            onPress={() => {
              tik();
              if (!duraklatildi) sus();
              setDuraklatildi((d) => !d);
            }}
            accessibilityLabel={duraklatildi ? 'Devam et' : 'Duraklat'}>
            <Halka
              kalan={kalan}
              toplam={adim.sure}
              oynuyor={!duraklatildi}
              anahtar={devir}
              boyut={132}
              renk={calisiyor ? Renk.volt : Renk.kemik}
              alt={duraklatildi ? 'DURDU' : undefined}
            />
          </Pressable>
          <Kontrol simge="⏭" etiket="Atla" onPress={() => git(adimNo + 1)} />
        </View>
        <M tur="kucuk" renk={!siradaki && calisiyor ? Renk.volt : Renk.soluk}>
          {siradaki ? `Sıradaki: ${siradaki.ad}` : calisiyor ? 'Son hareket, bırakma!' : duraklatildi ? 'Devam için halkaya dokun' : 'Durdurmak için halkaya dokun'}
        </M>
      </View>
    </View>
  );
}

function Kontrol({ simge, etiket, onPress }: { simge: string; etiket: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={st.kontrol} accessibilityLabel={etiket} hitSlop={8}>
      <Text style={st.kontrolYazi}>{simge}</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  ekran: { flex: 1, backgroundColor: Renk.gece, paddingHorizontal: Bosluk.l },
  ortala: { alignItems: 'center' },
  ust: { flexDirection: 'row', alignItems: 'center', gap: Bosluk.m, height: 40 },
  kapat: { width: 32, height: 32, borderRadius: 16, backgroundColor: Renk.gece2, alignItems: 'center', justifyContent: 'center' },
  kapatYazi: { color: Renk.soluk, fontSize: 15 },
  parcalar: { flex: 1, flexDirection: 'row', gap: 4 },
  parca: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Renk.gece3, overflow: 'hidden' },
  parcaDolu: { height: '100%', backgroundColor: Renk.volt },
  baslik: { flexDirection: 'row', alignItems: 'flex-end', gap: Bosluk.m, marginTop: Bosluk.m },
  orta: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Bosluk.m },
  ipucu: { textAlign: 'center', maxWidth: 290 },
  alt: { alignItems: 'center', gap: Bosluk.s },
  kontroller: { flexDirection: 'row', alignItems: 'center', gap: Bosluk.xl },
  kontrol: { width: 52, height: 52, borderRadius: 26, backgroundColor: Renk.gece2, borderWidth: 1, borderColor: Renk.cizgi, alignItems: 'center', justifyContent: 'center' },
  kontrolYazi: { color: Renk.kemik, fontSize: 16 },
  bittiIsaret: { fontSize: 72, color: Renk.volt, fontFamily: Yazi.kalin },
});
