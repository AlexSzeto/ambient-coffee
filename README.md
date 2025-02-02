# ambient-coffee
JS library for generating continuous ambience

## TODO
- Ambient Source start playing mid-clip

## PLAN

### CLIPS
- all clips contain an array of mp3 files
- when a clip plays a random file is chosen

### AMBIENT SOURCE
- each source is made up of an array of tracks
- each track has a master volume gain (have set values based on distance)
- apply a transition gain when distance changes

### AMBIENT TRACKS
- background type:
1) select section of a clip between min-length (5s?) and max-length (10s?) at random start time
2) cross fade between existing clip and new clip
3) and end of clip, restart step 1

- repetition event type:
1) wait beteen min-event-gap and max-event-gap seconds (set to 0 if continuous)
2) set repetition count between min-repeat and max-repeat
3) each event has a attack sustain decay cycle to control volume on top of the master volume
4) play a clip
5) pause for min-repeat-gap and max-repeat gap seconds
6) repeat step 4 for each repetition