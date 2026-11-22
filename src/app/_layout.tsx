import { Anton_400Regular } from '@expo-google-fonts/anton';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { Acilis } from '@/components/acilis';
import { Renk } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

const tema = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: Renk.gece, card: Renk.gece, primary: Renk.volt, text: Renk.kemik },
};

export default function KokDuzen() {
  const [yuklendi] = useFonts({ Anton_400Regular, Inter_400Regular, Inter_600SemiBold, Inter_700Bold });
  const [acilisAcik, setAcilisAcik] = useState(true);

  useEffect(() => {
    if (yuklendi) SplashScreen.hideAsync();
  }, [yuklendi]);

  if (!yuklendi) return null;

  return (
    <ThemeProvider value={tema}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Renk.gece },
          headerTintColor: Renk.kemik,
          headerTitleStyle: { fontFamily: 'Inter_700Bold' },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: Renk.gece },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="program/[id]" options={{ title: '' }} />
        <Stack.Screen name="oynatici/[id]" options={{ headerShown: false, presentation: 'fullScreenModal', gestureEnabled: false }} />
        <Stack.Screen name="aliskanlik-ekle" options={{ title: 'Alışkanlık ekle', presentation: 'modal' }} />
        <Stack.Screen name="kilo" options={{ title: 'Kilo', presentation: 'formSheet', sheetAllowedDetents: [0.55] }} />
        <Stack.Screen name="hakkinda" options={{ title: 'Ayarlar' }} />
      </Stack>
      {acilisAcik ? <Acilis kapat={() => setAcilisAcik(false)} /> : null}
    </ThemeProvider>
  );
}
