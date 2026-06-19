# make-your-game — MVP Specification

## Overview

A single-player browser-based game built entirely in plain JavaScript and HTML, with no frameworks and no canvas. The product must deliver a smooth, performant gameplay experience at a consistent 60 FPS, with a functional scoreboard and pause system. Performance is a first-class requirement — not an afterthought.

---

## Goals

- Deliver a playable, stable game from the pre-approved genre list
- Achieve and maintain 60 FPS with zero frame drops at all times
- Implement correct use of `requestAnimationFrame` as the sole animation driver
- Ship a pause menu, scoreboard, and smooth keyboard controls out of the box
- Keep rendering layers minimal to maximise compositing performance

---

## Scope

### In Scope

| Feature | Description |
|---|---|
| Game loop | `requestAnimationFrame`-driven, consistent 60 FPS, no `setInterval` or `setTimeout` for animation |
| Rendering | Plain JS/DOM and HTML only — no canvas, no frameworks |
| Pause menu | Accessible at any time during gameplay; includes **Continue** and **Restart** |
| Scoreboard | Displays **Timer**, **Score**, and **Lives** at all times |
| Keyboard controls | Held-key movement — smooth, no spamming required |
| Performance | No frame drops during gameplay or whilst paused; paint and layers kept to a minimum |
| Game genre | Must match one of the pre-approved titles (see below) |

### Out of Scope

- Multiplayer
- External libraries or frameworks
- Canvas-based rendering
- Mobile / touch controls

---

## Acceptance Criteria

### Performance
- Game runs at **at least 60 FPS** at all times — verified via the browser Performance Tool
- **No frame drops** during gameplay, pause, or resume
- `requestAnimationFrame` is used correctly and consistently
- Paint is minimised — verified via Paint Flashing in DevTools
- Compositor layers are minimal but non-zero — verified via Layer Borders in DevTools
- Performance is measurable and demonstrably fast

### Controls
- Player controls the game using the **keyboard only**
- Holding a key sustains the action; releasing it stops it immediately
- Motion is smooth — no jank or stutter

### Pause Menu
- Game can be paused at any time
- Pause menu presents two options: **Continue** and **Restart**
- Frames must not drop whilst the game is paused

### Scoreboard
- **Timer** — countdown or elapsed time, visible during gameplay
- **Score** — increments on relevant player actions
- **Lives** — decrements when the player loses a life

---

## Pre-Approved Game Genres

The game must be based on one of the following:

- [Bomberman](https://en.wikipedia.org/wiki/Super_Bomberman)
- [Flipper / Pinball](https://en.wikipedia.org/wiki/Pinball)
- [Space Invaders](https://en.wikipedia.org/wiki/Space_Invaders)
- [Donkey Kong](https://en.wikipedia.org/wiki/Donkey_Kong)
- [Brick Breaker / Arkanoid](https://en.wikipedia.org/wiki/Arkanoid)
- [Pac-Man](https://en.wikipedia.org/wiki/Pac-Man)
- [Super Mario](https://en.wikipedia.org/wiki/Super_Mario)
- [Tetris](https://en.wikipedia.org/wiki/Tetris)
- [Duck Hunt](https://en.wikipedia.org/wiki/Duck_Hunt)

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| Language | Plain JavaScript — no frameworks, no libraries |
| Rendering | HTML/DOM only — canvas is not permitted |
| Animation | `requestAnimationFrame` only |
| Layers | Minimal compositor layers — used deliberately, not freely |
| Controls | Keyboard only |

---

## Tooling & Verification

Performance must be verified using browser Developer Tools. The following are required for sign-off:

| Tool | Purpose |
|---|---|
| **Performance Tool** | Record FPS, identify frame drops, measure function execution time |
| **Paint Flashing** | Confirm paint is triggered as little as possible |
| **Layer Borders** | Confirm compositor layers are minimal and intentional |
| **Page Inspector** | Inspect and validate live DOM structure |
| **Web Console** | Debug and interact with the page via JavaScript |

---

## Key Learning Areas

- [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [Event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)
- FPS and frame timing
- DOM manipulation
- [Jank / stutter animation](https://addyosmani.com/blog/making-a-site-jank-free/) — [live example](https://googlechrome.github.io/devtools-samples/jank/)
- [Transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform) and [opacity](https://developer.mozilla.org/en-US/docs/Web/CSS/opacity) as performance-safe CSS properties
- Rendering pipeline tasks: JavaScript → Styles → Layout → Painting → Compositing
- Developer Tools: [Firefox](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_are_browser_developer_tools) · [Chrome](https://developers.google.com/web/tools/chrome-devtools)