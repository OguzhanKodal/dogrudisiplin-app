import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bosluk, Kose, Renk, Yazi } from '@/constants/theme';
import { trBuyuk } from '@/lib/metin';

export function Ekran({ children, kaydir = true }: { children: ReactNode; kaydir?: boolean }) {
  const ins = useSafeAreaInsets();
  const ic = { paddingTop: ins.top + Bosluk.m, paddingBottom: ins.bottom + 96, paddingHorizontal: Bosluk.l };
  if (!kaydir) return <View style={[s.ekran, ic]}>{children}</View>;
  return (
    <ScrollView style={s.ekran} contentContainerStyle={[ic, { gap: Bosluk.l }]} contentInsetAdjustmentBehavior="never">
      {children}
    </ScrollView>
  );
}

type MetinTur = 'baslik' | 'buyuk' | 'normal' | 'kucuk' | 'etiket';
export function M({ tur = 'normal', renk, style, children, ...p }: TextProps & { tur?: MetinTur; renk?: string }) {
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

/** Anton başlık; `vurgu` kısmı volt renkte. Satır yüksekliği geniş: İ, Ğ, Ş, Ü işaretleri kesilmesin. */
export function Baslik({ metin, vurgu, boyut = 30 }: { metin: string; vurgu?: string; boyut?: number }) {
  return (
    <Text style={[s.baslik, { fontSize: boyut, lineHeight: Math.round(boyut * 1.32), paddingTop: Math.round(boyut * 0.06) }]}>
      {trBuyuk(metin)}
      {vurgu ? <Text style={{ color: Renk.volt }}> {trBuyuk(vurgu)}</Text> : null}
    </Text>
  );
}

export function Kart({ children, style, vurgulu }: { children: ReactNode; style?: StyleProp<ViewStyle>; vurgulu?: boolean }) {
  return <View style={[s.kart, vurgulu && s.kartVurgu, style]}>{children}</View>;
}

export function Dugme({
  metin,
  tur = 'ana',
  style,
  ...p
}: PressableProps & { metin: string; tur?: 'ana' | 'ikincil' | 'tehlike'; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      accessibilityRole="button"
      {...p}
      style={({ pressed }) => [
        s.dugme,
        tur === 'ikincil' && s.dugmeIkincil,
        tur === 'tehlike' && s.dugmeTehlike,
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        p.disabled && { opacity: 0.4 },
        style,
      ]}>
      <Text style={[s.dugmeYazi, tur !== 'ana' && { color: tur === 'tehlike' ? Renk.kirmizi : Renk.kemik }]}>{trBuyuk(metin)}</Text>
    </Pressable>
  );
}

export function Bolum({ baslik, sag, children }: { baslik: string; sag?: ReactNode; children: ReactNode }) {
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

export function Cubuk({ oran, yukseklik = 6 }: { oran: number; yukseklik?: number }) {
  return (
    <View style={[s.cubuk, { height: yukseklik }]}>
      <View style={{ width: `${Math.max(0, Math.min(1, oran)) * 100}%`, height: '100%', backgroundColor: Renk.volt }} />
    </View>
  );
}

const s = StyleSheet.create({
  ekran: { flex: 1, backgroundColor: Renk.gece },
  baslik: { fontFamily: Yazi.baslik, color: Renk.kemik, letterSpacing: 0.5, fontSize: 30 },
  buyuk: { fontFamily: Yazi.kalin, color: Renk.kemik, fontSize: 18 },
  normal: { fontFamily: Yazi.normal, color: Renk.kemik, fontSize: 15, lineHeight: 21 },
  kucuk: { fontFamily: Yazi.normal, color: Renk.soluk, fontSize: 13, lineHeight: 18 },
  etiket: { fontFamily: Yazi.kalin, color: Renk.soluk, fontSize: 12, letterSpacing: 1.2 },
  kart: { backgroundColor: Renk.gece2, borderRadius: Kose.m, padding: Bosluk.l, gap: Bosluk.s },
  kartVurgu: { borderWidth: 1.5, borderColor: Renk.volt },
  dugme: {
    backgroundColor: Renk.volt,
    borderRadius: Kose.m,
    paddingVertical: 15,
    paddingHorizontal: Bosluk.l,
    alignItems: 'center',
  },
  dugmeIkincil: { backgroundColor: Renk.gece3 },
  dugmeTehlike: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Renk.kirmizi },
  dugmeYazi: { fontFamily: Yazi.kalin, color: Renk.gece, fontSize: 15, letterSpacing: 0.6 },
  bolumUst: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cubuk: { backgroundColor: Renk.gece3, borderRadius: 4, overflow: 'hidden' },
});
