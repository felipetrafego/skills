# Typography in Motion

In a cinematic page, type is a cast member — titles arrive, credits roll, words are *timed*. Treat text as something that performs into the frame, while keeping it perfectly legible when it lands.

## The pairing

- **Display face:** characterful, used big and sparingly — the title card. High-contrast serifs (Playfair, Canela-like), tight grotesques (Neue Haas / Söhne-like), or a distinctive condensed face read as filmic. Set it large, tighten tracking, and give it room.
- **Body face:** quiet and highly legible — the subtitles. A clean humanist sans or a readable serif. It should never compete with the display.
- **Utility face (optional):** a mono for timecodes, captions, credits — leans into the film metaphor (`00:14:22`, `SCENE 03`, `CD·DP·ED`).

Avoid Inter-as-everything and the default system stack for the display role — it's the fastest way to look templated. Pick display type with a point of view.

Set a real scale (e.g. 1.25–1.333 ratio), heavy contrast between title and body sizes, and generous `line-height` on body (1.5–1.7) with tight `line-height` on big display (0.95–1.1).

## Line-by-line mask reveal (the title card)

The signature type move: each line rises out from behind a mask, staggered — like a credit sequence. Wrap each line in an overflow-clipped container and translate an inner span.

```html
<h1 class="title-reveal">
  <span class="line"><span class="line__inner">Some things</span></span>
  <span class="line"><span class="line__inner">are only true</span></span>
  <span class="line"><span class="line__inner">in the dark</span></span>
</h1>
```

```css
.title-reveal { line-height: 1.02; }
.line { display: block; overflow: hidden; }         /* the mask */
.line__inner {
  display: block;
  transform: translateY(110%);
  animation: lineUp 1s cubic-bezier(.22,1,.36,1) forwards;
}
.line:nth-child(1) .line__inner { animation-delay: .15s; }
.line:nth-child(2) .line__inner { animation-delay: .30s; }
.line:nth-child(3) .line__inner { animation-delay: .45s; }
@keyframes lineUp { to { transform: translateY(0); } }
```

To trigger on scroll instead of load, start `.line__inner` paused/hidden and add the animation class via `IntersectionObserver` (see `scroll-choreography.md`).

## Word / character stagger (kinetic type)

For a punchier beat, split into words or characters and stagger. Split in JS so markup stays clean and accessible (keep an accessible copy):

```js
function splitWords(el) {
  const text = el.textContent;
  el.setAttribute('aria-label', text);        // preserve for screen readers
  el.textContent = '';
  text.split(/(\s+)/).forEach((w, i) => {
    if (!w.trim()) { el.append(w); return; }
    const s = document.createElement('span');
    s.className = 'word'; s.textContent = w;
    s.style.setProperty('--i', i);
    s.setAttribute('aria-hidden', 'true');
    el.append(s);
  });
}
```

```css
.word {
  display: inline-block;
  opacity: 0; transform: translateY(0.6em) rotate(2deg);
  animation: wordIn .7s cubic-bezier(.22,1,.36,1) forwards;
  animation-delay: calc(var(--i) * 45ms);
}
@keyframes wordIn { to { opacity:1; transform:none; } }
```

Use kinetic type on **one** hero, not on every heading. Overused, it's the biggest slop tell in the medium.

## Scroll-scrubbed type

Tie a title's reveal directly to scroll progress (`--p` from `scroll-choreography.md`) for a scrubbed, scrubbable feel — a `clip-path` wipe or a mask that tracks the scroll:

```css
.wipe { clip-path: inset(0 calc((1 - var(--p)) * 100%) 0 0); } /* reveals L→R as --p 0→1 */
```

Variable fonts scrub beautifully — animate `font-weight` or an optical/width axis across scroll for a title that *thickens* as it centers:
```css
.vf { font-variation-settings: "wght" calc(100 + var(--p) * 800); }
```

## Big-type composition

- Let a title own a full viewport with nothing else — a rest beat between scenes. Silence is pacing.
- Tighten tracking on large display (`letter-spacing: -0.02em` and down); loosen it on small caps/labels (`letter-spacing: .18em; text-transform: uppercase`) for the "SCENE 02" credit look.
- Mix scale hard: a huge word next to tiny mono metadata reads as a title card. Even scale reads as a document.
- Anchor to a grid/margin so full-bleed type still feels *composed*, not just centered.

## Legibility discipline

- Every animated text ends at full opacity, in place, high-contrast against its (darkest) background — with a scrim if it sits on media (`color-grading.md`).
- Keep an accessible text node: use `aria-label` on split containers and `aria-hidden` on the visual shards, or animate a visually-identical layer over real text.
- Don't animate `letter-spacing`/`font-size` for entrances (layout thrash) — animate `transform`, `opacity`, `clip-path`, and (for variable fonts) `font-variation-settings`.

## Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  .line__inner, .word { animation: none !important; transform: none !important; opacity: 1 !important; }
  .wipe { clip-path: none !important; }
}
```

The static state must be the finished title card — perfectly set and legible.
