# Tetris Game - Agent Instructions

## Running the Project

- **No build step required** - Open `index.html` directly in a browser
- No test/lint/typecheck configured (vanilla project)

## Architecture

- **Single HTML/CSS/JS files**: `index.html`, `styles.css`, `script.js`
- **Rendering**: HTML5 Canvas API (not DOM-based)
- **Game loop**: `requestAnimationFrame` at 60 FPS, game logic timing decoupled from rendering
- **Audio**: Web Audio API with procedurally generated sounds (no external audio files)

## Key Implementation Details

- **7-bag randomizer** for fair tetromino distribution
- **SRS (Super Rotation System)** wall kicks for piece rotation
- **Lock delay** (500ms) before piece locks
- **Ghost piece** showing landing position
- **Hold piece** (once per drop)
- **Combo system** for consecutive line clears

## Audio System (in `script.js`)

The `AudioManager` class handles all music and sound effects using Web Audio API:
- **Music**: MP3 file (`forever-bound_stereo-madness.mp3`) loaded via fetch, decoded, and played as a looping `AudioBufferSourceNode`
- **Sound effects**: Procedural using `audioContext.createOscillator()` for square wave tones
- Reverb is created via `createConvolver()` with a generated impulse response

## Controls

| Key | Action |
|-----|--------|
| ← → | Move |
| ↓ | Soft drop |
| ↑ | Rotate CW |
| Z | Rotate CCW |
| Space | Hard drop |
| C | Hold |
| M | Toggle music |
| P | Pause |
| R | Restart |
