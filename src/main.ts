import { bootstrapApplication } from '@angular/platform-browser';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { appConfig } from './app/app.config';
import { App } from './app/app';

const configureStatusBar = async () => {
  if (Capacitor.getPlatform() === 'web' || !Capacitor.isPluginAvailable('StatusBar')) {
    return;
  }

  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Dark });

    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    }
  } catch (error) {
    console.warn('StatusBar configuration failed', error);
  }
};

const registerBackButtonHandler = () => {
  if (Capacitor.getPlatform() !== 'android' || !Capacitor.isPluginAvailable('App')) {
    return;
  }

  CapacitorApp.addListener('backButton', ({ canGoBack }) => {
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
