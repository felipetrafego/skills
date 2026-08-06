# Motion & Easing

Whether a page reads as "cinematic" or "corporate template" is decided almost entirely by two things: the **easing curve** and the **duration**. Default `ease` at 300ms is the sound of a UI. Cinema breathes.

## Easing: never ship the browser defaults for scene motion

Linear and the built-in `ease*` keywords are fine for tiny UI feedback; they are not fine for scene entrances. Use custom cubic-béziers with real character.

```css
:root {
  /* Entrances — decisive start, long graceful settle (the workhorse) */
  --ease-out-cine: cubic-bezier(.22, 1, .36, 1);
  /* Camera moves — slow in, slow out; feels like a dolly */
  --ease-dolly:    cubic-bezier(.65, .05, .36, 1);
  /* Exits / dismissals — accelerate away */
  --ease-in-cine:  cubic-bezier(.55, 0, 1, .45);
  /* Overshoot for a single accent (use rarely — it reads playful, not filmic) */
  --ease-back:     cubic-bezier(.34, 1.56, .64, 1);
}
```

Reach for `--ease-out-cine` by default. `--ease-dolly` for scrubbed camera pushes/pans. Avoid springs and bounces unless the feeling is explicitly playful — overshoot is the opposite of cinematic gravitas.

## Duration: slower than you think, then hold

| Motion | Range | Feel |
|---|---|---|
| UI feedback (hover, toggle) | 120–250ms | snappy, app-like |
| Content reveal / entrance | 600–1000ms | filmic |
| Camera move (push-in, pan) | 1200–2500ms or scrubbed | a shot |
| Title / hero sequence | 1000–1800ms orchestrated | an opening |

When unsure, go a beat longer and add an eased hold at the end of the curve (that's what the `.36,1` / `.64,1` tail on the béziers buys you). Fast = product demo. Slow-and-held = film.

## Stagger: resolve groups as sequences

A group that all appears at once is a flash. Offset siblings by 60–120ms so the eye reads a *sequence*.

```css
.stagger > * {
  opacity: 0; transform: translateY(24px);
  animation: rise .9s var(--ease-out-cine) forwards;
  animation-delay: calc(var(--i) * 90ms); /* set --i per child, or via nth-child */
}
@keyframes rise { to { opacity: 1; transform: none; } }
```

Set `--i` in markup (`style="--i:0"`, `1`, `2`…) or with `:nth-child()`. For long lists, cap the cumulative delay (~600ms total) so late items don't feel abandoned.

## Orchestrating an opening sequence

Cinematic openings are *timelines*, not one animation. Chain beats with delays so the title, subtitle, and frame resolve in order. The Web Animations API makes multi-step timelines clean:

```js
const title = document.querySelector('.hero__title');
title.animate(
  [
    { opacity: 0, transform: 'translateY(40px)', filter: 'blur(12px)' },
    { opacity: 1, transform: 'translateY(0)',    filter: 'blur(0)' },
  ],
  { duration: 1200, delay: 300, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' }
);
// subtitle enters after the title has mostly landed
subtitle.animate(sameKeyframes, { duration: 900, delay: 900, easing: '...', fill: 'both' });
```

Think in beats: frame settles → title rises → subtitle follows → a subtle ambient loop (grain drift, slow zoom) begins and never stops. The ambient loop is what keeps a "still" hero alive.

## Ambient (idle) motion

A held shot shouldn't be dead. Add *one* slow, seamless loop — a 20–40s background drift, a barely-there grain shimmer, a 1.03× breathing zoom. It must be subtle enough to feel like life, not animation.

```css
.hero__bg {
  animation: breathe 30s ease-in-out infinite alternate;
}
@keyframes breathe {
  from { transform: scale(1);    }
  to   { transform: scale(1.06); }
}
```

## Hover / micro-interactions

Keep these fast (120–250ms) and physical — a slight scale, a graded glow, an underline that wipes in. They're the film's tactile details, so they should feel crisp, not floaty. Don't apply the long cinematic easing to hovers; it makes the UI feel laggy.

## What to animate — and what never to

- **Animate:** `transform` (translate/scale/rotate), `opacity`, `filter` (sparingly — blur/brightness are GPU-friendlier than others), `clip-path` for masked reveals.
- **Never animate:** `width`, `height`, `top/left/margin/padding`, `box-shadow` spread — they trigger layout/paint every frame and jank. To move something, translate it. To resize, scale it.
- `will-change: transform` on the handful of elements actively moving — then remove it when idle. Blanket `will-change` wastes memory and can *hurt*.

## Reduced motion

Wrap all decorative and ambient motion so it collapses to the final state:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
}
```

Then make sure each element's *end state* is the correct designed state (visible, in place, graded) — because that's all reduced-motion users will see.
