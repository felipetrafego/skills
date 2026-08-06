# Color Grading & Atmosphere

Grading is what makes disparate images, video, and UI feel like one photographed world. A cinematic page is *graded*: a tight tonal range, controlled saturation, unified highlights and shadows, and atmosphere (grain, vignette, bloom, letterbox) sitting over everything. Bright, high-saturation, many-hued pages read as "web app," not "film."

## Filmic palettes

Cinematic palettes are small and moody. Pick a lane:

- **Noir / teal-orange:** near-black shadows, warm skin/highlight, cool cyan mids. The most recognizably "movie" grade.
  `--bg:#0a0c10; --shadow:#0f1620; --mid:#1c6e7a; --warm:#e8a15d; --high:#f4ede1;`
- **Warm nostalgic (golden hour / 70s):** amber-tinted blacks, muted greens, creamy highlights.
  `--bg:#14100b; --tint:#3a2c1e; --accent:#d99a4e; --high:#f0e6d2;`
- **Cold dystopian:** blue-black, desaturated, one cold accent.
  `--bg:#080b12; --panel:#111826; --accent:#6ea8ff; --high:#dfe7f2;`
- **High-contrast mono + one accent:** black/white/grey with a single graded color (vermilion, acid amber). Extremely filmic when disciplined.

Rules that keep it cinematic:
- **Never pure black or pure white.** Shadows carry a tint (`#0a0c10`, not `#000`); highlights are off-white (`#f4ede1`). This is the single biggest tell of a graded vs. un-graded page.
- **Cap saturation.** One or two accents may be vivid; everything else is desaturated. A rainbow is never cinematic.
- **Unify the tint.** Shadows lean one temperature, highlights the complementary one (teal shadows / orange highlights is the classic). Consistency across all media is the grade.

## Grading imagery and video in CSS

Push mismatched source media toward your grade with `filter` and blend layers.

```css
.graded {
  filter: contrast(1.08) saturate(.85) brightness(.95) sepia(.12) hue-rotate(-6deg);
}
```

**Gradient map / color wash** — the most powerful trick. Overlay a two-tone gradient in `multiply` (deepens shadows to your tint) plus a `screen`/`soft-light` pass (lifts highlights to your warm), so every image inherits the same shadow/highlight tint:

```css
.frame { position: relative; }
.frame::before, .frame::after { content:""; position:absolute; inset:0; pointer-events:none; }
.frame::before { background: linear-gradient(180deg, #0a0c10 0%, transparent 45%); mix-blend-mode: multiply; }
.frame::after  { background: radial-gradient(120% 80% at 50% 20%, #e8a15d33, transparent 60%); mix-blend-mode: screen; }
```

## Atmosphere layers

Stack these over the whole page or per-scene. Each is subtle alone; together they read as "shot on film."

**Vignette** — pulls the eye to center, darkens edges:
```css
.vignette::after {
  content:""; position:fixed; inset:0; pointer-events:none; z-index:50;
  background: radial-gradient(120% 120% at 50% 50%, transparent 55%, #000 130%);
  opacity:.55;
}
```

**Film grain** — the texture that unifies flat digital gradients. Use a tiling SVG-noise data URI (self-contained, no asset), animated to shimmer:
```css
.grain::after {
  content:""; position:fixed; inset:-50%; pointer-events:none; z-index:60;
  opacity:.06; mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: grain 1.2s steps(6) infinite;
}
@keyframes grain {
  0%{transform:translate(0,0)} 20%{transform:translate(-4%,2%)}
  40%{transform:translate(3%,-3%)} 60%{transform:translate(-2%,4%)}
  80%{transform:translate(4%,-2%)} 100%{transform:translate(0,0)}
}
```
Keep opacity 0.04–0.08. Grain that you *notice* is too strong.

**Bloom / glow** — highlights bleed. A soft `filter: blur()` copy of a bright element behind itself, or `box-shadow` with a graded color, sells light sources (neon, sun, screens):
```css
.glow { text-shadow: 0 0 24px #e8a15d66, 0 0 60px #e8a15d33; }
```

**Letterbox bars** — instant "cinema." Fixed black bars top and bottom, sized to a target aspect (2.39:1 is anamorphic scope; 1.85:1 is standard widescreen). Best as an intentional framing device for a hero or a pinned scene, not the whole scroll.
```css
.scope::before, .scope::after {
  content:""; position:fixed; left:0; right:0; height:8vh; background:#000; z-index:70;
}
.scope::before { top:0; } .scope::after { bottom:0; }
```
Consider animating the bars *open* on load (from `height: 50vh` closed to `8vh`) as the film "starts."

## Layer order (top → bottom)

1. Letterbox bars (if used)
2. Grain
3. Vignette
4. UI / text (with its own scrim for legibility)
5. Graded media (images/video + gradient-map overlays)
6. Background tint

## Text legibility over graded media — non-negotiable

Graded, moody backgrounds eat text. Always give type a scrim:
```css
.scene__copy { position:relative; }
.scene__copy::before {
  content:""; position:absolute; inset:-2rem; z-index:-1;
  background: linear-gradient(180deg, transparent, #0a0c10cc 60%);
}
```
Or a localized radial darken behind the text block. Verify contrast against the *darkest frame* the text ever sits on, not the average.

## Reduced motion / low-power

Grain animation and ambient drift are motion — gate them:
```css
@media (prefers-reduced-motion: reduce) {
  .grain::after { animation: none; }
}
```
A static grain still adds texture; it just stops shimmering. Vignette, letterbox, and the grade itself are static and stay.
