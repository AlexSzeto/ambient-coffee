import { AmbientCoffee, SoundClip, SoundSource } from './ambient-coffee.js'

let loaded = false

const ambientCoffee = new AmbientCoffee()
const clip = new SoundClip()
let test

clip
.load('./media/horse-running-hq.mp3')
.then(() => {
  test = new SoundSource('horse-run', [clip], { attack: 1, decay: 1})
})  

const playSound = () => {
  if(!!test) {
    test.playSegmentInto(AmbientCoffee.audioContext.destination, 0, 5)
  }
}

const playButton = document.createElement('button')
playButton.addEventListener('click', playSound)

document.body.appendChild(playButton)
