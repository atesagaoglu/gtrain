# GTrain 🎸

A highly customizable, professional-grade guitar fretboard trainer built with React and Vite. Master the guitar neck, one note at a time.

## Features

- **Interactive Fretboard:** Click any position on the neck to hear the real acoustic/electric pitch and see the note name.
- **Multiple Training Modes:** 
  - **Learning Mode:** Freely explore the fretboard.
  - **Find the Note:** Find all positions for a specific note on a given string.
  - **Guess the Note:** Identify the correct note at a randomly highlighted fret position.
- **Customizable UI:** Toggle accidental preferences (Sharps, Flats, or Both) and fret numbers.
- **Real Audio Engine:** Uses `smplr` to play real acoustic nylon, acoustic steel, and electric guitar soundfonts, complete with customizable distortion.
- **Deep Customization:** 
  - Build your own custom alternate tunings, or pick from presets like Drop D.
  - Choose between Rosewood, Maple, or Ebony fretboard skins.
  - Change the number of frets (12, 15, 21, 22, 24).
- **Persistent Settings:** All your tweaks and tunings are saved automatically to your browser.

---

## Getting Started

You can run this project locally on your machine in just a few steps.

### Prerequisites (For non-Nix users)
If you don't use Nix, you just need to have **Node.js** installed on your system.
- Download and install Node.js (version 18+ recommended): [https://nodejs.org/](https://nodejs.org/)

### 1. Install Dependencies
Open your terminal, navigate to the project folder, and run:
```bash
npm install
```

### 2. Start the Development Server
Once the dependencies are installed, start the app with:
```bash
npm run dev
```
Open your browser and navigate to the URL shown in your terminal (usually `http://localhost:5173`).

---

## Building for Production

To create an optimized production build, run:
```bash
npm run build
```
This will generate a `dist` folder containing the minified static assets ready for deployment.

---

### (Optional) For Nix Users
If you use the Nix package manager, this project includes a `flake.nix` and `.envrc`. 
Simply run `nix develop` (or allow `direnv`) to automatically drop into an isolated shell with the exact required Node version pre-installed. Then run `npm install` and `npm run dev` as usual.
