import Constants from 'expo-constants';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { Platform, Switch, View } from 'react-native';

import { Basilabilir, Bolum, Ekran, Kart, M, SecimGrubu } from '@/components/ui';
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
    <Ekran baslikli>
      <Bolum baslik="Görünüm">
        <SecimGrubu etiket="Tema" secenekler={TEMALAR} secili={tema} sec={temaAyarla} />
      </Bolum>

      <Bolum baslik="Antrenman">
        <Kart style={st.satir}>
          <View style={{ flex: 1 }}>
            <M tur="buyuk">Sesli anlatım</M>
            <M tur="kucuk">Hareketleri ve form ipuçlarını sesli okur.</M>
          </View>
          <Switch
            value={sesAcik}
            onValueChange={sesAyarla}
            accessibilityLabel="Sesli anlatım"
            trackColor={{ true: Renk.volt, false: Renk.pasif }}
            ios_backgroundColor={Renk.pasif}
            thumbColor={Platform.OS === 'android' ? (sesAcik ? Renk.voltUstu : Renk.soluk) : undefined}
          />
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
          <Basilabilir
            accessibilityRole="link"
            hitSlop={{ top: 12, bottom: 12 }}
            style={{ alignSelf: 'flex-start' }}
            onPress={() => WebBrowser.openBrowserAsync('https://www.instagram.com/dogrudisiplin/')}>
            <M tur="normal" renk={Renk.vurgu}>
              @dogrudisiplin
            </M>
          </Basilabilir>
        </Kart>
        <Basilabilir accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync('https://nuvedigital.com')} style={st.nuve}>
          <M style={st.nuveYazi}>Powered by Nüve Dijital</M>
        </Basilabilir>
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
  satir: { flexDirection: 'row', alignItems: 'center', gap: Bosluk.m },
  karakter: { width: '100%', aspectRatio: 1.5, borderRadius: 10 },
  nuve: { alignItems: 'center', justifyContent: 'center', minHeight: 48, borderRadius: 999 },
  nuveYazi: { fontFamily: Yazi.orta, color: Renk.soluk, fontSize: 12, letterSpacing: 0.4 },
}));
