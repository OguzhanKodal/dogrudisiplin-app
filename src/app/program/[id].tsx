import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { HareketGorseli, kapakGorseli, Karo, kasGorseli } from '@/components/hareket-gorseli';
import { Baslik, Bolum, Cubuk, Dugme, Ekran, Kart, M, Sayi } from '@/components/ui';
import { Bosluk, Renk, Yazi } from '@/constants/theme';
import { programBul, type Program } from '@/data/programlar';
import { basari } from '@/lib/ses';
import { useVeri, uzunBugun } from '@/store';

export default function ProgramDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = programBul(id);
  if (!p) return <Ekran><M>Program bulunamadı.</M></Ekran>;
  return (
    <>
      <Stack.Screen options={{ title: p.ad }} />
      {p.tur === 'kisa' ? <KisaProgram p={p} /> : p.tur === 'uzun' ? <UzunProgram p={p} /> : <Rehber p={p} />}
    </>
  );
}

function Ust({ p }: { p: Program }) {
  return (
    <View style={{ gap: 4 }}>
      <M tur="etiket" renk={Renk.volt}>
        {p.sure} · {p.seviye}
      </M>
      <Baslik metin={p.ad} boyut={32} />
      <M tur="normal" renk={Renk.soluk}>
        {p.altBaslik}
      </M>
    </View>
  );
}

function KisaProgram({ p }: { p: Program }) {
  const s = p.seans!;
  return (
    <Ekran>
      <Ust p={p} />
      <Dugme metin="Başla" onPress={() => router.push(`/oynatici/${p.id}`)} />
      <M tur="kucuk">
        Sesli anlatım seni hareketten harekete taşır. Telefonu yere koy, ekran açık kalır. Her hareket {s.hareketler[0].sure} sn, aralarda kısa mola.
      </M>
      <Bolum baslik={`${s.hareketler.length} hareket`}>
        {s.hareketler.map((h, i) => (
          <View key={h.id} style={st.hareket}>
            <Karo kaynak={kapakGorseli(h.id)} boyut={58} />
            <Sayi deger={`0${i + 1}`} boyut={22} renk={Renk.soluk} style={{ width: 30 }} />
            <View style={{ flex: 1 }}>
              <M tur="normal" style={{ fontFamily: Yazi.orta }}>
                {h.ad}
              </M>
              <M tur="kucuk">{h.sure} sn</M>
            </View>
          </View>
        ))}
      </Bolum>
    </Ekran>
  );
}

function UzunProgram({ p }: { p: Program }) {
  const il = useVeri((s) => s.uzun[p.id]);
  const basla = useVeri((s) => s.uzunBasla);
  const kaydet = useVeri((s) => s.uzunGunKaydet);
  const sifirla = useVeri((s) => s.uzunSifirla);
  const gunler = p.gunler ?? [];
  const bugunNo = uzunBugun(il, gunler.length);
  const bugun = gunler[bugunNo - 1];
  const [tekrar, setTekrar] = useState<number | null>(null);
  const deger = tekrar ?? bugun?.hedef ?? 0;

  if (p.yakinda || !gunler.length) {
    return (
      <Ekran>
        <Ust p={p} />
        <Kart>
          <M>Bu program hazırlanıyor.</M>
        </Kart>
      </Ekran>
    );
  }

  const bugunYapildi = il ? il.tamam[bugunNo] !== undefined : false;
  const tamamSayisi = il ? Object.keys(il.tamam).length : 0;

  return (
    <Ekran>
      <Ust p={p} />

      {p.id.startsWith('sinav') ? (
        <View style={st.gorseller}>
          <HareketGorseli id="sinav" ad="Şınav" oynuyor boyut={160} tempoMs={1300} />
          <Karo kaynak={kasGorseli('sinav')} boyut={160} />
        </View>
      ) : null}

      {!il ? (
        <Kart vurgulu>
          <M tur="normal">
            30 gün boyunca her gün hedef biraz artar. Her 4. gün dinlenme. Hedefi tek seferde yapmak zorunda değilsin; gün içine böl.
          </M>
          <Dugme
            metin="Programa başla"
            onPress={() => {
              basla(p.id);
              basari();
            }}
          />
        </Kart>
      ) : (
        <Kart vurgulu={!bugunYapildi}>
          <M tur="etiket" renk={Renk.volt}>
            Gün {bugunNo} / {gunler.length}
          </M>
          {bugun.dinlenme ? (
            <>
              <Baslik metin="Dinlenme günü" boyut={26} />
              <M tur="kucuk">Kaslar dinlenirken güçlenir. Yarın devam.</M>
              {!bugunYapildi ? (
                <Dugme metin="Dinlendim" tur="ikincil" onPress={() => kaydet(p.id, bugunNo, 0)} />
              ) : null}
            </>
          ) : bugunYapildi ? (
            <>
              <Baslik metin={`${il.tamam[bugunNo]} şınav ✓`} boyut={26} />
              <M tur="kucuk">Bugünü kazandın. Yarın hedef: {gunler[bugunNo]?.hedef ?? '—'}</M>
            </>
          ) : (
            <>
              <M tur="normal">Bugünkü hedef: {bugun.hedef} şınav. Kaç tane yaptın?</M>
              <View style={st.sayac}>
                <SayacDugme metin="−" onPress={() => setTekrar(Math.max(0, deger - 1))} />
                <Text style={st.sayacYazi}>{deger}</Text>
                <SayacDugme metin="+" onPress={() => setTekrar(deger + 1)} />
              </View>
              <Dugme
                metin="Kaydet"
                onPress={() => {
                  kaydet(p.id, bugunNo, deger);
                  setTekrar(null);
                  basari();
                }}
              />
              <M tur="kucuk">Hedefin altında kalsan da kaydet. Yarın hedef artmaz, bugünden devam edersin.</M>
            </>
          )}
          <Cubuk oran={tamamSayisi / gunler.length} />
        </Kart>
      )}

      <Bolum baslik="30 gün">
        <View style={st.izgara}>
          {gunler.map((g) => {
            const yapilan = il?.tamam[g.gun];
            const bugunMu = il && g.gun === bugunNo;
            return (
              <View
                key={g.gun}
                style={[
                  st.gun,
                  yapilan !== undefined && { backgroundColor: Renk.volt },
                  bugunMu && yapilan === undefined && { borderColor: Renk.volt, borderWidth: 2 },
                ]}>
                <Text style={[st.gunNo, yapilan !== undefined && { color: Renk.gece }]}>{g.gun}</Text>
                <Text style={[st.gunHedef, yapilan !== undefined && { color: Renk.gece }]}>
                  {g.dinlenme ? 'dinlen' : (yapilan ?? g.hedef)}
                </Text>
              </View>
            );
          })}
        </View>
      </Bolum>

      {il ? (
        <Dugme
          metin="Programı sıfırla"
          tur="tehlike"
          onPress={() =>
            Alert.alert('Sıfırlansın mı?', 'İlerlemen silinir ve 1. günden başlarsın.', [
              { text: 'Vazgeç', style: 'cancel' },
              { text: 'Sıfırla', style: 'destructive', onPress: () => sifirla(p.id) },
            ])
          }
        />
      ) : null}
    </Ekran>
  );
}

function SayacDugme({ metin, onPress }: { metin: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={st.sayacDugme} hitSlop={6}>
      <Text style={st.sayacDugmeYazi}>{metin}</Text>
    </Pressable>
  );
}

function Rehber({ p }: { p: Program }) {
  const [acik, setAcik] = useState(0);
  return (
    <Ekran>
      <Ust p={p} />
      {p.bolumler?.map((b, i) => (
        <Pressable key={b.baslik} onPress={() => setAcik(acik === i ? -1 : i)}>
          <Kart vurgulu={acik === i}>
            <View style={st.hareket}>
              <Sayi deger={`0${i + 1}`} boyut={22} renk={acik === i ? Renk.volt : Renk.soluk} style={{ width: 30 }} />
              <M tur="buyuk" style={{ flex: 1 }}>
                {b.baslik}
              </M>
            </View>
            {acik === i ? <M tur="normal">{b.metin}</M> : null}
          </Kart>
        </Pressable>
      ))}
    </Ekran>
  );
}

const st = StyleSheet.create({
  hareket: { flexDirection: 'row', alignItems: 'center', gap: Bosluk.m },
  gorseller: { flexDirection: 'row', gap: Bosluk.m, justifyContent: 'center' },
  sayac: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Bosluk.xl, marginVertical: Bosluk.s },
  sayacYazi: { fontFamily: Yazi.baslik, color: Renk.kemik, fontSize: 56, lineHeight: 72, minWidth: 90, textAlign: 'center' },
  sayacDugme: { width: 52, height: 52, borderRadius: 26, backgroundColor: Renk.gece3, alignItems: 'center', justifyContent: 'center' },
  sayacDugmeYazi: { color: Renk.kemik, fontSize: 28, fontFamily: Yazi.kalin, marginTop: -2 },
  izgara: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  gun: {
    width: '18.2%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: Renk.gece3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gunNo: { fontFamily: Yazi.kalin, color: Renk.soluk, fontSize: 11 },
  gunHedef: { fontFamily: Yazi.baslik, color: Renk.kemik, fontSize: 16, lineHeight: 22 },
});
