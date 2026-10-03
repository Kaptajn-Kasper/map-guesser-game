#!/bin/sh
# Generate /tmp/config.js from environment variables at container start.
# nginx serves it at /config.js (see nginx/production.nginx.conf). The rootfs
# is read-only, so /tmp is the only writable location.
set -eu

# MapTiler keys are alphanumeric; drop anything else so the value can't break
# out of the JS string.
key=$(printf '%s' "${MAPTILER_KEY:-}" | tr -cd 'A-Za-z0-9_-')

[ -n "$key" ] || echo "40-runtime-config: MAPTILER_KEY is not set; maps will not load" >&2

printf 'window.__APP_CONFIG__ = { mapTilerKey: "%s" };\n' "$key" > /tmp/config.js
