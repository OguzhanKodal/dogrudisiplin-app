import Constants from 'expo-constants';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, Switch, View } from 'react-native';

import { Bolum, Ekran, Kart, M } from '@/components/ui';
import { Bosluk, Yazi } from '@/constants/theme';
import { useVeri, type TemaTercihi } from '@/store';
import { stil, useRenk } from '@/lib/tema';

export default function Hakkinda() {
  const Renk = useRenk();
  const st = useSt();
  const sesAcik = useVeri((s) => s.sesAcik);
  const sesAyarla = useVeri((s) => s.sesAyarla);
  const tema = useVeri((s) => s.tema);
  const temaAyarla = useVeri((s) => s.temaAyarla);

  return (
    <Ekran>
      <Bolum baslik="Görünüm">
        <View style={st.secim}>
          {TEMALAR.map((t) => {
            const secili = tema === t.deger;
            return (
              <Pressable
                key={t.deger}
                onPress={() => temaAyarla(t.deger)}
                accessibilityRole="radio"
                accessibilityState={{ selected: secili }}
                style={[st.secenek, secili && { backgroundColor: Renk.volt }]}>
                <M tur="normal" style={[st.secenekYazi, secili && { color: Renk.voltUstu }]}>
                  {t.ad}
                </M>
              </Pressable>
            );
          })}
        </View>
      </Bolum>

      <Bolum baslik="Antrenman">
        <Kart style={st.satir}>
          <View style={{ flex: 1 }}>
            <M tur="buyuk">Sesli anlatım</M>
            <M tur="kucuk">Hareketleri ve form ipuçlarını sesli okur.</M>
          </View>
          <Switch value={sesAcik} onValueChange={sesAyarla} trackColor={{ true: Renk.volt, false: Renk.gece3 }} />
        </Kart>
      </Bolum>

      <Bolum baslik="Karakter">
        <Kart>
          <Image source={require('@/assets/images/karakter-sayfa.png')} style={st.karakter} contentFit="cover" />
          <M tur="kucuk">Instagram ve YouTube’daki Doğru Disiplin karakteri. Bütün hareket çizimleri onunla yapılır.</M>
        </Kart>
      </Bolum>

      <Bolum baslik="Hakkında">
        <Kart>
          <M tur="buyuk">Doğru Disiplin</M>
          <M tur="kucuk">Sürüm {Constants.expoConfig?.version ?? '1.0.0'} · Verilerin yalnız bu telefonda durur.</M>
          <Pressable onPress={() => WebBrowser.openBrowserAsync('https://www.instagram.com/dogrudisiplin/')}>
            <M tur="normal" renk={Renk.vurgu}>
              @dogrudisiplin
            </M>
          </Pressable>
        </Kart>
        <Pressable onPress={() => WebBrowser.openBrowserAsync('https://nuvedigital.com')} style={st.nuve}>
          <M style={st.nuveYazi}>Powered by Nüve Dijital</M>
        </Pressable>
      </Bolum>
    </Ekran>
  );
}

const TEMALAR: { deger: TemaTercihi; ad: string }[] = [
  { deger: 'sistem', ad: 'Telefona uy' },
  { deger: 'acik', ad: 'Açık' },
  { deger: 'koyu', ad: 'Koyu' },
];

const useSt = stil((Renk) => ({
  secim: { flexDirection: 'row', backgroundColor: Renk.gece2, borderRadius: 999, borderWidth: 1, borderColor: Renk.cizgi, padding: 4 },
  secenek: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 999 },
  secenekYazi: { fontFamily: Yazi.orta, color: Renk.soluk },
  satir: { flexDirection: 'row', alignItems: 'center', gap: Bosluk.m },
  karakter: { width: '100%', aspectRatio: 1.5, borderRadius: 10 },
  nuve: { alignItems: 'center', paddingVertical: Bosluk.m },
  nuveYazi: { fontFamily: Yazi.orta, color: Renk.soluk, fontSize: 12, letterSpacing: 0.4 },
}));
