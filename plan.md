# Project Plan

## Current Tasks

*   [x] Document the capabilities of the `ambient-coffee.js` library in `document.md`.
*   [x] Assess if `ambient-coffee.js` supports loading, editing, playing, transitioning, and stopping brew recipes.
    *   [x] **Loading:** Supported.
    *   [x] **Editing:** Not supported. Brews are immutable after being loaded.
    *   [x] **Playing:** Supported.
    *   [x] **Transitioning:** Supported.
    *   [x] **Stopping:** Supported.
*   [x] Rename and move `ambient-brewer.js` to a more appropriate location as it contains test code.

## Future Plans

### Brew Editor UI

*   [ ] **Design:** Plan a simple, track-based UI using Preact for loading, editing, and saving brew recipes. This UI should allow adding/removing tracks, modifying their properties, and controlling playback (play/stop).
*   [ ] **Implement:** Build the brew editor UI as designed.

### Embeddable Playback Component

*   [ ] **Design:** Design an independent, embeddable Preact UI component strictly for loading and playback of brew recipes.
*   [ ] **Implement:** Build the embeddable playback component.

### Advanced Features

*   [ ] Implement dynamic properties editing, allowing brews to be modified while playing.

### Housekeeping

*   [ ] Move or remove the manual test files (`public/manual-test.html` and `public/js/test/manual-test.js`).