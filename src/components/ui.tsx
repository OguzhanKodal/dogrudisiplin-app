import type { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type Insets,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Simge, type SimgeAd } from '@/components/simge';
import { Bosluk, DOKUNMA, Kose, Yazi } from '@/constants/theme';
import { ICERIK_EN } from '@/lib/duzen';
import { trBuyuk } from '@/lib/metin';
import { stil, useRenk } from '@/lib/tema';

/**
 * Ekran zemini + kaydırma. `baslikli`: üstte yığın başlığı var (Ayarlar, program detayı); güvenli alan payı başlıkta kalır,
 * içerik bir kez daha aşağı itilmez. Sekme ekranlarında alttaki boşluk sekme çubuğu içindir.
 */
export function Ekran({ children, kaydir = true, baslikli = false }: { children: ReactNode; kaydir?: boolean; baslikli?: boolean }) {
  const s = useS();
  const ins = useSafeAreaInsets();
  const ic = {
    paddingTop: (baslikli ? 0 : ins.top) + Bosluk.m,
    paddingBottom: ins.bottom + (baslikli ? Bosluk.xl : 100),
    paddingHorizontal: Bosluk.l,
  };
  if (!kaydir)
    return (
      <View style={s.ekran}>
        <View style={[ic, s.icerik, { flex: 1 }]}>{children}</View>
      </View>
    );
  return (
    <View style={s.ekran}>
      <ScrollView contentContainerStyle={[ic, s.icerik]} contentInsetAdjustmentBehavior="never">
        {children}
      </ScrollView>
      {/* Kenardan kenara ekranda kaydırılan içerik durum çubuğunun altında yazıyla çakışmasın. */}
      {baslikli ? null : <View pointerEvents="none" style={[s.durumZemin, { height: ins.top }]} />}
    </View>
  );
}

type MetinTur = 'buyuk' | 'normal' | 'kucuk' | 'etiket';
export function M({ tur = 'normal', renk, style, children, ...p }: TextProps & { tur?: MetinTur; renk?: string }) {
  const s = useS();
  // Etiketler Türkçe kurala göre büyütülür (textTransform "KENDI" yazar).
  const icerik =
    tur === 'etiket'
      ? Array.isArray(children)
        ? children.map((c) => (typeof c === 'string' ? trBuyuk(c) : c))
        : typeof children === 'string'
          ? trBuyuk(children)
          : children
      : children;
  return (
    <Text {...p} style={[s[tur], renk ? { color: renk } : null, style]}>
      {icerik}
    </Text>
  );
}

/** Sade kalın başlık (cümle düzeni). `vurgu` kısmı volt renkte. */
export function Baslik({
  metin,
  vurgu,
  boyut = 28,
  style,
}: {
  metin: string;
  vurgu?: string;
  boyut?: number;
  style?: StyleProp<TextStyle>;
}) {
  const Renk = useRenk();
  const s = useS();
  return (
    <Text style={[s.baslik, { fontSize: boyut, lineHeight: Math.round(boyut * 1.22), letterSpacing: boyut >= 26 ? -0.5 : -0.2 }, style]}>
      {metin}
      {vurgu ? <Text style={{ color: Renk.vurgu }}> {vurgu}</Text> : null}
    </Text>
  );
}

/** Forma numarası gibi büyük Anton sayı. Satır yüksekliği geniş: rakamların üstü kesilmesin. */
export function Sayi({
  deger,
  boyut = 40,
  renk,
  style,
}: {
  deger: string | number;
  boyut?: number;
  renk?: string;
  style?: StyleProp<TextStyle>;
}) {
  const Renk = useRenk();
  const s = useS();
  // Volt açık zeminde yazı olarak okunmaz: volt istenirse vurgu rengi kullanılır.
  const r = !renk || renk === Renk.volt ? Renk.vurgu : renk;
  return <Text style={[s.sayi, { fontSize: boyut, lineHeight: Math.round(boyut * 1.25), color: r }, style]}>{deger}</Text>;
}

export function Kart({ children, style, vurgulu }: { children: ReactNode; style?: StyleProp<ViewStyle>; vurgulu?: boolean }) {
  const s = useS();
  return <View style={[s.kart, vurgulu && s.kartVurgu, style]}>{children}</View>;
}

const ANDROID = Platform.OS === 'android';

/**
 * Bütün basılabilir öğelerin ortak tabanı. Basma geri bildirimi tek yerde:
 * Android'de dalga (ripple), iOS'ta hafif solma + küçülme (azaltılmış harekette yalnız solma).
 * Devre dışıyken soluk durur ve ekran okuyucuya "devre dışı" bildirilir.
 */
export function Basilabilir({
  dalga = 'normal',
  sinirsiz,
  pasifSoluk = true,
  olcek = true,
  style,
  children,
  ...p
}: Omit<PressableProps, 'style' | 'children'> & {
  /** Dalga rengi: volt dolgu üstünde 'volt'. */
  dalga?: 'normal' | 'volt';
  /** Dalga görünür kenarın dışına taşar (yuvarlak simge düğmeleri). */
  sinirsiz?: boolean;
  /** Devre dışıyken soluklaşsın mı (kendi "pasif" görünümü olanlarda false). */
  pasifSoluk?: boolean;
  /** iOS'ta basınca hafif küçülme (tam genişlik satırlarda false: yalnız solma). */
  olcek?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const Renk = useRenk();
  const azHareket = useReducedMotion();
  return (
    <Pressable
      accessibilityRole="button"
      {...p}
      accessibilityState={{ disabled: !!p.disabled, ...p.accessibilityState }}
      android_ripple={
        ANDROID ? { color: dalga === 'volt' ? Renk.dalgaVolt : Renk.dalga, borderless: !!sinirsiz, foreground: true } : undefined
      }
      style={({ pressed }) => [
        ANDROID && !sinirsiz && { overflow: 'hidden' },
        style,
        pressed && !ANDROID && (azHareket || !olcek ? { opacity: 0.7 } : { opacity: 0.8, transform: [{ scale: 0.97 }] }),
        p.disabled && pasifSoluk && { opacity: 0.4 },
      ]}>
      {children}
    </Pressable>
  );
}

/** Ana düğme: volt hap. `ikincil` gece3 dolgu, `tehlike` kırmızı kenar. Yükseklik 52. */
export function Dugme({
  metin,
  tur = 'ana',
  style,
  ...p
}: Omit<PressableProps, 'style' | 'children'> & { metin: string; tur?: 'ana' | 'ikincil' | 'tehlike'; style?: StyleProp<ViewStyle> }) {
  const Renk = useRenk();
  const s = useS();
  return (
    <Basilabilir
      accessibilityLabel={metin}
      {...p}
      dalga={tur === 'ana' ? 'volt' : 'normal'}
      style={[s.dugme, tur === 'ikincil' && s.dugmeIkincil, tur === 'tehlike' && s.dugmeTehlike, style]}>
      <Text style={[s.dugmeYazi, tur !== 'ana' && { color: tur === 'tehlike' ? Renk.kirmizi : Renk.kemik }]}>{metin}</Text>
    </Basilabilir>
  );
}

/**
 * Yuvarlak simge düğmesi (oynatıcı kontrolleri, +/−, kapat, ekle). `ana` volt dolgu; `ikincil` gece3 dolgu (Dugme ikincil ile aynı);
 * `sade` aynı dolgu, soluk simge (kapat gibi geri planda kalanlar).
 * Görsel boyut küçük olsa da dokunma alanı en az 48'e tamamlanır. `etiket` ekran okuyucu içindir.
 */
export function YuvarlakDugme({
  simge,
  etiket,
  boyut = 52,
  tur = 'ikincil',
  style,
  ...p
}: Omit<PressableProps, 'style' | 'children'> & {
  simge: SimgeAd;
  etiket: string;
  boyut?: number;
  tur?: 'ana' | 'ikincil' | 'sade';
  style?: StyleProp<ViewStyle>;
}) {
  const Renk = useRenk();
  const s = useS();
  const pay = Math.max(0, Math.ceil((DOKUNMA - boyut) / 2));
  const renk = tur === 'ana' ? Renk.voltUstu : tur === 'sade' ? Renk.soluk : Renk.kemik;
  return (
    <Basilabilir
      accessibilityLabel={etiket}
      hitSlop={pay}
      {...p}
      dalga={tur === 'ana' ? 'volt' : 'normal'}
      style={[
        s.yuvarlak,
        { width: boyut, height: boyut, borderRadius: boyut / 2 },
        tur === 'ana' && { backgroundColor: Renk.volt },
        style,
      ]}>
      <Simge ad={simge} boyut={Math.round(boyut * 0.42)} renk={renk} />
    </Basilabilir>
  );
}

/** Bölüm başlığındaki "+ Ekle" gibi yazı düğmesi: etiket yazısı, vurgu renk; dokunma alanı hitSlop ile büyür. */
export function MetinDugme({ metin, ...p }: Omit<PressableProps, 'style' | 'children'> & { metin: string }) {
  const Renk = useRenk();
  const s = useS();
  const pay: Insets = { top: 16, bottom: 16, left: 12, right: 12 };
  return (
    <Basilabilir accessibilityLabel={metin} hitSlop={pay} sinirsiz {...p}>
      <Text style={[s.etiket, { color: Renk.vurgu }]}>{trBuyuk(metin)}</Text>
    </Basilabilir>
  );
}

/** Dokunulabilir kart (program kartları, rehber bölümleri): Kart görünümü + ortak basma geri bildirimi. */
export function KartDugme({
  children,
  style,
  vurgulu,
  ...p
}: Omit<PressableProps, 'style' | 'children'> & { children: ReactNode; style?: StyleProp<ViewStyle>; vurgulu?: boolean }) {
  const s = useS();
  return (
    <Basilabilir {...p} style={[s.kart, vurgulu && s.kartVurgu, style]}>
      {children}
    </Basilabilir>
  );
}

/** Hap biçiminde seçim grubu (tema, haftalık hedef). Seçili olan volt dolgu. */
export function SecimGrubu<T extends string | number>({
  secenekler,
  secili,
  sec,
  etiket,
}: {
  secenekler: readonly { deger: T; ad: string; okunus?: string }[];
  secili: T;
  sec: (d: T) => void;
  etiket: string;
}) {
  const Renk = useRenk();
  const s = useS();
  return (
    <View style={s.secim} accessibilityRole="radiogroup" accessibilityLabel={etiket}>
      {secenekler.map((o) => {
        const bu = o.deger === secili;
        return (
          <Basilabilir
            key={String(o.deger)}
            onPress={() => sec(o.deger)}
            accessibilityRole="radio"
            accessibilityLabel={o.okunus ?? o.ad}
            accessibilityState={{ checked: bu, selected: bu }}
            dalga={bu ? 'volt' : 'normal'}
            style={[s.secenek, bu && { backgroundColor: Renk.volt }]}>
            <Text style={[s.secenekYazi, bu && { color: Renk.voltUstu }]}>{o.ad}</Text>
          </Basilabilir>
        );
      })}
    </View>
  );
}

export function Bolum({ baslik, sag, children }: { baslik: string; sag?: ReactNode; children: ReactNode }) {
  const s = useS();
  return (
    <View style={{ gap: Bosluk.m }}>
      <View style={s.bolumUst}>
        <M tur="etiket">{baslik}</M>
        {sag}
      </View>
      {children}
    </View>
  );
}

export function Cubuk({ oran, yukseklik = 5 }: { oran: number; yukseklik?: number }) {
  const Renk = useRenk();
  const s = useS();
  return (
    <View style={[s.cubuk, { height: yukseklik }]}>
      <View style={{ width: `${Math.max(0, Math.min(1, oran)) * 100}%`, height: '100%', backgroundColor: Renk.volt, borderRadius: 3 }} />
    </View>
  );
}

/**
 * Markanın imza işareti: kare. Boş, tam (volt) ya da "küçük hâli" (çapraz yarım volt).
 * Yarım: döndürülmüş büyük bir kare kutunun sol üst üçgenini doldurur.
 */
export function IsaretKare({
  durum,
  boyut = 26,
  kose = 8,
  bugun,
  gelecek,
  tikli = false,
}: {
  durum?: 'tam' | 'kucuk' | null;
  boyut?: number;
  kose?: number;
  bugun?: boolean;
  gelecek?: boolean;
  tikli?: boolean;
}) {
  const Renk = useRenk();
  const s = useS();
  const L = boyut * 1.5;
  const merkez = boyut / 2 - L / (2 * Math.SQRT2);
  return (
    <View
      style={[
        s.kare,
        { width: boyut, height: boyut, borderRadius: kose },
        gelecek && { borderStyle: 'dashed', borderColor: Renk.gece3 },
        bugun && !durum && { borderColor: Renk.volt },
        durum && { borderColor: Renk.volt },
        durum === 'tam' && { backgroundColor: Renk.volt },
      ]}>
      {durum === 'kucuk' ? (
        <View
          style={{
            position: 'absolute',
            width: L,
            height: L,
            left: merkez - L / 2,
            top: merkez - L / 2,
            backgroundColor: Renk.volt,
            transform: [{ rotate: '45deg' }],
          }}
        />
      ) : null}
      {durum === 'tam' && tikli ? <Simge ad="tik" boyut={Math.round(boyut * 0.62)} renk={Renk.voltUstu} /> : null}
    </View>
  );
}

const useS = stil((Renk) => ({
  // Açık katlanabilir / tablet: içerik ortada, okunur genişlikte.
  icerik: { gap: Bosluk.l, width: '100%', maxWidth: ICERIK_EN, alignSelf: 'center' },
  ekran: { flex: 1, backgroundColor: Renk.gece },
  durumZemin: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: Renk.gece, opacity: 0.94 },
  baslik: { fontFamily: Yazi.kalin, color: Renk.kemik },
  sayi: { fontFamily: Yazi.baslik, letterSpacing: 0.5, includeFontPadding: false },
  buyuk: { fontFamily: Yazi.orta, color: Renk.kemik, fontSize: 17, lineHeight: 22 },
  normal: { fontFamily: Yazi.normal, color: Renk.kemik, fontSize: 15, lineHeight: 21 },
  kucuk: { fontFamily: Yazi.normal, color: Renk.soluk, fontSize: 13, lineHeight: 18 },
  etiket: { fontFamily: Yazi.kalin, color: Renk.soluk, fontSize: 11, letterSpacing: 1.4 },
  kart: { backgroundColor: Renk.gece2, borderRadius: Kose.l, borderWidth: 1, borderColor: Renk.cizgi, padding: Bosluk.l, gap: Bosluk.s },
  kartVurgu: { borderColor: Renk.volt },
  dugme: {
    backgroundColor: Renk.volt,
    borderRadius: 999,
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: Bosluk.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dugmeIkincil: { backgroundColor: Renk.gece3 },
  dugmeTehlike: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Renk.kirmizi },
  dugmeYazi: { fontFamily: Yazi.kalin, color: Renk.voltUstu, fontSize: 16, lineHeight: 21, includeFontPadding: false },
  yuvarlak: { backgroundColor: Renk.gece3, alignItems: 'center', justifyContent: 'center' },
  secim: { flexDirection: 'row', backgroundColor: Renk.gece2, borderRadius: 999, borderWidth: 1, borderColor: Renk.cizgi, padding: 4 },
  secenek: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  secenekYazi: { fontFamily: Yazi.orta, color: Renk.soluk, fontSize: 15, lineHeight: 20, includeFontPadding: false },
  bolumUst: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cubuk: { backgroundColor: Renk.gece3, borderRadius: 3, overflow: 'hidden' },
  kare: { borderWidth: 1.5, borderColor: Renk.pasif, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
}));
