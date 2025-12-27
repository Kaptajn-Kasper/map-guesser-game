# Map Style Configuration

The map styles in `src/assets/styles/` currently use placeholder MapTiler API keys. To make the maps fully functional, you have two options:

## Option 1: Use MapTiler (Recommended)

1. Sign up for a free account at [https://www.maptiler.com/](https://www.maptiler.com/)
2. Get your API key from the dashboard
3. Replace `YOUR_API` in all style files with your actual key:
   - `src/assets/styles/easy.json`
   - `src/assets/styles/medium.json`
   - `src/assets/styles/hard.json`
   - `src/assets/styles/extreme.json`

## Option 2: Use OpenMapTiles Self-Hosted

If you prefer to self-host your tiles, you can:

1. Set up your own OpenMapTiles server
2. Update the `sources.openmaptiles.url` in each style file to point to your server

## Note

The game will still work with the placeholder key for testing, but you may experience rate limiting or watermarks. For production use, always use your own API key.
