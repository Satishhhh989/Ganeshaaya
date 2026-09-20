# VINAYAK: The First Prayer

An interactive 3D web experience exploring the mythology and cultural significance of Lord Ganesha through cinematic storytelling, real-time 3D exploration, devotional audio, and mini-games.

Developed with care by Satish (https://github.com/Satishhhh989).

---

## Overview

VINAYAK: The First Prayer blends modern web graphics with sacred cultural heritage. Players experience:
- An atmospheric home environment set during Ganesh Chaturthi preparations.
- Story conversations between young Vinay and his grandfather (Ajja).
- Real-time 3D mythological chapters depicting Mount Kailash, the divine birth of Ganesha, the cosmic confrontation, the forest search for the sacred elephant, and the restoration ceremony.
- An interactive community Pandal construction sequence.
- A collection of ten responsive cultural mini-games in the Vinayaka Arcade.

---

## Key Features

### 1. Interactive 3D World
- Built on Three.js and React Three Fiber.
- Procedural and GLTF/FBX animated character systems.
- Dynamic third-person camera controls, cinematic orbital cameras, and custom recoil controllers.
- Responsive design supporting keyboard/mouse on desktop and touch joystick controls on mobile landscape.

### 2. Devotional Audio Architecture
- Custom Web Audio API synthesizer for Indian Tanpura drone, temple bells, and footsteps.
- Multi-track voice narration system mapped to story beats and character dialogues.
- Layered environmental audio and celebratory soundscapes.

### 3. Chapter Structure
- **Chapter 1: The Living Room**: Vinay explores the family home, interacts with sacred items (Diya, clay murti, rangoli), and listens to Ajja's narration.
- **Chapter 2: The Portal at Kailash**: The divine creation of Ganesha by Goddess Parvati and Ganesha guarding the sacred threshold.
- **Chapter 3: The Cosmic Clash**: Confrontation with Lord Shiva and the mystical Trishul sequence.
- **Chapter 4: The Himalayan Forest Search**: Tracking footprints and broken cedar branches through a sunlit grove to commune with Sri Gajaraj.
- **Chapter 5: The Divine Awakening**: The restoration of Ganesha with the elephant head and the Prathama Pujya blessing.
- **Chapter 6: The Community Pandal**: Return to present day, building the festival pandal, evening aarti, and celebration.
- **Chapter 7: Game Arcade**: Ten playable mini-games including Modak Catch, Mushak Dash, Rangoli Memory, Dhol Rhythm, Eco Murti, and Visarjan Journey.

---

## Technology Stack

- **Framework**: React 19, TypeScript
- **3D Graphics**: Three.js, @react-three/fiber, @react-three/drei
- **Audio**: Web Audio API, HTML5 Audio
- **Bundler & Tooling**: Vite, TypeScript
- **Styling**: Pure modern CSS with cinematic typography (Cinzel, Marcellus, Outfit)

---

## Project Structure

```
├── public/
│   └── assets/
│       ├── audio/          # Voiceovers, dialogue tracks, and background audio
│       ├── characters/     # Optimized 3D character models (GLB, FBX)
│       ├── environments/   # 3D environment assets
│       ├── props/          # Sacred textures and prop imagery
│       └── story/          # Cinematic story illustrations
├── src/
│   ├── game/
│   │   ├── arcade/         # Arcade system and 10 mini-games
│   │   ├── audio/          # Audio engine and scene audio mapping
│   │   ├── characters/     # 3D character controllers and rigs
│   │   ├── core/           # GameEngine, GameState, asset configs
│   │   ├── dialogue/       # Dialogue script data
│   │   ├── interaction/    # Proximity interaction system
│   │   ├── player/         # Player movement physics and controllers
│   │   ├── scenes/         # Present home, Kailash, Forest, and Pandal scenes
│   │   ├── story/          # Story canvases and visual particle effects
│   │   └── ui/             # Main menu, HUD, dialogue boxes, mobile controls
│   ├── App.tsx             # Root application component
│   └── main.tsx            # Application entry point
├── index.html              # HTML shell
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/Satishhhh989/Ganeshaaya.git
cd Ganeshaaya
npm install
```

### Running Locally
Start the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

### Building for Production
Create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## Controls

### Desktop
- **W, A, S, D** or **Arrow Keys**: Move character
- **Shift**: Sprint / Run
- **Mouse Drag**: Rotate camera / Look around
- **E** or **Space**: Interact / Examine clues / Commune / Advance dialogue
- **Escape**: Close modals / Return to menu

### Mobile (Landscape)
- **Left Virtual Joystick**: Move character
- **Right Screen Area**: Drag to rotate camera
- **Action Buttons**: Contextual Interact / Examine / Throw buttons

---

## Credits

- **Creator & Lead Developer**: Satish (https://github.com/Satishhhh989)
- **Project Team**: Satish, Deval Gowda, Bhuvan Prasad
- **Dedication**: Built for the NIAT National Competition and dedicated to the spirit of Indian heritage and cultural storytelling.
