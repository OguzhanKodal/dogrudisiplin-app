// Yalnız kullanılan kalınlıklar: paketin ana girişi 18 Inter dosyasının hepsini uygulamaya katıyor (~6 MB).
import { Anton_400Regular } from '@expo-google-fonts/anton/400Regular';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { NavigationBar } from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { Acilis } from '@/components/acilis';
import { Kose, Yazi } from '@/constants/theme';
import { useAcikMi, useRenk } from '@/lib/tema';

SplashScreen.preventAutoHideAsync();

// Android'de modal ekranlar iOS'taki gibi aşağıdan gelsin (varsayılan yandan geçiş modal hissi vermiyor).
const ALTTAN = Platform.OS === 'android' ? ('slide_from_bottom' as const) : undefined;

export default function KokDuzen() {
  const Renk = useRenk();
  const acik = useAcikMi();
  const taban = acik ? DefaultTheme : DarkTheme;
  const tema = {
    ...taban,
    colors: { ...taban.colors, background: Renk.gece, card: Renk.gece, primary: Renk.vurgu, text: Renk.kemik, border: Renk.cizgi },
  };
  const [yuklendi] = useFonts({ Anton_400Regular, Inter_400Regular, Inter_600SemiBold, Inter_700Bold });
  const [acilisAcik, setAcilisAcik] = useState(true);

  useEffect(() => {
    if (yuklendi) SplashScreen.hideAsync();
  }, [yuklendi]);

  // Kök görünüm zemini: ekran geçişlerinde ve klavye açılırken arkadan beyaz/siyah görünmesin.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(Renk.gece).catch(() => {});
  }, [Renk.gece]);

  if (!yuklendi) return null;

  return (
    <ThemeProvider value={tema}>
      <StatusBar style={acik ? 'dark' : 'light'} />
      {Platform.OS === 'android' ? <NavigationBar style={acik ? 'dark' : 'light'} /> : null}
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Renk.gece },
          headerTintColor: Renk.kemik,
          headerTitleStyle: { fontFamily: Yazi.kalin },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: Renk.gece },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="program/[id]" options={{ title: '' }} />
        <Stack.Screen
          name="oynatici/[id]"
          options={{ headerShown: false, presentation: 'fullScreenModal', gestureEnabled: false, animation: ALTTAN }}
        />
        <Stack.Screen name="aliskanlik-ekle" options={{ title: 'Alışkanlık ekle', presentation: 'modal', animation: ALTTAN }} />
        <Stack.Screen
          name="kilo"
          options={{
            title: 'Kilo',
            presentation: 'formSheet',
            sheetAllowedDetents: [0.55],
            sheetGrabberVisible: true,
            sheetCornerRadius: Kose.l,
          }}
        />
        <Stack.Screen name="hakkinda" options={{ title: 'Ayarlar' }} />
      </Stack>
      {acilisAcik ? <Acilis kapat={() => setAcilisAcik(false)} /> : null}
    </ThemeProvider>
  );
}
