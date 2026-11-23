import { useRenk } from '@/lib/tema';
import { NativeTabs } from 'expo-router/native-tabs';



export default function Sekmeler() {
  const Renk = useRenk();
  return (
    <NativeTabs
      backgroundColor={Renk.gece}
      indicatorColor={Renk.gece3}
      tintColor={Renk.vurgu}
      labelStyle={{ selected: { color: Renk.vurgu } }}>
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
