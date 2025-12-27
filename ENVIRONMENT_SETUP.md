# Environment Setup

This project uses environment files to keep API keys secure and out of version control.

## Initial Setup

1. Copy the example environment file:

   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   cp src/environments/environment.example.ts src/environments/environment.prod.ts
   ```

2. Get a free MapTiler API key:

   - Visit https://www.maptiler.com/
   - Sign up for a free account (100k map loads/month)
   - Copy your API key from the dashboard

3. Update both environment files with your API key:
   ```typescript
   export const environment = {
     production: false, // or true for environment.prod.ts
     mapTilerKey: "YOUR-ACTUAL-API-KEY-HERE",
   };
   ```

## Security Best Practices

- **Never commit** `environment.ts` or `environment.prod.ts` (they're in .gitignore)
- **Do commit** `environment.example.ts` as a template for other developers
- In production, restrict your MapTiler API key to your domain(s) in the MapTiler dashboard
- Set up HTTP referrer restrictions in your MapTiler account settings

## File Structure

```
src/environments/
├── environment.example.ts    # Template (committed to git)
├── environment.ts            # Development config (gitignored)
└── environment.prod.ts       # Production config (gitignored)
```

## How It Works

- Style JSON files contain `{MAPTILER_KEY}` placeholders
- The game service injects the actual key at runtime from environment config
- Angular automatically swaps `environment.ts` with `environment.prod.ts` during production builds
