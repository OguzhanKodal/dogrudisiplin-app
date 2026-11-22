// "Birlikte yap" oynatıcısı: YouTube #01'deki gibi sesli anons, dairesel geri sayım, "3 / 8", sıradaki hareket.
import { Image } from 'expo-image';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Halka } from '@/components/halka';
import { HareketGorseli, kasGorseli } from '@/components/hareket-gorseli';
import { Baslik, Dugme, M } from '@/components/ui';
import { Bosluk, Kose, Renk, Yazi } from '@/constants/theme';
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
          <Baslik metin="BİTTİ" boyut={64} />
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
  const etiket = adim.tur === 'giris' ? 'HAZIR OL' : adim.tur === 'hazirlan' ? 'SIRADAKİ' : 'ÇALIŞ';

  return (
    <View style={[st.ekran, { paddingTop: ins.top + Bosluk.s, paddingBottom: ins.bottom + Bosluk.m }]}>
      {/* Üst: kapat, sayaç, ilerleme */}
      <View style={st.ust}>
        <Pressable onPress={kapat} hitSlop={12} accessibilityLabel="Antrenmanı kapat">
          <Text style={st.kapat}>✕</Text>
        </Pressable>
        <Text style={st.sayac}>
          <Text style={{ color: Renk.volt }}>{hareketNo + 1}</Text> / {seans.hareketler.length}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={st.parcalar}>
        {seans.hareketler.map((_, i) => (
          <View
            key={i}
            style={[
              st.parca,
              (i < hareketNo || (i === hareketNo && calisiyor && kalan === 0)) && { backgroundColor: Renk.volt },
              i === hareketNo && calisiyor && { backgroundColor: Renk.volt, opacity: 0.5 },
            ]}
          />
        ))}
      </View>

      {/* Orta: hareket */}
      <View style={st.orta}>
        <M tur="etiket" renk={calisiyor ? Renk.volt : Renk.soluk}>
          {etiket}
        </M>
        <Baslik metin={hareket.ad} boyut={34} />
        {!calisiyor && kasGorseli(hareket.id) ? (
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Image source={kasGorseli(hareket.id)} style={st.gorsel} contentFit="cover" />
            <M tur="kucuk">Çalışan kaslar</M>
          </View>
        ) : (
          <HareketGorseli id={hareket.id} ad={hareket.ad} oynuyor={calisiyor && !duraklatildi} boyut={230} />
        )}
      </View>

      {/* Alt: geri sayım + kontroller */}
      <View style={st.alt}>
        <Halka kalan={kalan} toplam={adim.sure} oynuyor={!duraklatildi} anahtar={devir} boyut={150} renk={calisiyor ? Renk.volt : Renk.kemik} alt={duraklatildi ? 'DURDU' : undefined} />
        <View style={st.kontroller}>
          <Kontrol simge="⏮" etiket="Geri" onPress={() => git(adimNo - (adim.tur === 'calis' ? 1 : 2))} />
          <Pressable
            onPress={() => {
              tik();
              if (!duraklatildi) sus();
              setDuraklatildi((d) => !d);
            }}
            style={st.oynat}
            accessibilityLabel={duraklatildi ? 'Devam et' : 'Duraklat'}>
            <Text style={st.oynatYazi}>{duraklatildi ? '▶' : '❚❚'}</Text>
          </Pressable>
          <Kontrol simge="⏭" etiket="Atla" onPress={() => git(adimNo + 1)} />
        </View>
        {siradaki ? (
          <View style={st.siradaki}>
            <M tur="kucuk">Sıradaki</M>
            <M tur="normal" style={{ fontFamily: Yazi.orta }}>
              {siradaki.ad}
            </M>
          </View>
        ) : calisiyor ? (
          <M tur="kucuk" renk={Renk.volt}>
            Son hareket, bırakma!
          </M>
        ) : null}
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
  ust: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 40 },
  kapat: { color: Renk.soluk, fontSize: 22 },
  sayac: { fontFamily: Yazi.baslik, color: Renk.kemik, fontSize: 24 },
  parcalar: { flexDirection: 'row', gap: 4, marginTop: Bosluk.s },
  parca: { flex: 1, height: 5, borderRadius: 3, backgroundColor: Renk.gece3 },
  orta: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Bosluk.m },
  gorsel: { width: 230, height: 230, borderRadius: Kose.m },
  alt: { alignItems: 'center', gap: Bosluk.m },
  kontroller: { flexDirection: 'row', alignItems: 'center', gap: Bosluk.xl },
  kontrol: { width: 52, height: 52, borderRadius: 26, backgroundColor: Renk.gece2, alignItems: 'center', justifyContent: 'center' },
  kontrolYazi: { color: Renk.kemik, fontSize: 18 },
  oynat: { width: 68, height: 68, borderRadius: 34, backgroundColor: Renk.volt, alignItems: 'center', justifyContent: 'center' },
  oynatYazi: { color: Renk.gece, fontSize: 22, fontFamily: Yazi.kalin },
  siradaki: { alignItems: 'center' },
  bittiIsaret: { fontSize: 72, color: Renk.volt, fontFamily: Yazi.kalin },
});
