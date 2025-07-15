import { AmbientChannel, AmbientCoffee, EventTrack, LoopingTrack, Range, SoundClip, SoundSource } from './ambient-coffee.js'

const ambientCoffee = new AmbientCoffee()

// EVENT TRACK TEST
const clips = []
let source
let track
let eventChannel

let loadedCount = 0
let loaded = false
for(let i = 1; i <= 20; i++) {
  const clip = new SoundClip()
  clip
    .load(`./media/horse-gallop-${i.toString().padStart(2, '0')}.mp3`)
    .then(() => {
      loadedCount++
      if(loadedCount === 20) {
        loaded = true
      }
    })

  clips.push(clip)
}

function playEventTrack() {
  if(loaded && !source) {
    source = new SoundSource('horse-gallp', clips, { repeatCount: new Range(10, 20), repeatDelay: new Range(0, 0.1), attack: new Range(2, 8), decay: new Range(2, 8) })
    track = new EventTrack('stable-sounds', [source], { delay: new Range(3, 10), delayAfterPrev: false })
    eventChannel = new AmbientChannel('stable-sounds', [track], { distance: AmbientChannel.distances.CLOSE, reverb: true })
  }

  if(!loaded) {
    console.log(loadedCount)
  }

  if(!!source) {
    eventChannel.playInto(AmbientCoffee.audioContext.destination)
  }
}
// END EVENT TRACK TEST

// LOOPING TRACK TEST
let rainLoaded = false
const rainClip = new SoundClip('./media/rain.mp3')
let rainChannel
rainClip.load().then(() => {
  rainLoaded = true
  const rainSource = new SoundSource('rain', [rainClip])
  const rainTrack = new LoopingTrack('rain', rainSource, { duration: new Range(10, 20) })
  rainChannel = new AmbientChannel('rain', [rainTrack])
})

function playRainTrack() {
  if(rainLoaded) {
    rainChannel.playInto(AmbientCoffee.audioContext.destination)
  }
}

// END LOOPING TRACK TEST

const eventBrew = {
  label: 'stable-sounds',
  mediaUrl: './media/',
  sources: [
    {
      label: 'horse-gallop',
      clips: [
        { 
          prefix: 'horse-gallop-',
          min: 1,
          max: 20,
          padding: 2
        }
      ],
      repeatCount: { min: 10, max: 20 },
      repeatDelay: { min: 0, max: 0.1 },
      attack: { min: 2, max: 8 },
      decay: { min: 2, max: 8 }
    }
  ],
  channels: [
    {
      label: 'horse-gallop',
      tracks: [
        {
          label: 'horse-gallop',
          type: 'event',
          sources: ['horse-gallop'],
          delay: { min: 3, max: 10 },
          delayAfterPrev: false
        }
      ],
      distance: 'close',
      reverb: true
    }
  ]
}

const playSound = () => {
  // playEventTrack()
  // playRainTrack()
  ambientCoffee
  .loadBrew(eventBrew)
  .then(() => {
    console.log('Brew loaded')
    ambientCoffee.playBrew('stable-sounds')
  })
}

const playButton = document.createElement('button')
playButton.innerText = 'Play'
playButton.addEventListener('click', playSound)

document.body.appendChild(playButton)
