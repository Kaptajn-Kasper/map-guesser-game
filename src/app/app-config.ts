/**
 * Runtime configuration, loaded from /config.js before the app boots.
 *
 * In containers, config.js is generated at startup from environment variables
 * (see docker/40-runtime-config.sh), so one image serves dev, preprod and prod.
 * Locally, copy public/config.example.js to public/config.js.
 */
export interface AppConfig {
  mapTilerKey: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<AppConfig>;
  }
}

export const appConfig: AppConfig = {
  mapTilerKey: window.__APP_CONFIG__?.mapTilerKey ?? '',
};
