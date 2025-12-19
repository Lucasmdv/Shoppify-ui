/// <reference types="@capawesome/capacitor-android-edge-to-edge-support" />
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shoppify.app',
  appName: 'Shoppify',
  webDir: 'dist/shoppify-ui/browser',
  plugins: {
    EdgeToEdge: {
      backgroundColor: '#ffffff'
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#ffffff'
    }
  }
};

export default config;
