import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(localeEsAr, 'es-AR');

const configureStatusBar = async () => {
  if (Capacitor.getPlatform() === 'web' || !Capacitor.isPluginAvailable('StatusBar')) {
    return;
  }

  try {
    const isAndroid = Capacitor.getPlatform() === 'android';
    await StatusBar.setOverlaysWebView({ overlay: isAndroid });
    document.documentElement.style.setProperty(
      '--safe-area-top',
      isAndroid ? '0px' : 'env(safe-area-inset-top)'
    );
    if (isAndroid) {
      if (Capacitor.isPluginAvailable('EdgeToEdge')) {
        await EdgeToEdge.enable();
        await EdgeToEdge.setBackgroundColor({ color: '#ffffff' });
      }
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.show();
    } else {
      await StatusBar.setStyle({ style: Style.Light });
    }
  } catch (error) {
    console.warn('StatusBar configuration failed', error);
  }
};

const registerBackButtonHandler = () => {
  if (Capacitor.getPlatform() !== 'android' || !Capacitor.isPluginAvailable('App')) {
    return;
  }

  CapacitorApp.addListener('backButton', ({ canGoBack }: { canGoBack: boolean }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      CapacitorApp.exitApp();
    }
  });
};

void configureStatusBar();
registerBackButtonHandler();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

