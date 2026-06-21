# ProWash — Premium Power Washing Website

## What This Is
A high-converting, scroll-driven animated website for a power washing business. The hero background is an AI-generated power washing video broken into 193 frames that play as the user scrolls — creating a cinematic, premium experience.

## Client / Context
Placeholder business — all names, numbers, and contact info are placeholders to be replaced by the real client's details before going live.

## Tech Stack
- Vanilla HTML / CSS / JS (no bundler, no framework)
- GSAP + ScrollTrigger for scroll-driven animations
- Lenis for smooth scroll
- Canvas API for frame-by-frame video rendering

## Folder Structure
```
ProWash/
  index.html          ← main site
  css/style.css       ← all styling
  js/app.js           ← all logic (canvas, scroll, animations)
  frames/             ← 193 WebP frames (extracted from source video)
  project.md          ← this file
```

## Video Info
- Source: hf_20260621_182529_8040720b-d469-4826-8e68-2fd343a55a5f.mp4
- Resolution: 1920×1080, 24fps, 8 seconds
- Frames extracted: 193 WebP files at quality 80

## Sections (scroll order)
1. Hero — "Power Washed to Perfection." (standalone 100vh, circle-wipe into canvas)
2. Section 01 — "Watch Dirt Disappear in Seconds" (slide-left)
3. Section 02 — "Every Surface. Every Job." / services list (slide-right)
4. Section 03 — "We Don't Rinse. We Restore." / why us (fade-up)
5. Section 04 — Stats: 500+ Jobs · 4.9★ · 100% Satisfaction · 7 yrs (stagger-up, dark overlay)
6. Section 05 — "Clean in 3 Steps" / process (rotate-in)
7. Section 06 — CTA: phone + quote form (scale-up, persists)

## Placeholders to Replace
- Business name: "ProWash"
- Phone: (555) 200-WASH
- Service area: "Greater Metro Area"
- Stats: 500+ jobs, 4.9★, 100%, 7 years
- Est. year: 2018

## To Run Locally
```
npx serve .
```
Must be served via HTTP — frames will not load from file://

## Deploy
- GitHub: danielarskiy-tech/prowash
- Vercel: static site deploy (drag folder or CLI)
