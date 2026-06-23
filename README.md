# Synth Sheet Live

A PWA for creating and performing synthesizer chord sheets live.

## Live App

**https://janschulten.github.io/synth-sheet-live/**

## Features

- Create and manage chord sheets organized into songs and sections
- Bar-based grid editor with per-beat chord slots, patch labels, and annotations
- **Performance Mode**: full-screen live view with swipe navigation, Wake Lock, and large chord display
- Patch library per song with color coding
- Key transposition across all chords
- MIDI Program Change on section change (Chromium browsers)
- Fully offline after first visit (Service Worker + cache-first)
- All data stored locally — no account, no backend

## Local Development

```bash
npm install
npm run dev
```

## Deploy

Automatic via GitHub Actions on push to `main` → publishes to `gh-pages` branch.

```bash
npm run build   # builds to /dist
```

## PWA Install (iPhone)

1. Open the live URL in **Safari**
2. Tap the **Share** button
3. Tap **Add to Home Screen**
4. The app runs standalone, fully offline after first load

## MIDI Support

MIDI Program Change requires a **Chromium-based browser** (Chrome or Edge on desktop).  
Not available on iOS Safari — the app works fully without MIDI on all platforms.

Configure your MIDI output device in the Settings panel (⚙ icon).

## Tech Stack

- React 18 + Vite + TypeScript
- Tailwind CSS
- Zustand (state) + LocalStorage (persistence)
- vite-plugin-pwa (Service Worker + Web App Manifest)
- Web MIDI API (optional, feature-flagged)
