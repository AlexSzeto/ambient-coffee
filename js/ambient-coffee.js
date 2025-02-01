class SoundClip {
  #loaded = false

  #buffer = null
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

  constructor({ })
}

export class AmbientCoffee {
  static audioContext = new AudioContext()

  #tracks = []
  #masterGain = AmbientCoffee.audioContext.createGain()

  constructor() {   
  }


}