---
name: cinematic-website
description: Guidance for building cinematic, "cinematographic" websites — pages that unfold like a film: scroll-driven storytelling, orchestrated motion, letterboxed framing, filmic color grading, and dramatic typographic reveals. Use when the user asks for a cinematic, filmic, immersive, scroll-telling, or "movie-like" website, landing page, hero, or portfolio, or wants video-led / motion-heavy web experiences that feel directed rather than assembled.
license: Complete terms in LICENSE.txt
---

# Cinematic Website

Approach this as a director of photography who also writes code. A cinematic site is not a normal page with more animation bolted on — it is a page *edited like a film*. It has an opening shot, a sequence of scenes, deliberate pacing, and a moment it builds toward. The scroll is the timeline. The viewport is the frame. Every reveal is a cut.

The failure mode is "AI motion slop": everything fades-up-on-scroll at once, parallax on every layer, autoplaying video with no purpose, and easing that feels like a spreadsheet. Cinematic means *directed and restrained* — a few decisive moments, correctly timed, with the discipline to hold still everywhere else.

## Before writing code: write the shot list

Cinema is planned. Do the same. In your thinking, decide these five things and state them before you build:

1. **The subject and the single feeling.** One concrete subject, one emotion the page should leave someone with (awe, tension, calm, momentum). Everything serves that feeling.
2. **The opening shot.** What fills the first viewport before any scroll? A cinematic page opens on its most characteristic image/motion, often full-bleed, often with the title arriving *into* the frame rather than sitting there.
3. **The scene sequence.** 3–6 "scenes," each occupying one or more viewports. Name each scene and what it reveals. Order carries meaning — build toward a climax, don't front-load it.
4. **The signature moment.** The one shot people remember: a scroll-scrubbed sequence, a full-viewport type reveal, a match-cut between two images, a camera "push-in." Spend your boldness here and keep the rest quiet.
5. **The grade.** A tight, filmic palette (see `references/color-grading.md`) — usually near-black or deep-tinted backgrounds, one or two graded accents, high tonal contrast, restrained saturation. Cinematic pages are rarely bright and rarely rainbow.

If you skip this and start animating, you get slop. Plan the film first.

## The core techniques

Read the reference files as you reach for each — they contain drop-in, dependency-light code.

- **Scroll as timeline** — `references/scroll-choreography.md`. Pin a scene, scrub progress across it, and drive reveals off scroll position instead of firing them all at load. Prefer the native scroll-driven animations API (`animation-timeline: view()/scroll()`) with an `IntersectionObserver` / `requestAnimationFrame` fallback. This is the backbone of a cinematic feel.
- **Motion & easing** — `references/motion-and-easing.md`. The difference between "cinematic" and "corporate template" is almost entirely the easing curve and the duration. Use custom cubic-béziers, longer holds, staggered entrances, and *transform/opacity only*. Never animate layout properties.
- **Color grading & atmosphere** — `references/color-grading.md`. Filmic palettes, grain, vignette, bloom/glow, gradient maps, and letterbox bars. This is what makes footage and UI feel like one graded image.
- **Typography that arrives** — `references/typography-motion.md`. Titles that mask-reveal line by line, kinetic type, and pairing a characterful display face with a quiet body face. Type is a cast member, not a caption.
- **Video, done right** — `references/video-and-media.md`. Muted looping backgrounds, poster-first loading, `prefers-reduced-motion` stills, scroll-scrubbed frame sequences, and keeping weight sane.

There is a complete, self-contained starter page in `assets/cinematic-starter.html` — a real opening shot, three scrubbed scenes, letterboxing, grain, and correct fallbacks. Read it, then adapt; don't ship it verbatim.

## Direction principles

**Cut, don't crossfade everything.** Film language is mostly hard cuts. On the web that means: let a scene *hold*, then transition decisively into the next. A page where every element gently fades in on scroll has no editing — it has a fog machine. Pick the two or three transitions that matter and make them sharp.

**One camera move per scene, at most.** Parallax, push-in (scale), pan, and rack-focus (blur) are camera moves. Using all of them at once reads as chaos. A single, slow, well-eased move per scene reads as intention.

**Pace with negative space and stillness.** Cinematic pacing needs rests. Full-bleed images with room to breathe, a beat of black between acts, a title alone on screen. Density is the enemy of drama. If everything is moving, nothing is.

**Frame deliberately.** Letterbox bars, safe-area margins, and full-bleed compositions establish "this is a frame." Compose shots — rule of thirds, a clear focal point, foreground/background separation — rather than filling the viewport edge to edge with UI.

**Time it like an edit.** Entrances around 600–1200ms with generous eased holds feel filmic; 150–250ms snappy UI easing feels like an app. Match duration to the feeling. Stagger related elements by 60–120ms so a group resolves as a sequence, not a flash.

**Sound is optional and always opt-in.** If the brief wants audio, it starts muted, has an obvious control, and never autoplays with sound. Most cinematic sites are silent and rely on motion and grade.

## Non-negotiable quality floor

Cinematic must not mean broken or exclusionary. Build these in from the start, not as cleanup:

- **`prefers-reduced-motion`**: every scroll-scrub, parallax, and auto-motion has a static, fully-legible fallback. Reduced motion should still look *designed* — the graded still frame, not a stripped page. This is mandatory.
- **Performance**: animate only `transform` and `opacity`; use `will-change` sparingly; lazy-load and poster heavy media; keep the main thread free (drive scrubbing off `requestAnimationFrame`, not layout-thrashing scroll handlers). Target a smooth 60fps; jank kills the illusion faster than anything.
- **Legibility over drama**: text sitting on imagery/video needs a scrim, gradient, or backdrop treatment so it always passes contrast. A gorgeous title no one can read is a failed shot.
- **Keyboard & focus**: visible focus states, real semantic structure, content reachable and readable without the motion.
- **It works without JS for the essentials**: content and layout should survive if the choreography doesn't load. Motion enhances; it isn't the content.
- **Responsive framing**: recompose for portrait/mobile — letterbox and full-bleed shots must be re-shot for narrow viewports, not just scaled down. Consider reducing scrub intensity on touch devices.

## Process

1. Write the shot list (subject, feeling, opening shot, scenes, signature moment, grade). Keep it short and specific to *this* brief.
2. Establish the grade and type system first — background tones, accents, grain/vignette, display + body faces. Get one static "frame" looking like a film still before adding a single animation.
3. Build the opening shot, then each scene in order, wiring scroll choreography per `references/scroll-choreography.md`. Add the reduced-motion fallback for each scene *as you build it*, never after.
4. Add the one signature moment. Resist adding a second.
5. Critique like an editor: watch it top to bottom (take screenshots / a screen capture if your environment supports it). Where is it saggy? What's moving that shouldn't be? Cut one effect — the Chanel rule applies to motion too. Then verify reduced-motion, mobile framing, and text contrast.

Restraint is the whole game. A cinematic page is remembered for one or two shots executed with total control, not for how many things moved.
