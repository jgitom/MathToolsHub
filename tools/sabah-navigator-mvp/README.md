# Sabah Navigator MVP

A browser-based, installable mapping prototype built with MapLibre GL JS.

## Current features

- Interactive Sabah-centred map
- GPS location
- Manual place search
- Click-to-create map point
- Save places in browser storage
- Select start and destination
- Driving-route drawing
- Distance and estimated journey duration
- Mobile-responsive layout
- Basic PWA installation support

## Run it locally

### Recommended: VS Code Live Server

1. Extract this ZIP.
2. Open the project folder in VS Code.
3. Install the “Live Server” extension if needed.
4. Right-click `index.html`.
5. Select **Open with Live Server**.

### Alternative: Python local server

From the project folder:

```bash
python -m http.server 8080
```

Open:

```text
http://localhost:8080
```

GPS generally requires HTTPS or localhost.

## Important prototype limitations

- The public OpenStreetMap raster tile server is for low-volume use.
- The public Nominatim endpoint is manually triggered, throttled and cached.
  It is not suitable as the production geocoder for a commercial application.
- The public OSRM demonstration endpoint is for development testing.
- Saved locations currently stay only in the current browser.
- This project does not yet include user accounts, Supabase, admin approval,
  live traffic, turn-by-turn voice navigation or offline map packages.

## Recommended Phase 2

- Supabase Auth
- PostGIS `places` and `road_reports` tables
- Row Level Security
- Photo upload
- Place verification workflow
- Backend proxy for search and routing
- Production tile provider or self-hosted map tiles
