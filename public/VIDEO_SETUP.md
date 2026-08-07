# 🎬 Homepage Video Background Setup

## How to activate the cinematic video background

1. **Get your video** (from Pexels, Pixabay, Shutterstock, etc.)
   - Search: "luxury bakery", "cake making slow motion", "artisan patisserie"
   - Recommended format: **MP4 (H.264)** — best browser support
   - Also works: **WebM (VP9)** — smaller file size

2. **Rename your video file** to:
   - `bakery-hero.mp4`   ← primary (required)
   - `bakery-hero.webm`  ← optional (better performance on Chrome/Firefox)

3. **Drop the file here** (in this `public/` folder)
   - Final path: `MG_Bakery-main/public/bakery-hero.mp4`

4. **Save and reload** your browser — the video plays automatically!

---

## What happens automatically

| Situation | Result |
|-----------|--------|
| `bakery-hero.mp4` exists | Video plays as full-bleed cinematic background |
| File doesn't exist yet | Falls back to your existing banner slideshow |
| Slow connection | Poster (banner image) shows until video loads |
| User has "reduce motion" setting | Browser may pause the video |

---

## Video recommendations for best quality

| Setting | Recommendation |
|---------|---------------|
| Resolution | 1920×1080 minimum, 4K ideal |
| Duration | 15–30 seconds (loops seamlessly) |
| File size | < 20 MB for fast loading |
| Frame rate | 24–60 fps |
| Audio | Not needed (muted by browser policy) |

---

## Compress your video (optional but recommended)

Use **HandBrake** (free) to compress before deploying:
- Format: MP4 (H.264)
- Quality: RF 23–26
- Resolution: 1920×1080
- This reduces a 100 MB file to ~8–15 MB with no visible quality loss.

---

*The video plays on both mobile and desktop hero sections automatically.*
*The gradient overlay and all existing text/buttons stay perfectly on top.*
