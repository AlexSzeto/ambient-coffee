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

## Front-End Requirements

The project will utilize the following front-end technologies:

*   **Preact:** A fast, lightweight alternative to React with the same modern API
*   **Preact HTM:** HTML-like syntax for creating Preact components without a build step
*   **Tailwind CSS:** A utility-first CSS framework for rapid UI development

## Future Plans

### Brew Editor UI

*   [x] **Goal 1: Develop Reusable UI Components**
    *   [x] **Subtask 1.1: Number Range Picker (Preact Component)**
        *   Implement a UI component in Preact for selecting a min/max value, to be used for all `Range` objects.
        *   **Component Location:** `public/js/common/number-range-picker.js`
        *   **Props:** `width`, `scale`, `minAllowed`, `maxAllowed`, `min`, `max`, `onChange` (callback function).
        *   **Visuals:**
            *   The component will display a line indicating the selectable range.
            *   Two outlined, draggable dots will represent the min and max values.
            *   The current numeric value for min and max will be displayed above their respective dots.
        *   **Behavior:**
            *   The max value cannot be dragged to a value less than the min value.
            *   When the min and max values overlap, the max dot should be rendered on top, ensuring it is the first to be dragged.
            *   Clicking on the numeric value display above a dot will reveal a text input, allowing for manual entry of the value.
            *   The `onChange` callback will be invoked with an object `{ min, max }` whenever the values change.
    *   [x] **Subtask 1.2: Discrete Value Slider**
        *   Implement a UI component for selecting a single value from a predefined set of labeled options, to be used for the `distance` property.
    *   [x] **Subtask 1.3: Toggle Button**
        *   Implement a reusable toggle button for all boolean properties (e.g., `muffled`, `reverb`, `delayAfterPrev`).

*   [ ] **Goal 2: Implement Sound Asset Management (Sound Sources)**
    *   [ ] **Subtask 2.1: Sound Source List UI**
        *   Create a UI to display, add, edit, and delete all available `SoundSource` objects.
    *   [ ] **Subtask 2.2: Sound Source Editor UI**
        *   Create a form/modal for editing a `SoundSource`.
        *   [ ] Text input for `label`.
        *   [ ] UI to manage the `clips` array (add/remove sound files, define clip sequences).
        *   [ ] Use Number Range Picker for `repeatCount`.
        *   [ ] Use Number Range Picker for `repeatDelay`.
        *   [ ] Use Number Range Picker for `attack`.
        *   [ ] Use Number Range Picker for `decay`.
    *   [ ] **Subtask 2.3: Audio File Management**
        *   Implement logic for uploading, storing, and referencing user-provided audio files.

*   [ ] **Goal 3: Design and Implement Core Channel & Track Editor**
    *   [ ] **Subtask 3.1: Channel Management**
        *   Create UI to add, delete, and reorder channels.
    *   [ ] **Subtask 3.2: Single Channel UI**
        *   Create a component to represent a single channel.
        *   [ ] Text input for `label`.
        *   [ ] Use Discrete Value Slider for `distance`.
        *   [ ] Use Toggle Button for `muffled`.
        *   [ ] Use Toggle Button for `reverb`.
    *   [ ] **Subtask 3.3: Track Management**
        *   Create UI within each channel to add, delete, and reorder tracks.
    *   [ ] **Subtask 3.4: Single Track UI**
        *   Create a component to represent a single track.
        *   [ ] Text input for `label`.
        *   [ ] Dropdown to select `type` (`event` or `loop`).
        *   [ ] Number input for `clones`.
        *   [ ] **Conditional UI for `event` tracks:**
            *   [ ] Multi-select for `sources`.
            *   [ ] Use Number Range Picker for `delay`.
            *   [ ] Use Toggle Button for `delayAfterPrev`.
        *   [ ] **Conditional UI for `loop` tracks:**
            *   [ ] Single select for `source`.
            *   [ ] Use Number Range Picker for `duration`.

*   [ ] **Goal 4: Implement Brew Management (Load, Save, Export)**
    *   [ ] **Subtask 4.1: Top-Level Brew Settings**
        *   [ ] Text input for the main brew `label`.
        *   [ ] Text input for the `mediaUrl`.
    *   [ ] **Subtask 4.2: Load/Save Functionality**
        *   Implement UI and logic for loading and saving brew recipe files.
    *   [ ] **Subtask 4.3: Export Functionality**
        *   Implement UI and logic to export a brew, potentially bundling assets.

### Embeddable Playback Component

*   [ ] **Design:** Design an independent, embeddable Preact UI component strictly for loading and playback of brew recipes.
*   [ ] **Implement:** Build the embeddable playback component.

### Advanced Features

*   [ ] Implement dynamic properties editing, allowing brews to be modified while playing.

### Samples Acqusition and Processing
*   [ ] Water
    *   [ ] Drips
    *   [ ] Stream
    *   [ ] Waterfall
    *   [ ] Beach
    *   [ ] Drizzle
    *   [ ] Storm
*   [ ] Fire
*   [ ] Nature
    *   [ ] Rustling Grass
    *   [ ] Rustling Bushes
    *   [ ] Rustling Trees
    *   [ ] Thunder
*   [ ] Air / Wind
    *   [ ] Breeze
    *   [ ] Gust
    *   [ ] Cave
*   [ ] Travel
    *   [ ] Footsteps
    *   [ ] Hoovesteps
    *   [ ] Wheels
*   [ ] Humans
    *   [ ] Whispering
    *   [ ] Conversations
    *   [ ] Crowded Conversation
    *   [ ] Excited Crowd
*   [ ] Objects
    *   [ ] Paper/Pen (Study, Library)
    *   [ ] Plates/Cups (Cafe, Tavern)

### Housekeeping

*   [ ] Move or remove the manual test files (`public/manual-test.html` and `public/js/test/manual-test.js`).

