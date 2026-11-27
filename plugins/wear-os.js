// Expo config eklentisi: repo kökündeki `wear/` Wear OS modülünü prebuild'de Android projesine bağlar.
// Wear uygulaması telefonla aynı applicationId'yi kullanır; ayrı APK/AAB olarak aynı Play kaydına yüklenir:
//   cd android && ./gradlew :wear:bundleRelease
const { withSettingsGradle, withProjectBuildGradle } = require('expo/config-plugins');

const ISARET = '// wear-os eklentisi';

module.exports = function wearOs(config) {
  config = withSettingsGradle(config, (c) => {
    if (!c.modResults.contents.includes(ISARET)) {
      c.modResults.contents += `\n${ISARET}\ninclude ':wear'\nproject(':wear').projectDir = new File(rootDir, '../wear')\n`;
    }
    return c;
  });
  config = withProjectBuildGradle(config, (c) => {
    const s = c.modResults.contents;
    if (!s.includes(ISARET)) {
      // Compose derleyici eklentisi Kotlin sürümüyle birebir aynı olmalı (React Native'in Kotlin'i).
      c.modResults.contents = s.replace(
        /classpath\(kotlinVersion \? [^\n]+\n/,
        (m) =>
          `${m}    ${ISARET}: Wear OS arayüzü (Compose)\n    classpath("org.jetbrains.kotlin:compose-compiler-gradle-plugin:\${kotlinVersion ?: '2.2.0'}")\n`,
      );
    }
    return c;
  });
  return config;
};
