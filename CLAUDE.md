# Map Guesser Game

Angular-based map guessing game. Built and deployed by the shared pipeline in the
[infrastructure](https://github.com/Kaptajn-Kasper/infrastructure) repo.

## Repository structure

- `src/` — Angular application source
- `src/app/app-config.ts` — runtime config, read from `window.__APP_CONFIG__` (loaded via `/config.js`)
- `public/config.example.js` — template for local `public/config.js` (gitignored)
- `Dockerfile` — multi-stage build: Node build, then `nginx-unprivileged` serving on port 8080
- `docker/40-runtime-config.sh` — writes `/tmp/config.js` from `MAPTILER_KEY` at container start
- `nginx/production.nginx.conf` — nginx config for the production image
- `Dockerfile.dev`, `docker-compose.dev.yml` — local development with live reload
- `.github/workflows/pipeline.yml` — calls the infrastructure repo's reusable pipeline

## Brand

Colours, the Figtree font, logos and favicons come from `@kaptajn-kasper/brand`
([brand-identity](https://github.com/Kaptajn-Kasper/brand-identity)), installed from
its GitHub Release tarball. Use its `--kk-*` CSS variables or the `color`/`font`
exports from `@kaptajn-kasper/brand`; never copy brand hex codes or logo files into
this repo. Logos are served from `/brand/*.svg` and favicons from the site root
(see the assets in `angular.json`). Gradient and screen background colours in
`app.scss`/`app.ts` are app-specific and stay local.

## Deployment

Do not deploy manually. The pipeline does it:

- Push to `main` builds `ghcr.io/kaptajn-kasper/map-guesser-game`, deploys dev, then
  preprod, then waits for approval on the `prod` environment.
- Run the `pipeline` workflow manually from another branch to deploy that branch to dev.

The compose file, hostnames and server-side config live in the infrastructure repo
(`apps/map-guesser-game/`).

## URLs

| Environment | URL |
|-------------|-----|
| Prod | `https://map-guesser.kaptajnkasper.net` |
| Preprod | `https://map-guesser-preprod.kaptajnkasper.net` (basic auth) |
| Dev | `https://map-guesser-dev.kaptajnkasper.net` (basic auth) |

## Runtime config

Set per environment on the server in `/etc/apps/map-guesser-game/<env>.env`:

- `MAPTILER_KEY` — MapTiler API key (public in the browser; restrict it by referrer in MapTiler)

## Container constraints

The image runs with a read-only rootfs, no capabilities and a non-root user. It
must listen on 8080 and may only write to `/tmp`.
