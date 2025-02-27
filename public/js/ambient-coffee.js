import { SimpleReverb } from "./reverb.js"

class Range {
  /** @type {number} */
  min
  /** @type {number} */
  max

  constructor(min = 0, max = 0) {
    this.min = min
    this.max = max
  }

  get random() {
    return Math.random() * (this.max - this.min) + this.min
  }
}

class NonRepeatingPicker {
  #prev = -1

  /**
   * 
   * @param {Array} array An array of elements to pick from
   * @returns {any} A non-repeating random element from the array
   */
  random(array) {
    let index = Math.floor(Math.random() * array.length - 1)
    if(index === this.#prev) {
      index = (index + 1) % array.length
    }
    this.#prev = index
    return array[index]
  }
}

export class SoundClip {
  /** @type {string} */
  #url = null
  /** @type {boolean} */
  #loaded = false
  /** @type {ArrayBuffer} */
  #buffer = null

  /**
   * 
   * @param {string} url 
   */
  constructor(url = null) {
    this.#loaded = false

    if(url) {
      this.load(url)
    }
  }

  get url() {
    return this.#url
  }

  get loaded() {
    return this.#loaded
  }

  get buffer() {
    return this.#buffer
  }

  load(url) {
    if (this.#loaded) {
      if (this.#url === url) {
        return Promise.resolve()
      } else {
        this.unload()
      }
    }
    this.#url = url

    return new Promise((resolve, reject) => {
      fetch(url)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => {
        AmbientCoffee.audioContext.decodeAudioData(arrayBuffer, buffer => {
          this.#buffer = buffer
          this.#loaded = true
          resolve()
        }, reject)
      })
      .catch(reject)
    })
  }

  unload() {
    this.#buffer.stop()
    this.#buffer.disconnect()

    this.#buffer = null
    this.#loaded = false
  }  
}

/**
 * @interface LabeledObject
 */
class LabeledObject {
  /** @type {string} */
  label
}

/**
 * @class SoundSource
 * @implements LabeledObject
 */
export class SoundSource {
  /** @type {string} */
  label

  /** @type {SoundClip[]} */
  #clips = []

  /** @type {Range} Number of clips played per event */
  repeatCount

  /** @type {Range} Delay between end and start of repeats in seconds */
  repeatDelay

  /** @type {Range} Attack (fade in time) in seconds */
  attack

  /** @type {Range} Decay (fade out time) in seconds */
  decay

  /**
   * 
   * @param {string} label
   * @param {SoundClip[]} clips
   * @param {Object} options
   * @param {Range} options.repeatCount 
   * @param {Range} options.repeatDelay
   * @param {Range} options.attack
   * @param {Range} options.decay
   * 
   */
  constructor(label, clips, {repeatCount = null, repeatDelay = null, attack = null, decay = null}) {
    this.label = label
    this.#clips = clips
    this.repeatCount = repeatCount ?? new Range(1, 1)
    this.repeatDelay = repeatDelay ?? new Range(0, 0)
    this.attack = attack ?? new Range(0, 0)
    this.decay = decay ?? new Range(0, 0)
  }

  /**
   * @returns {Range}
   * @readonly
   */
  get length() {
    return this.#clips.reduce((range, clip) => {
      range.min = Math.min(range.min, clip.length)
      range.max = Math.max(range.max, clip.length)
    }, new Range(Number.MAX_VALUE, Number.MIN_VALUE))
  }

  /**
   * @returns {SoundClip[]}
   * @readonly
   */
  get clips() {
    return this.#clips
  }
  /**
   * 
   * @param {AudioNode} destination
   * @param {number} when
   * @returns {number} Duration of the play event
   */
  repeatInto(destination, when) {
    const repeats = this.repeatCount.random
    const envelope = AmbientCoffee.audioContext.createGain()
    envelope.connect(destination)

    const start = when
    const pick = new NonRepeatingPicker()
    for(let i = 0; i < repeats; i++) {
      const clip = pick.random(this.#clips)

      const bufferSource = AmbientCoffee.audioContext.createBufferSource()
      bufferSource.buffer = clip.buffer
      bufferSource.connect(envelope)
      bufferSource.start(when, offset, duration)

      when += this.repeatDelay.random + clip.buffer.duration
    }

    let attack = this.attack.random
    let decay = this.decay.random

    const envelopeLength = attack + decay
    const playLength = when - start
    if(playLength < envelopeLength) {
      attack = playLength * attack / envelopeLength
      decay = playLength * decay / envelopeLength
    }

    envelope.gain.setValueAtTime(0, start)
    envelope.gain.linearRampToValueAtTime(1, start + attack)
    envelope.gain.linearRampToValueAtTime(1, start + playLength - decay)
    envelope.gain.linearRampToValueAtTime(0, start + playLength)

    return playLength
  }

  /**
   * 
   * @param {AudioNode} destination 
   * @param {number} when 
   * @param {number} duration 
   * @returns 
   */
  playSegmentInto(destination, when, duration) {
    const pick = new NonRepeatingPicker()
    const clip = pick.random(this.#clips)
    duration = Math.min(duration, clip.buffer.duration)
    const offset = Math.random() * (clip.buffer.duration - duration)

    const bufferSource = AmbientCoffee.audioContext.createBufferSource()
    bufferSource.buffer = clip.buffer
    bufferSource.connect(destination)
    bufferSource.start(when, offset, duration)

    return duration
  }
}

/**
 * @interface AmbientTrack
 */
class AmbientTrack {
  playInto(destinationNode) {}
  disconnect() {}
}

/**
 * @class EventTrack
 * @implements AmbientTrack, LabeledObject
 */
class EventTrack {
  /** @type {string} */
  label

  /** @type {string} */
  type = 'event'

  /** @type {SoundSource[]} */
  #sources = []

  /** @type {Range} */
  #eventDelay

  /** @type {boolean} */
  #delayAfterPrev

  /** @type {NonRepeatingPicker} */
  #eventSourcePicker = new NonRepeatingPicker()

  /** @type {number} */
  #eventTimeHandler = -1

  /** @type {GainNode} */
  #gain

  /** @type {boolean} */
  #playing = false

  /**
   * 
   * @param {string} label 
   * @param {SoundSource[]} sources 
   * @param {Object} options
   * @param {Range} options.delay
   * @param {boolean} options.delayAfterPrev
   */
  constructor(label, sources, {delay = null, delayAfterPrev = true}) {
    this.label = label
    this.#sources = sources
    this.eventDelay = delay ?? new Range(0, 0)
    this.#delayAfterPrev = delayAfterPrev

    if(this.#eventDelay.min === 0 && this.#eventDelay.max === 0 && !this.#delayAfterPrev) {
      this.#delayAfterPrev = true
    }
  }

  #playEventLoops() {
    const source = this.#eventSourcePicker.random(this.#sources)
    const delay = this.#eventDelay.random
    const when = AmbientCoffee.audioContext.currentTime + delay
    const duration = source.repeatInto(this.#gain, when)

    this.#eventTimeHandler = setTimeout(
      this.#playEventLoops,
      this.#delayAfterPrev ? duration + delay : delay
    )
  }

  playInto(destination) {
    if(this.#playing) {
      this.disconnect()
    }
    this.#gain = AmbientCoffee.audioContext.createGain()
    this.#gain.connect(destination)
    this.#playEventLoops()
  }

  disconnect() {
    if(!this.#playing) {
      return
    }
    clearTimeout(this.#eventTimeHandler)
    this.#eventTimeHandler = -1
    this.#gain.disconnect()
  }
}

/**
 * @class LoopingTrack
 * @implements AmbientTrack, LabeledObject
 */
class LoopingTrack {
  static #equalPowerCrossfadeInCurve = ((resolution) => 
    new Float32Array(resolution).map((_, i) => Math.sin(i / (resolution - 1) * 0.5 * Math.PI))
  )(64)
  static #equalPowerCrossfadeOutCurve = this.#equalPowerCrossfadeInCurve.slice().reverse()
  static defaultCrossFadeDuration = 2

  /** @type {string} */
  label

  /** @type {string} */
  type = 'loop'

  /** @type {SoundSource} */
  #source

  /** @type {Range} */
  #duration

  /** @type {number} */
  #crossfadeDuration

  /** @type {number} */
  #eventTimeHandler = -1

  /** @type {GainNode} */
  #gain

  /** @type {boolean} */
  #playing

  /**
   * 
   * @param {string} label 
   * @param {SoundSource} source
   * @param {Object} options
   * @param {Range} options.duration
   */
  constructor(label, source, { duration = null }) {
    this.label = label
    this.#source = source
    this.#duration = duration ?? source.length
    this.#crossfadeDuration = Math.min(maxCrossfadeDuration, source.length.min / 2)
  }

  #playContinuousAmbience() {
    const crossFadeGain = AmbientCoffee.audioContext.createGain()
    const duration = this.#source.playSegmentInto(crossFadeGain, AmbientCoffee.audioContext.currentTime, this.length.random)

    crossFadeGain.gain.setValueCurveAtTime(
      LoopingTrack.#equalPowerCrossfadeInCurve,
      AmbientCoffee.audioContext.currentTime,
      this.#crossfadeDuration
    )
    this.#gain.gain.setValueCurveAtTime(
      LoopingTrack.#equalPowerCrossfadeOutCurve,
      AmbientCoffee.audioContext.currentTime + duration - this.#crossfadeDuration,
      this.#crossfadeDuration
    )
    
    crossFadeGain.connect(this.#gain)
    this.setTimeout(this.#playContinuousAmbience, duration - this.#crossfadeDuration)
  }

  playInto(destination) {
    if(this.#playing) {
      this.disconnect()
    }
    this.#gain = AmbientCoffee.audioContext.createGain()
    this.#gain.connect(destination)
    this.#playContinuousAmbience()
  }

  disconnect() {
    if(!this.#playing) {
      return
    }
    clearTimeout(this.#eventTimeHandler)
    this.#eventTimeHandler = -1
    this.#gain.disconnect()
  }
}

/**
 * @class AmbientChannel
 * @implements AmbientTrack, LabeledObject
 */
class AmbientChannel {
  static distances = {
    VERY_FAR: 0.1,
    FAR: 0.25,
    MEDIUM: 0.5,
    CLOSE: 0.75,
  }

  /** @type {string} */
  label

  /** @type {AmbientTrack[]} */
  #tracks = []

  /** @type {boolean} */
  #playing = false
  
  /** @type {BiquadFilterNode} */
  #muffleFilter = AmbientCoffee.audioContext.createBiquadFilter()

  /** @type {SimpleReverb} */
  #reverbFilter

  /** @type {GainNode} */
  #output = AmbientCoffee.audioContext.createGain()

  /** @type {AudioNode} */
  #input

  constructor(label, tracks, {distance = AmbientChannel.distances.MEDIUM, muffled = false, reverb = false}) {
    this.label = label
    this.#tracks = tracks

    this.#output.setValueAtTime(distance, AmbientCoffee.audioContext.currentTime)
    this.#input = this.#output

    if(muffled) {
      this.#muffleFilter.type = 'lowpass'
      this.#muffleFilter.frequency.value = 2000
      this.#muffleFilter.connect(this.#input)
      this.#input = this.#muffleFilter
    }

    if(reverb) {
      this.#reverbFilter = new SimpleReverb(AmbientCoffee.audioContext, 1)
      this.#reverbFilter.connect(this.#input)
      this.#input = this.#reverbFilter.input
    }
  }

  playInto(destination) {
    if(this.#playing) {
      this.disconnect()
    }
    this.#tracks.forEach(track => track.playInto(this.#input))
    this.#output.connect(destination)
    this.#playing = true
  }

  disconnect() {
    if(!this.#playing) {
      return
    }
    this.#tracks.forEach(track => track.disconnect())
    this.#output.disconnect()
    this.#playing = false
  }
}

/**
 * @class AmbientBrew
 * @implements LabeledObject
 */
class AmbientBrew {
  /** @type {string} */
  label

  /** @type {AmbientChannel[]} */
  #channels = []

  /** @type {GainNode} */
  #fade = AmbientCoffee.audioContext.createGain()

  /** @type {number} */
  #fadeDuration

  /** @type {boolean} */
  #playing = false

  constructor(label, channels, fadeDuration = 1) {
    this.label = label
    this.#channels = channels
    this.#fadeDuration = fadeDuration
    this.fade.gain.value = 0
  }

  fadeInto(destination) {
    if(this.#playing) {
      this.disconnect()
    }
    this.#channels.forEach(channel => channel.playInto(this.#fade))
    this.#fade.connect(destination)
    this.#fade.gain.linearRampToValueAtTime(1, AmbientCoffee.audioContext.currentTime + this.#fadeDuration)
    this.#playing = true
  }

  disconnect() {
    this.#channels.forEach(channel => channel.disconnect())
  }

  fadeOut() {
    return new Promise((resolve) => {
      this.#fade.gain.linearRampToValueAtTime(0, AmbientCoffee.audioContext.currentTime + this.#fadeDuration)
      setTimeout(() => {
        this.disconnect()
        resolve()
      }, this.#fadeDuration * 1000)
    })
  }
}

/** A player for ambient brews - a collection of sound clips and definitions on
 * when, where, and how to play them, to create a dynamic ambient soundscape.
 * 
 * The player provides a reusable AudioContext, but does not connect directly to
 * it by default. Instead, it provides a master gain node that can be connect to
 * the AudioContext for direct playback or another node for more processing.
 * 
 * @class AmbientCoffee
 */
export class AmbientCoffee {
  /** @type {AudioContext} */
  static audioContext = new AudioContext()

  /** @type {AmbientBrew[]} */
  #brews = []

  /** @type string */
  #baseUrl = ''

  /** @type {AmbientBrew} */
  #brewing = null

  /** @type {GainNode} */
  #master = AmbientCoffee.audioContext.createGain()

  /**
   * 
   * @param {string} [baseUrl=''] The default base URL that all brew clips reference.
   */
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl
  }

  #fixBaseUrl(url) {
    if(url.length > 0 && !url.endsWith('/')) {
      return url + '/'
    } else {
      return url
    }
  }

  /** @type {string} */
  set baseUrl(url) {
    this.#baseUrl = this.#fixBaseUrl(url)
  }

  /**
   * @returns {AudioParam}
   */
  get gain() {
    return this.#master.gain
  }

  /**
   * Loads an ambient brew into the player using a brew definition object.
   * @param {Object} brew An ambient brew definition, preferrably deserialized from JSON
   * @returns {Promise} A promise that resolves when the brew is loaded
   */
  async loadBrew(brew) {
    const baseUrl = (brew.baseUrl !== null) 
      ? this.#fixBaseUrl(brew.baseUrl)
      : this.#baseUrl

    return new Promise((resolve, reject) => {
      const clips = []
      const progress = []
      const fullURL = url => baseUrl + url

      brew.sources.forEach(({ clips }) => {
        clips.forEach(url => {
          if(!clips.find(url => clips.url === fullURL(url))) {
            const clip = new SoundClip()
            clips.push(clip)
            progress.push(clip.load(fullURL(url)))
          }
        })
      })  
      const fetchClip = url => clips.find(clip => clip.url === fullURL(url))

      Promise.all(progress)
      .then(() => {
        const sources = brew.sources.forEach(({ label, clips, ...props }) =>
          new SoundSource(label, clips.map(fetchClip), props)
        )
        const fetchSource = label => sources.find(source => source.label === label)

        const channels = brew.channels.forEach(({ label, tracks, ...channelProps }) =>
          new AmbientChannel(
            label,
            tracks.reduce((ambientTracks, { label, type, clones, ...trackProps }) => {
              clones = clones ?? 1
              for(let i = 0; i < clones; i++) {
                switch(type) {
                  case 'event':
                    ambientTracks.push(new EventTrack(
                      label,
                      trackProps.sources.map(fetchSource),
                      trackProps
                    ))
                    break
                  case 'loop':
                    ambientTracks.push(new LoopingTrack(
                      label,
                      fetchSource(trackProps.source),
                      trackProps
                    ))
                    break
                  default:
                    reject(new Error(`Unknown track type: ${type}`))
                }
              }
              return ambientTracks
            }, []),
            channelProps
          )
        )
        this.#brews.push(new AmbientBrew(brew.label, channels))
        resolve()
      })
      .catch(reject)
    })
  }

  /**
   * 
   * @param {string} label The label of a loaded ambient brew
   * @returns 
   */
  startBrew(label) {
    const nextBrew = this.#brews.find(brew => brew.label === label)
    if(!nextBrew) {
      return
    }

    if(this.#brewing) {
      this.#brewing.fadeOut().then(() => {
        this.#brewing = nextBrew
        this.#brewing.fadeInto(this.#master)
      })
    } else {
      this.#brewing = nextBrew
      this.#brewing.fadeInto(this.#master)
    }
  }

  connect(destination) {
    this.#master.connect(destination)
  }

}