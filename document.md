# Ambient Coffee Library

This document outlines the capabilities of the `ambient-coffee.js` library, including the types of ambient tracks that can be created, how they can be layered, and the JSON specification for defining ambient soundscapes.

## Capabilities

The Ambient Coffee library is designed for creating dynamic, layered ambient soundscapes for the web. It is built on the Web Audio API and provides a structured way to define and play complex audio environments.

Key features include:

*   **Dynamic Sound Events:** Create tracks that play sounds at random intervals from a collection of sound sources.
*   **Looping Soundbeds:** Create continuous, looping tracks with smooth crossfading.
*   **Layering and Effects:** Layer multiple tracks into channels, and apply effects like distance (volume), muffling (low-pass filter), and reverb to each channel.
*   **JSON-based Definitions:** Define entire soundscapes (called "brews") using a JSON format, making them easy to create, store, and load.

## Track Types

There are two main types of tracks that can be used to build an ambient soundscape:

### Event Tracks

`EventTrack`s are used for intermittent, distinct sounds. They play sounds from a list of `SoundSource`s at random intervals. You can control the time between sounds and whether the delay starts after the previous sound has finished.

### Looping Tracks

`LoopingTrack`s are used for continuous, atmospheric sounds. They play a segment from a `SoundSource` and loop it, crossfading between loops to create a seamless soundbed.

## Layering

Sounds in the Ambient Coffee library are layered using a hierarchical structure:

1.  **Sound Clips:** Individual audio files.
2.  **Sound Sources:** A collection of sound clips with properties like attack, decay, and repeat behavior.
3.  **Tracks:** `EventTrack`s or `LoopingTrack`s that use `SoundSource`s to generate audio.
4.  **Channels:** A collection of tracks that are grouped together. Effects like distance, muffling, and reverb can be applied at the channel level.
5.  **Brews:** The top-level container for an entire ambient soundscape, consisting of one or more channels.

## JSON Specification

An ambient soundscape is defined by a JSON object called a "recipe". Here is the specification for the recipe format:

```json
{
  "label": "Name of the Brew",
  "mediaUrl": "path/to/media/",
  "sources": [
    {
      "label": "source-label",
      "clips": [
        "clip1.mp3",
        {
          "prefix": "raindrop",
          "min": 1,
          "max": 4,
          "padding": 2,
          "extension": "wav"
        }
      ],
      "repeatCount": { "min": 1, "max": 3 },
      "repeatDelay": { "min": 0.1, "max": 0.5 },
      "attack": { "min": 0.2, "max": 1.0 },
      "decay": { "min": 0.5, "max": 2.0 }
    }
  ],
  "channels": [
    {
      "label": "channel-label",
      "distance": "medium",
      "muffled": true,
      "reverb": false,
      "tracks": [
        {
          "label": "track-label",
          "type": "event",
          "clones": 1,
          "sources": ["source-label-1", "source-label-2"],
          "delay": { "min": 5, "max": 15 },
          "delayAfterPrev": true
        },
        {
            "label": "another-track",
            "type": "loop",
            "source": "source-label-3",
            "duration": { "min": 10, "max": 20 }
        }
      ]
    }
  ]
}
```

### Top-Level Properties

*   `label` (string): The name of the brew.
*   `mediaUrl` (string, optional): The base URL for all sound clips.
*   `sources` (array): An array of `SoundSource` objects.
*   `channels` (array): An array of `AmbientChannel` objects.

### SoundSource Object

*   `label` (string): A unique identifier for the sound source.
*   `clips` (array): An array of strings or objects defining the sound clips. A string is a direct URL. An object can be used to define a sequence of clips.
*   `repeatCount` (Range, optional): The number of times to repeat a clip when played as an event.
*   `repeatDelay` (Range, optional): The delay between repeated clips.
*   `attack` (Range, optional): The fade-in time for a sound event.
*   `decay` (Range, optional): The fade-out time for a sound event.

### AmbientChannel Object

*   `label` (string): The name of the channel.
*   `distance` (string, optional): The perceived distance of the channel. Can be `'very-far'`, `'far'`, `'medium'`, or `'close'`. Defaults to `'medium'`.
*   `muffled` (boolean, optional): If `true`, applies a low-pass filter to the channel.
*   `reverb` (boolean, optional): If `true`, applies a reverb effect to the channel.
*   `tracks` (array): An array of `AmbientTrack` objects.

### AmbientTrack Object

*   `label` (string): The name of the track.
*   `type` (string): The type of track. Can be `'event'` or `'loop'`.
*   `clones` (number, optional): The number of instances of this track to create. Defaults to `1`.
*   **For `event` tracks:**
    *   `sources` (array): An array of `SoundSource` labels to use for events.
    *   `delay` (Range, optional): The delay between sound events.
    *   `delayAfterPrev` (boolean, optional): If `true`, the delay starts after the previous event has finished.
*   **For `loop` tracks:**
    *   `source` (string): The label of the `SoundSource` to loop.
    *   `duration` (Range, optional): The duration of the loop.

### Range Object

A `Range` object defines a range between a minimum and maximum value. A random value within this range will be chosen.

*   `min` (number): The minimum value.
*   `max` (number): The maximum value.
