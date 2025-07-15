import { AmbientCoffee } from '../ambient-coffee.js';

const ambientCoffee = new AmbientCoffee();

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
          padding: 2,
        },
      ],
      repeatCount: { min: 10, max: 20 },
      repeatDelay: { min: 0, max: 0.1 },
      attack: { min: 2, max: 8 },
      decay: { min: 2, max: 8 },
    },
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
          delayAfterPrev: false,
        },
      ],
      distance: 'close',
      reverb: true,
    },
  ],
};

const rainBrew = {
    label: 'rain-sounds',
    mediaUrl: './media/',
    sources: [
        {
            label: 'rain',
            clips: ['rain.mp3']
        }
    ],
    channels: [
        {
            label: 'rain',
            tracks: [
                {
                    label: 'rain-loop',
                    type: 'loop',
                    source: 'rain'
                }
            ]
        }
    ]
};

// Load both brews
ambientCoffee.loadBrew(eventBrew).then(() => {
  console.log('Stable sounds brew loaded');
});

ambientCoffee.loadBrew(rainBrew).then(() => {
    console.log('Rain brew loaded');
});


const playStableButton = document.createElement('button');
playStableButton.innerText = 'Play Stable Sounds';
playStableButton.addEventListener('click', () => ambientCoffee.playBrew('stable-sounds'));
document.body.appendChild(playStableButton);

const playRainButton = document.createElement('button');
playRainButton.innerText = 'Play Rain';
playRainButton.addEventListener('click', () => ambientCoffee.playBrew('rain-sounds'));
document.body.appendChild(playRainButton);

const combinedBrew = {
    label: 'combined-sounds',
    mediaUrl: './media/',
    sources: [
        {
            label: 'horse-gallop',
            clips: [
                {
                    prefix: 'horse-gallop-',
                    min: 1,
                    max: 20,
                    padding: 2,
                },
            ],
            repeatCount: { min: 10, max: 20 },
            repeatDelay: { min: 0, max: 0.1 },
            attack: { min: 2, max: 8 },
            decay: { min: 2, max: 8 },
        },
        {
            label: 'rain',
            clips: ['rain.mp3']
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
                    delayAfterPrev: false,
                },
            ],
            distance: 'close'
        },
        {
            label: 'rain',
            tracks: [
                {
                    label: 'rain-loop',
                    type: 'loop',
                    source: 'rain'
                }
            ],
            reverb: true
        }
    ]
};

ambientCoffee.loadBrew(combinedBrew).then(() => {
    console.log('Combined brew loaded');
});

const playCombinedButton = document.createElement('button');
playCombinedButton.innerText = 'Play Combined Sounds';
playCombinedButton.addEventListener('click', () => ambientCoffee.playBrew('combined-sounds'));
document.body.appendChild(playCombinedButton);
