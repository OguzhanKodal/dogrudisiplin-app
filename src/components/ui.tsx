import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bosluk, Kose, Yazi } from '@/constants/theme';
import { trBuyuk } from '@/lib/metin';
import { stil, useRenk } from '@/lib/tema';

export function Ekran({ children, kaydir = true }: { children: ReactNode; kaydir?: boolean }) {
  const s = useS();
  const ins = useSafeAreaInsets();
  const ic = { paddingTop: ins.top + Bosluk.m, paddingBottom: ins.bottom + 100, paddingHorizontal: Bosluk.l };
  if (!kaydir) return <View style={[s.ekran, ic]}>{children}</View>;
  return (
    <ScrollView style={s.ekran} contentContainerStyle={[ic, { gap: Bosluk.l }]} contentInsetAdjustmentBehavior="never">
      {children}
    </ScrollView>
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

export function Dugme({
  metin,
  tur = 'ana',
  style,
  ...p
}: PressableProps & { metin: string; tur?: 'ana' | 'ikincil' | 'tehlike'; style?: StyleProp<ViewStyle> }) {
  const Renk = useRenk();
  const s = useS();
  return (
    <Pressable
      accessibilityRole="button"
      {...p}
      style={({ pressed }) => [
        s.dugme,
        tur === 'ikincil' && s.dugmeIkincil,
        tur === 'tehlike' && s.dugmeTehlike,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        p.disabled && { opacity: 0.4 },
        style,
      ]}>
      <Text style={[s.dugmeYazi, tur !== 'ana' && { color: tur === 'tehlike' ? Renk.kirmizi : Renk.kemik }]}>{metin}</Text>
    </Pressable>
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
      {durum === 'tam' && tikli ? <Text style={[s.tik, { fontSize: boyut * 0.6, lineHeight: boyut * 0.8 }]}>✓</Text> : null}
    </View>
  );
}

const useS = stil((Renk) => ({
  ekran: { flex: 1, backgroundColor: Renk.gece },
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
    paddingVertical: 15,
    paddingHorizontal: Bosluk.l,
    alignItems: 'center',
  },
  dugmeIkincil: { backgroundColor: Renk.gece3 },
  dugmeTehlike: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Renk.kirmizi },
  dugmeYazi: { fontFamily: Yazi.kalin, color: Renk.voltUstu, fontSize: 16 },
  bolumUst: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cubuk: { backgroundColor: Renk.gece3, borderRadius: 3, overflow: 'hidden' },
  kare: { borderWidth: 1.5, borderColor: Renk.pasif, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  tik: { color: Renk.voltUstu, fontFamily: Yazi.kalin },
}));
