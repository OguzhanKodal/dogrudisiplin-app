import { NativeTabs } from 'expo-router/native-tabs';

import { useRenk } from '@/lib/tema';

export default function Sekmeler() {
  const Renk = useRenk();
  // Seçili: vurgu (açık temada koyu zeytin, koyuda volt). Seçili olmayan: soluk (iki temada da ≥4.5:1).
  // Android: seçili simgenin arkasındaki hap volt'un soluk tonu; dokununca tema rengiyle dalga.
  return (
    <NativeTabs
      backgroundColor={Renk.gece}
      indicatorColor={Renk.voltSoluk}
      rippleColor={Renk.dalga}
      tintColor={Renk.vurgu}
      labelVisibilityMode="labeled"
      iconColor={{ default: Renk.soluk, selected: Renk.vurgu }}
      labelStyle={{ default: { color: Renk.soluk }, selected: { color: Renk.vurgu } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Bugün</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'sun.max', selected: 'sun.max.fill' }} md="today" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="programlar">
        <NativeTabs.Trigger.Label>Programlar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="figure.strengthtraining.functional" md="fitness_center" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="aliskanlik">
        <NativeTabs.Trigger.Label>Alışkanlık</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'checkmark.square', selected: 'checkmark.square.fill' }} md="check_box" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="istatistik">
        <NativeTabs.Trigger.Label>İstatistik</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.bar.fill" md="bar_chart" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
