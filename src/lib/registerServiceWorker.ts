/**
 * Service Worker registration and lifecycle management utility.
 */

export interface ServiceWorkerStatus {
  isRegistered: boolean;
  isSupported: boolean;
  hasUpdate: boolean;
  registration: ServiceWorkerRegistration | null;
}

let currentRegistration: ServiceWorkerRegistration | null = null;

export function registerServiceWorker(onUpdateFound?: () => void): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[SW Registration] Service Worker is not supported in this environment.');
    return Promise.resolve(null);
  }

  return navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((registration) => {
      console.info('[SW Registration] Service Worker registered successfully with scope:', registration.scope);
      currentRegistration = registration;

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.info('[SW Registration] New content is available; please refresh.');
                if (onUpdateFound) onUpdateFound();
              } else {
                console.info('[SW Registration] Content is cached for offline use.');
              }
            }
          };
        }
      };

      return registration;
    })
    .catch((error) => {
      console.warn('[SW Registration] Service Worker registration failed:', error);
      return null;
    });
}

export function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    return navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        return registration.unregister();
      }
      return false;
    });
  }
  return Promise.resolve(false);
}

export function getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
  return currentRegistration;
}
