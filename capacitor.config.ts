import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.clarity.zentodo',
  appName: 'Clarity',
  webDir: 'build',
  server: {
    androidScheme: 'https',
  },
  plugins: {},
};

export default config;
