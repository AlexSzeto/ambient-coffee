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

class SoundClip {
  /** @type {boolean} */
  #loaded = false
  /** @type {ArrayBuffer} */
  #buffer = null
  /** @type {GainNode} */
  #gain = null

  constructor(url = null) {
    this.#loaded = false
    this.#gain = AmbientCoffee.audioContext.createGain()

    if(url) {
      this.load(url)
    }
  }

  get loaded() {
    return this.#loaded
  }

  get buffer() {
    return this.#buffer
  }

  load(url) {
    if (this.#loaded) {
      if (this.url === url) {
        return Promise.resolve()
      } else {
        this.unload()
      }
    }

    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest()
      request.open('GET', this.url, true)
      request.responseType = 'arraybuffer'

      request.onload = () => {
        AmbientCoffee.audioContext.decodeAudioData(request.response, (buffer) => {
          this.url = url
          this.#buffer = buffer
          this.#loaded = true
          resolve()
        }, reject)
      }
      request.send()
    })
  }

  unload() {
    this.#buffer.stop()
    this.#buffer.disconnect()

    this.#buffer = null
    this.#loaded = false
  }  
}

class AmbientSource {
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
   * @param {SoundClip[]} clips
   * @param {Range} repeatCount 
   * @param {Range} repeatDelay 
   */
  constructor(clips, repeatCount = null, repeatDelay = null, attack = null, decay = null) {
    this.#clips = clips
    this.repeatCount = repeatCount ?? new Range(1, 1)
    this.repeatDelay = repeatDelay ?? new Range(0, 0)
    this.attack = attack ?? new Range(0, 0)
    this.decay = decay ?? new Range(0, 0)
  }

  /**
   * @returns {Range}
   */
  get length() {
    return this.#clips.reduce((range, clip) => {
      range.min = Math.min(range.min, clip.length)
      range.max = Math.max(range.max, clip.length)
    }, new Range(Number.MAX_VALUE, Number.MIN_VALUE))
  }

  /**
   * 
   * @param {AudioNode} destinationNode
   * @param {number} when
   * @returns {number} Duration of the play event
   */
  playInto(destinationNode, when = null) {
    const repeats = this.repeatCount.random
    const envelope = AmbientCoffee.audioContext.createGain()
    envelope.connect(destinationNode)

    if(!when) {
      when = AmbientCoffee.audioContext.currentTime
    }
    const start = when
    const pick = new NonRepeatingPicker()    
    for(let i = 0; i < repeats; i++) {
      const clip = pick.random(this.#clips)

      const bufferSource = AmbientCoffee.audioContext.createBufferSource()
      bufferSource.buffer = clip.buffer
      bufferSource.connect(envelope)
      bufferSource.start(when)

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
}

class AmbientTrack {
  static distances = {
    VERY_FAR: 0.1,
    FAR: 0.25,
    MEDIUM: 0.5,
    CLOSE: 0.75,
  }

  /** @type {AmbientSource[]} */
  #sources = []

  /** @type {Range} */
  #eventDelay

  /** @type {boolean} */
  #continuous

  /** @type {NonRepeatingPicker} */
  #eventSourcePicker = new NonRepeatingPicker()

  /** @type {number} */
  #eventTimeHandler = -1

  /** @type {BiquadFilterNode} */
  #lowPassFilter = AmbientCoffee.audioContext.createBiquadFilter()

  /** @type {GainNode} */
  #gain = AmbientCoffee.audioContext.createGain()

  constructor(sources, {delay = null, distance = AmbientTrack.distances.MEDIUM, indoor = false}) {
    this.#sources = sources
    this.eventDelay = delay ?? new Range(0, 0)
    this.#continuous = !delay
    

    this.#lowPassFilter.type = 'lowpass'
    this.#lowPassFilter.frequency.setValueAtTime(2000, AmbientCoffee.audioContext.currentTime)
  }

  #playEvent() {
    const source = new NonRepeatingPicker().random(this.#sources)
    const delay = this.#eventDelay.random
    const duration = source.playInto(this.#gain)

    if(this.#continuous) {
      this.eventTimeHandler = setTimeout(() => this.#playEvent(), duration + this.#eventDelay.random)
    }
  }

  playInto(distancegainValuedestinationNode) {
    const source = new NonRepeatingPicker().random(this.#sources)
    const duration = source.playInto(destinationNode)

    if(this.#continuous) {
      this.eventTimeHandler = setTimeout(() => this.playInto(destinationNode), duration + this.#eventDelay.random)
    }
  }
}

export class AmbientCoffee {
  static audioContext = new AudioContext()

  #tracks = []
  #masterGain = AmbientCoffee.audioContext.createGain()

  constructor() {   
  }


}