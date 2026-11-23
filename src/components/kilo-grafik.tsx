import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';


import { kisaTarih } from '@/lib/tarih';
import type { KiloKaydi } from '@/store';
import { useRenk } from '@/lib/tema';

/** Kilo çizgisi: kayıtlar volt çizgi, hedef kesikli çizgi. */
export function KiloGrafik({ kayitlar, hedef }: { kayitlar: KiloKaydi[]; hedef?: number }) {
  const Renk = useRenk();
  const [genislik, setGenislik] = useState(0);
  const yukseklik = 170;
  const pad = { sol: 8, sag: 40, ust: 14, alt: 22 };
  const son = kayitlar.slice(-30);

  const degerler = son.map((k) => k.kg).concat(hedef ? [hedef] : []);
  const min = Math.floor(Math.min(...degerler) - 1);
  const max = Math.ceil(Math.max(...degerler) + 1);
  const w = genislik - pad.sol - pad.sag;
  const h = yukseklik - pad.ust - pad.alt;
  const x = (i: number) => pad.sol + (son.length === 1 ? w / 2 : (i / (son.length - 1)) * w);
  const y = (kg: number) => pad.ust + (1 - (kg - min) / (max - min)) * h;

  const yol = son.map((k, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(k.kg).toFixed(1)}`).join(' ');

  return (
    <View onLayout={(e) => setGenislik(e.nativeEvent.layout.width)} style={{ height: yukseklik }}>
      {genislik > 0 && son.length > 0 ? (
        <Svg width={genislik} height={yukseklik}>
          {[max, (max + min) / 2, min].map((v) => (
            <SvgText key={v} x={genislik - 4} y={y(v) + 4} fill={Renk.soluk} fontSize={10} textAnchor="end">
              {v.toFixed(0)}
            </SvgText>
          ))}
          {hedef ? (
            <>
              <Line x1={pad.sol} x2={pad.sol + w} y1={y(hedef)} y2={y(hedef)} stroke={Renk.kemik} strokeOpacity={0.5} strokeDasharray="4 5" />
              <SvgText x={pad.sol} y={y(hedef) - 5} fill={Renk.soluk} fontSize={10}>
                hedef {hedef}
              </SvgText>
            </>
          ) : null}
          <Path d={yol} stroke={Renk.vurgu} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
          <Circle cx={x(son.length - 1)} cy={y(son[son.length - 1].kg)} r={5} fill={Renk.vurgu} />
          <SvgText x={pad.sol} y={yukseklik - 4} fill={Renk.soluk} fontSize={10}>
            {kisaTarih(son[0].tarih)}
          </SvgText>
          <SvgText x={pad.sol + w} y={yukseklik - 4} fill={Renk.soluk} fontSize={10} textAnchor="end">
            {kisaTarih(son[son.length - 1].tarih)}
          </SvgText>
        </Svg>
      ) : null}
    </View>
  );
}
