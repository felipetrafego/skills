# Scroll Choreography

The scroll is the film's timeline. Cinematic pages *scrub* — element state is a function of scroll position — rather than firing one-shot "fade in when visible" animations everywhere. This file gives you three tools, cheapest first. Reach for the lightest one that does the job.

Golden rules:
- Never drive animation from a `scroll` event that reads/writes layout — that thrashes and janks. Use CSS scroll-driven timelines, `IntersectionObserver`, or a single `requestAnimationFrame` loop.
- Animate `transform` and `opacity` only.
- Every technique here needs a `prefers-reduced-motion` fallback (shown at the end).

## 1. One-shot reveals (IntersectionObserver)

For scenes that simply arrive once as they enter the frame. Staggered, eased, GPU-only.

```html
<section class="scene">
  <h2 class="reveal">The city never slept</h2>
  <p class="reveal" style="--d:1">It only closed its eyes.</p>
</section>
```

```css
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity .9s cubic-bezier(.22,1,.36,1),
    transform .9s cubic-bezier(.22,1,.36,1);
  transition-delay: calc(var(--d, 0) * 90ms); /* stagger a group */
}
.reveal.in { opacity: 1; transform: none; }
```

```js
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target); // reveal once, like a cut
    }
  }
}, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));
```

## 2. Native scroll-driven animations (best, when supported)

The browser runs the animation off scroll position on the compositor — buttery, no JS in the hot path. `scroll()` tracks the page scroll; `view()` tracks an element crossing the viewport. Feature-detect and fall back to §1/§3.

```css
@supports (animation-timeline: view()) {
  .push-in {
    animation: pushIn linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 40%; /* start as it enters, finish 40% across */
  }
  @keyframes pushIn {
    from { opacity: 0; transform: scale(1.12) translateY(24px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);    }
  }

  /* A pinned/scrubbed progress bar or grade shift tied to whole-page scroll */
  .grade-shift {
    animation: warmToCold linear both;
    animation-timeline: scroll(root block);
  }
  @keyframes warmToCold {
    from { filter: sepia(.25) saturate(1.1) hue-rotate(-8deg); }
    to   { filter: sepia(0)   saturate(.9)  hue-rotate(200deg); }
  }
}
```

`animation-range` keywords worth knowing: `cover` (element fully spans the timeline), `entry` / `exit` (crossing the start/end edge), `contain`. Percentages/lengths tune the in/out points.

## 3. Scrubbed sequences (pin + progress, rAF)

The signature cinematic move: pin a tall section and map its scroll progress `0→1` onto a transform, a masked title, or a frame index. Do the math in one `requestAnimationFrame` loop reading a cached scroll value — never write layout inside a scroll handler.

```html
<section class="pin" data-scrub>
  <div class="pin__sticky">
    <div class="shot" data-shot></div>
  </div>
</section> <!-- give .pin height:300vh so there is scroll to scrub -->
```

```css
.pin { height: 300vh; position: relative; }
.pin__sticky { position: sticky; top: 0; height: 100vh; overflow: hidden; }
.shot { will-change: transform; }
```

```js
let ticking = false, lastY = 0;

function onScroll() {
  lastY = window.scrollY;
  if (!ticking) { requestAnimationFrame(update); ticking = true; }
}

function update() {
  ticking = false;
  document.querySelectorAll('[data-scrub]').forEach(sec => {
    const r = sec.getBoundingClientRect();
    const total = sec.offsetHeight - window.innerHeight;
    // progress 0 when top hits viewport top, 1 when bottom-anchored
    const p = Math.min(1, Math.max(0, -r.top / total));
    const shot = sec.querySelector('[data-shot]');
    // example move: slow push-in + drift
    shot.style.transform = `scale(${1 + p * 0.15}) translateY(${p * -40}px)`;
    sec.style.setProperty('--p', p.toFixed(4)); // expose to CSS if useful
  });
}

addEventListener('scroll', onScroll, { passive: true });
update();
```

Use the same `--p` to drive a masked title (`clip-path`), crossfade two images (`opacity: var(--p)`), or index a frame sequence (see `video-and-media.md`).

## Parallax (one layer, gently)

Parallax is a camera-depth cue, not a default. Offset **one** background layer at a fraction of scroll. More than one competing parallax speed reads as noise.

```js
// inside update(), per hero:
const depth = -lastY * 0.25;            // background drifts slower than content
hero.style.transform = `translate3d(0, ${depth}px, 0)`;
```

Prefer `background-attachment: fixed` only for simple cases — it's cheap but coarse and misbehaves on iOS; the transform approach above is smoother.

## Smooth-scroll / scroll snapping

- CSS `scroll-snap-type: y proximity` on the scroll container + `scroll-snap-align: center` on scenes gives a gentle "settle into each shot" feel. Use `proximity`, not `mandatory`, so you never trap the user.
- Avoid heavyweight JS smooth-scroll libraries that hijack native scrolling — they fight assistive tech and trackpads. Native `scroll-behavior: smooth` for anchor jumps is fine.

## Reduced motion — mandatory for all of the above

```css
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
  .push-in, .grade-shift { animation: none !important; }
  .pin { height: auto !important; }          /* un-pin: scenes just stack */
  .pin__sticky { position: static; height: auto; }
  .shot { transform: none !important; }
}
```

In JS, bail out of scrubbing entirely:

```js
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
if (!reduce.matches) {
  addEventListener('scroll', onScroll, { passive: true });
  update();
}
```

The reduced-motion version must still look like a designed film still — graded, framed, legible — not a stripped wireframe.
