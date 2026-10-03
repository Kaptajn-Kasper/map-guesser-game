# Environment Setup

The app needs a MapTiler API key. It is supplied at **runtime** through
`/config.js` (`window.__APP_CONFIG__`), not baked into the build, so the same
image runs in dev, preprod and prod.

## Local development

1. Get a free MapTiler API key at https://www.maptiler.com/ (100k map loads/month).
2. Create your local config (gitignored):

   ```bash
   cp public/config.example.js public/config.js
   # edit public/config.js and set mapTilerKey
   ```

3. Run `npm start` (or `docker compose -f docker-compose.dev.yml up`) and open
   http://localhost:4200.

## Deployed environments

The container generates `/config.js` at startup from the `MAPTILER_KEY`
environment variable (`docker/40-runtime-config.sh`). On the server, set it in
`/etc/apps/map-guesser-game/<env>.env`:

```
MAPTILER_KEY=your-key
```

## Security

The key is always visible in the browser. It is not a secret, so protect it in
the MapTiler dashboard by restricting it to these HTTP referrers:

- `https://map-guesser.kaptajnkasper.net`
- `https://map-guesser-preprod.kaptajnkasper.net`
- `https://map-guesser-dev.kaptajnkasper.net`
- `http://localhost:4200`

## How it works

- `src/index.html` loads `config.js` before the app bundle.
- `src/app/app-config.ts` reads `window.__APP_CONFIG__`.
- The style JSON files in `src/assets/styles/` contain `{MAPTILER_KEY}`
  placeholders that `GameService` replaces with the key.
