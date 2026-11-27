/** Apple Watch uygulaması: Bugün (disiplin günü + alışkanlıklar) ve bilekte antrenman. */
/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'watch',
  name: 'DogruDisiplinSaat',
  displayName: 'Doğru Disiplin',
  bundleIdentifier: '.watchkitapp',
  deploymentTarget: '10.0',
  icon: '../../assets/images/icon.png',
  colors: { $accent: '#C8F031', gece: '#14181F', gece2: '#1E242D', volt: '#C8F031', soluk: '#9097A2' },
  frameworks: ['SwiftUI', 'WatchConnectivity', 'HealthKit', 'WidgetKit'],
  entitlements: {
    'com.apple.developer.healthkit': true,
    'com.apple.security.application-groups': [`group.${config.ios.bundleIdentifier}`],
  },
});
