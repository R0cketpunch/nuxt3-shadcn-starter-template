# Game Sounds

This directory contains custom sound files for the Game of Thrones board game timer and transitions.

## Sound File Structure

### Timer Sounds

- `timer-start.ogg` - Plays when timer starts
- `timer-halfway.ogg` - Plays when timer reaches 50%
- `timer-done.ogg` - Plays when timer completes

### Game Event Sounds

- `phase.ogg` - Plays when entering any phase (Westeros, Planning, Action)
- `subphase.ogg` - Plays when advancing to next sub-phase
- `round.ogg` - Plays when advancing to a new round
- `game-end.ogg` - Plays when the game ends (after 10 rounds)
- `influence-move.ogg` - Plays when influence track positions change
- `wildling-attack.ogg` - Plays when wildling threat reaches 12 (attack triggered)

## Audio Format Requirements

- **Format**: MP3, WAV, or OGG
- **Duration**: 1-3 seconds recommended (except themes which can be longer)
- **Volume**: Pre-normalized to avoid clipping
- **Quality**: 44.1kHz, 16-bit minimum

## How It Works

1. The game will **first try to load custom sound files** from this directory
2. If a custom sound file is not found or fails to load, it will **fallback to generated tones**
3. All sounds are cached after first load for better performance

## Adding Custom Sounds

1. Place your sound files in this directory with the exact filenames listed above
2. Refresh the game - sounds will be automatically detected and used
3. Test by starting a timer or advancing phases

## Volume Control

Sound volume is controlled in the code:

- Timer alerts: 70% volume
- Phase transitions: 60% volume
- Generated tones: 30-50% volume

## Examples

You can find Game of Thrones themed sound effects from:

- Official HBO soundtracks
- Creative Commons fantasy sounds
- Generated medieval/fantasy themes
- Custom recordings

Remember to respect copyright when using audio files!
