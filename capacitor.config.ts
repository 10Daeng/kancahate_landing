import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kancahate.app',
  appName: 'Kancah Ate',
  webDir: 'public',
  server: {
    url: 'https://kancahate.my.id',
    cleartext: true
  }
};

export default config;
