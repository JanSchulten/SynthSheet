# Synth Sheet Live

A PWA for creating and performing synthesizer chord sheets live.

## Live App

**https://janschulten.github.io/SynthSheet/**

## Features

- Create and manage chord sheets organized into songs and sections
- Bar-based grid editor with per-beat chord slots, patch labels, and annotations
- **Setlists** — order songs for a gig and play straight through; the last section of a song advances to the next song
- **Performance Mode**: full-screen live view, the whole section fits the screen, swipe navigation, Wake Lock, large chord display
- **Synth MIDI control** (Chromium browsers):
  - Bank Select (CC#0 MSB / CC#32 LSB) + Program Change per slot, per-song MIDI channel
  - Auto patch-switch on section change; tap a bar to fire its patch manually
  - **Hands-free navigation** via MIDI foot pedal / controller (MIDI-Learn for next/prev)
  - **MIDI Clock out** so your synth's arpeggiator / sequencer locks to the sheet tempo
- **Metronome** with visual flash + audio click in Performance Mode
- **Share / Export** songs natively (WhatsApp, Mail, iCloud, AirDrop …) via the Web Share API, with download fallback
- Patch library per song with color coding and autocomplete
- Key transposition across all chords
- Modern translucent "Liquid Glass" UI, dark, fully responsive
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
