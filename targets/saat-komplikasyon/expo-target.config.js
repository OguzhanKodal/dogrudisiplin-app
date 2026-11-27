/** Apple Watch komplikasyonu (saat kadranı): disiplin günü ve bugünkü alışkanlıklar. */
/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'watch-widget',
  name: 'DogruDisiplinKomplikasyon',
  displayName: 'Doğru Disiplin',
  bundleIdentifier: '.watchkitapp.komplikasyon',
  deploymentTarget: '10.0',
  colors: { $accent: '#C8F031', $widgetBackground: '#14181F' },
  frameworks: ['SwiftUI', 'WidgetKit'],
  entitlements: {
    'com.apple.security.application-groups': [`group.${config.ios.bundleIdentifier}`],
  },
});
