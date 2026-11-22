import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Renk, Yazi } from '@/constants/theme';

const AnimCircle = Animated.createAnimatedComponent(Circle);

/**
 * Dairesel geri sayım (YouTube #01'deki volt halka).
 * Halka animasyon motorunda (UI thread) kesintisiz döner; JS yalnız saniye sayısını günceller.
 * `anahtar` her adımda değişir: halka o adımın kalan süresinden yeniden başlar.
 */
export function Halka({
  kalan,
  toplam,
  oynuyor,
  anahtar,
  boyut = 240,
  renk = Renk.volt,
  alt,
}: {
  kalan: number;
  toplam: number;
  oynuyor: boolean;
  anahtar: string | number;
  boyut?: number;
  renk?: string;
  alt?: string;
}) {
  const kalinlik = 14;
  const r = (boyut - kalinlik) / 2;
  const cevre = 2 * Math.PI * r;
  const oran = useSharedValue(toplam > 0 ? kalan / toplam : 0);

  useEffect(() => {
    const simdi = toplam > 0 ? Math.max(0, kalan / toplam) : 0;
    cancelAnimation(oran);
    oran.value = simdi;
    if (oynuyor && kalan > 0) {
      oran.value = withTiming(0, { duration: kalan * 1000, easing: Easing.linear });
    }
    // kalan bilerek bağımlılık değil: her saniye yeniden başlatmak takılmaya yol açar.
  }, [anahtar, oynuyor, toplam]); // eslint-disable-line react-hooks/exhaustive-deps

  const animProps = useAnimatedProps(() => ({ strokeDashoffset: cevre * (1 - oran.value) }));

  return (
    <View style={{ width: boyut, height: boyut, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={boyut} height={boyut} style={StyleSheet.absoluteFill}>
        <Circle cx={boyut / 2} cy={boyut / 2} r={r} stroke={Renk.gece3} strokeWidth={kalinlik} fill="none" />
        <AnimCircle
          cx={boyut / 2}
          cy={boyut / 2}
          r={r}
          stroke={renk}
          strokeWidth={kalinlik}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${cevre} ${cevre}`}
          animatedProps={animProps}
          transform={`rotate(-90 ${boyut / 2} ${boyut / 2})`}
        />
      </Svg>
      <Text style={[st.sayi, { fontSize: boyut * 0.34, lineHeight: boyut * 0.46, color: renk }]}>{Math.ceil(kalan)}</Text>
      {alt ? <Text style={st.alt}>{alt}</Text> : null}
    </View>
  );
}

const st = StyleSheet.create({
  sayi: { fontFamily: Yazi.baslik, textAlign: 'center' },
  alt: { fontFamily: Yazi.kalin, color: Renk.soluk, fontSize: 12, letterSpacing: 1.2, marginTop: -6 },
});
