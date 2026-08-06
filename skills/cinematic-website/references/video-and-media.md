# Video & Media

Video is the most literally "cinematic" tool and the easiest to abuse. A background video with no purpose, no poster, and a 30MB payload ruins the very feeling it's chasing. Use motion footage only where it earns the frame, and always make it degrade gracefully.

## Background video, done right

```html
<video
  class="hero__video graded"
  autoplay muted loop playsinline
  preload="metadata"
  poster="poster.jpg">
  <source src="hero.webm" type="video/webm">
  <source src="hero.mp4"  type="video/mp4">
</video>
```

Checklist:
- **`muted` + `playsinline` + `autoplay`** — required for autoplay on mobile; without `muted` browsers block it. `playsinline` stops iOS fullscreen takeover.
- **`poster`** — a graded still shows *instantly* and covers the load. The poster should already look like the film; the video just brings it to life.
- **`preload="metadata"`** — don't block the page fetching the whole file.
- **Cover the frame** without distortion:
  ```css
  .hero__video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  ```
- **Grade it** to match everything else (`color-grading.md`) — raw footage rarely matches your palette.
- **Scrim any text** over it.

### Weight & format
- Prefer **WebM (VP9/AV1)** with an MP4 (H.264) fallback. AV1/VP9 are dramatically smaller.
- Background loops should be short (5–12s), silent, and compressed hard — no audio track at all (strip it; it's dead weight).
- Target a few MB, not tens. Keep dimensions to what's shown (a 1080p loop is plenty for a background).
- Lazy-load below-the-fold videos; only the hero should load eagerly.

## Reduced motion & data saving — required

Do not autoplay motion for users who opted out. Show the graded poster still instead.

```css
@media (prefers-reduced-motion: reduce) {
  .hero__video { display: none; }
  .hero { background-image: url(poster.jpg); background-size: cover; background-position: center; }
}
```

And in JS, respect it and pause when offscreen (saves battery, keeps the main thread free):

```js
const v = document.querySelector('.hero__video');
if (matchMedia('(prefers-reduced-motion: reduce)').matches) v.removeAttribute('autoplay'), v.pause();

new IntersectionObserver(([e]) => {
  if (!v) return;
  e.isIntersecting ? v.play().catch(()=>{}) : v.pause();
}, { threshold: 0.1 }).observe(v);
```

Also consider `navigator.connection?.saveData` — skip autoplay video on data-saver.

## Scroll-scrubbed frame sequence (the "Apple" shot)

The premium signature move: play a video/animation *by scrolling*. Two approaches.

**A. Scrub a `<video>`'s `currentTime`** — simplest, but seeking can stutter on long clips. Keep the clip short and low-bitrate for smooth seeking.

```js
// section.pin is height:400vh with a sticky <video> inside (see scroll-choreography.md)
function updateVideo(p) {           // p = 0..1 scroll progress of the pinned section
  if (video.duration) video.currentTime = p * video.duration;
}
```
Pause the video (`video.pause()`) and never call `play()` — you're driving frames manually. Set `preload="auto"` so seeks are ready.

**B. Draw an image-frame sequence to `<canvas>`** — smoothest and fully controllable. Preload N stills, draw the frame for the current progress.

```js
const canvas = document.querySelector('canvas'), ctx = canvas.getContext('2d');
const FRAMES = 120;
const imgs = Array.from({length: FRAMES}, (_, i) => {
  const im = new Image();
  im.src = `frames/${String(i).padStart(4,'0')}.webp`;
  return im;
});
function drawFrame(p) {
  const i = Math.min(FRAMES - 1, Math.floor(p * FRAMES));
  const im = imgs[i];
  if (im.complete) ctx.drawImage(im, 0, 0, canvas.width, canvas.height);
}
```
Use compressed WebP/AVIF frames, size them to display resolution, and preload the first frames eagerly so the sequence starts instantly. This trades bytes for buttery scrubbing — worth it for the one signature scene, not for every section.

Both A and B need the reduced-motion fallback: show the first (or a hero) frame statically and skip the scrub.

## Images

- Use `<picture>` with AVIF/WebP sources and a JPeg fallback; set explicit `width`/`height` (or `aspect-ratio`) to prevent layout shift — CLS is jank, and jank breaks the spell.
- Full-bleed shots: `object-fit: cover` and compose with `object-position` so the focal point survives cropping across viewports.
- Ken Burns effect (slow pan/zoom on a still) is a cheap, elegant way to add motion without video — a scaled `transform` on a long ambient loop (`motion-and-easing.md`).
- Grade images with the gradient-map overlay so stills and video share one look.

## Audio (only if asked)

- Never autoplay with sound. Start muted; provide a visible, labeled toggle.
- Respect the user: remember their choice, and pause when the tab is hidden (`document.visibilitychange`).
- Most cinematic sites are silent — the grade and motion carry the mood. Add sound only when the brief genuinely wants it.

## Performance summary

- Poster-first, `preload="metadata"`, lazy-load offscreen media.
- WebM/AV1 + MP4; strip audio from background loops; keep clips short.
- Pause video when offscreen and under reduced-motion/data-saver.
- Explicit dimensions on all media to kill layout shift.
- One scrubbed sequence per page — it's the expensive shot; make it the memorable one.
