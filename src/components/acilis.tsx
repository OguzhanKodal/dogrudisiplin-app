import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bosluk, Yazi } from '@/constants/theme';
import { gununSozu } from '@/data/sozler';
import { trBuyuk } from '@/lib/metin';
import { uzunTarih } from '@/lib/tarih';
import { stil } from '@/lib/tema';

/** Uygulama her açıldığında: günün disiplin sözü. Dokununca kapanır. */
export function Acilis({ kapat }: { kapat: () => void }) {
  const st = useSt();
  const ins = useSafeAreaInsets();
  const soz = gununSozu();
  return (
    <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(300)} style={[StyleSheet.absoluteFill, st.zemin]}>
      <Pressable style={[st.ic, { paddingTop: ins.top + 40, paddingBottom: ins.bottom + 32 }]} onPress={kapat} accessibilityRole="button" accessibilityLabel="Devam et">
        <Text style={st.tarih}>{trBuyuk(uzunTarih())}</Text>
        <View style={{ gap: Bosluk.l }}>
          <View style={st.cizgi} />
          <Text style={st.soz}>{soz.metin}</Text>
          {soz.kim ? <Text style={st.kim}>— {soz.kim}</Text> : null}
        </View>
        <View style={st.alt}>
          <Image source={require('@/assets/images/icon.png')} style={st.ikon} />
          <Text style={st.devam}>Devam etmek için dokun</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const useSt = stil((Renk) => ({
  zemin: { backgroundColor: Renk.gece, zIndex: 10 },
  ic: { flex: 1, paddingHorizontal: Bosluk.xl, justifyContent: 'space-between' },
  tarih: { fontFamily: Yazi.kalin, color: Renk.soluk, fontSize: 12, letterSpacing: 1.6 },
  cizgi: { width: 56, height: 6, backgroundColor: Renk.volt, borderRadius: 3 },
  soz: { fontFamily: Yazi.baslik, color: Renk.kemik, fontSize: 42, lineHeight: 56, paddingTop: 4 },
  kim: { fontFamily: Yazi.orta, color: Renk.vurgu, fontSize: 15 },
  alt: { flexDirection: 'row', alignItems: 'center', gap: Bosluk.m },
  ikon: { width: 40, height: 40, borderRadius: 10 },
  devam: { fontFamily: Yazi.normal, color: Renk.soluk, fontSize: 13 },
}));
