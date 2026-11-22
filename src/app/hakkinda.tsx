import Constants from 'expo-constants';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { Bolum, Ekran, Kart, M } from '@/components/ui';
import { Bosluk, Renk, Yazi } from '@/constants/theme';
import { useVeri } from '@/store';

export default function Hakkinda() {
  const sesAcik = useVeri((s) => s.sesAcik);
  const sesAyarla = useVeri((s) => s.sesAyarla);

  return (
    <Ekran>
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
            <M tur="normal" renk={Renk.volt}>
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

const st = StyleSheet.create({
  satir: { flexDirection: 'row', alignItems: 'center', gap: Bosluk.m },
  karakter: { width: '100%', aspectRatio: 1.5, borderRadius: 10 },
  nuve: { alignItems: 'center', paddingVertical: Bosluk.m },
  nuveYazi: { fontFamily: Yazi.orta, color: Renk.soluk, fontSize: 12, letterSpacing: 0.4 },
});
