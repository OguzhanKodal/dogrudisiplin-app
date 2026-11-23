import { router } from 'expo-router';
import { View } from 'react-native';

import { KiloGrafik } from '@/components/kilo-grafik';
import { Baslik, Bolum, Dugme, Ekran, Kart, M, Sayi } from '@/components/ui';
import { Bosluk, Kose } from '@/constants/theme';
import { sonGunler } from '@/lib/tarih';
import { useVeri } from '@/store';
import { stil, useRenk } from '@/lib/tema';

export default function Istatistik() {
  const Renk = useRenk();
  const st = useSt();
  const antrenmanlar = useVeri((s) => s.antrenmanlar);
  const aliskanliklar = useVeri((s) => s.aliskanliklar);
  const isaretler = useVeri((s) => s.isaretler);
  const kilolar = useVeri((s) => s.kilolar);
  const hedefKg = useVeri((s) => s.hedefKg);

  const gunler = new Set(antrenmanlar.map((a) => a.tarih));
  const toplamSinav = antrenmanlar.reduce((t, a) => t + a.sinav, 0);
  const toplamDakika = Math.round(antrenmanlar.reduce((t, a) => t + a.sureSn, 0) / 60);

  // Son 30 gün alışkanlık oranı: yapılan işaret / (alışkanlık × gün)
  const son30 = sonGunler(30);
  const olasi = aliskanliklar.reduce((t, a) => t + son30.filter((g) => g >= a.olusturma).length, 0);
  const yapilan = aliskanliklar.reduce((t, a) => t + son30.filter((g) => isaretler[g]?.[a.id]).length, 0);
  const oran = olasi ? Math.round((yapilan / olasi) * 100) : 0;

  const sonKilo = kilolar.at(-1);
  const haftaOnce = kilolar.filter((k) => k.tarih <= sonGunler(8)[0]).at(-1);
  const haftalikFark = sonKilo && haftaOnce ? sonKilo.kg - haftaOnce.kg : undefined;

  return (
    <Ekran>
      <Baslik metin="İstatistik" boyut={34} />

      <View style={st.izgara}>
        <Kutu deger={gunler.size} etiket="antrenman günü" vurgu />
        <Kutu deger={toplamSinav} etiket="toplam şınav" />
        <Kutu deger={`%${oran}`} etiket="alışkanlık · 30 gün" />
        <Kutu deger={toplamDakika} etiket="dakika" />
      </View>

      <Bolum baslik="Son 30 gün">
        <Kart>
          <View style={st.takvim}>
            {son30.map((g) => (
              <View key={g} style={[st.gun, gunler.has(g) && { backgroundColor: Renk.volt }]} />
            ))}
          </View>
          <M tur="kucuk">Volt kareler antrenman yaptığın günler.</M>
        </Kart>
      </Bolum>

      <Bolum baslik="Kilo">
        <Kart>
          {sonKilo ? (
            <>
              <View style={st.kiloUst}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                  <Sayi deger={sonKilo.kg.toFixed(1)} boyut={40} renk={Renk.kemik} />
                  <M tur="kucuk">kg</M>
                </View>
                {haftalikFark !== undefined ? (
                  <M tur="kucuk" renk={Renk.vurgu}>
                    {haftalikFark > 0 ? '+' : ''}
                    {haftalikFark.toFixed(1)} kg / hafta
                  </M>
                ) : null}
              </View>
              <KiloGrafik kayitlar={kilolar} hedef={hedefKg} />
            </>
          ) : (
            <M tur="normal">Kilonu haftada bir, aynı saatte tart. Günlük oynamalar normaldir; çizginin yönüne bak.</M>
          )}
          <Dugme metin="Kilo gir" tur="ikincil" onPress={() => router.push('/kilo')} />
        </Kart>
      </Bolum>
    </Ekran>
  );
}

function Kutu({ deger, etiket, vurgu }: { deger: number | string; etiket: string; vurgu?: boolean }) {
  const Renk = useRenk();
  const st = useSt();
  return (
    <View style={st.kutu}>
      <Sayi deger={deger} boyut={38} renk={vurgu ? Renk.volt : Renk.kemik} />
      <M tur="kucuk">{etiket}</M>
    </View>
  );
}

const useSt = stil((Renk) => ({
  izgara: { flexDirection: 'row', flexWrap: 'wrap', gap: Bosluk.m },
  kutu: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: Renk.gece2,
    borderRadius: Kose.l,
    borderWidth: 1,
    borderColor: Renk.cizgi,
    padding: Bosluk.l,
    paddingTop: Bosluk.m,
  },
  takvim: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  gun: { width: 26, height: 26, borderRadius: 7, backgroundColor: Renk.gece3 },
  kiloUst: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
}));
