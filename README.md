# 🇩🇰 Danish City Map Guesser

A minimalist city guessing game built with **Angular** and **MapLibre
GL**.

Identify Danish cities using an abstract, label-free map showing only
roads and water. Adjust the population threshold to control difficulty
and aim for the longest streak.

---

## 🎯 Gameplay

1.  Set a **minimum population** using the slider
2.  A random Danish city above the threshold is selected
3.  A **highly minimal vector map** is shown (no labels, no landmarks)
4.  Type the city name and submit your guess
5.  Correct guess → streak increases\
    Wrong guess → streak resets and the correct answer is revealed

---

## 🧠 Design Philosophy

- Vector tiles only (no raster maps)
- Roads & water as the sole visual clues
- Strong contrast (black on white)
- Fixed zoom and locked interactions for fairness
- No backend required

---

## 🛠 Tech Stack

- Angular
- MapLibre GL JS
- OpenMapTiles vector data
- TypeScript
- Static JSON city dataset

---

## 📁 Project Structure

    src/
    ├── app/
    │   ├── components/
    │   │   ├── map/
    │   │   ├── controls/
    │   │   └── game/
    │   ├── models/
    │   │   └── city.model.ts
    │   ├── services/
    │   │   └── game.service.ts
    │   └── app.component.*
    ├── assets/
    │   ├── data/
    │   │   └── cities.dk.json
    │   └── styles/
    │       ├── easy.json
    │       ├── medium.json
    │       ├── hard.json
    │       └── extreme.json
    └── styles.css

---

## 🗺 Map Rendering

- Vector tiles via MapLibre GL
- Custom style files control difficulty
- No labels, POIs, buildings, or landuse
- Locked interaction (no pan, zoom, rotate)

---

## 📊 City Dataset Format

```json
{
  "name": "Aalborg",
  "population": 119000,
  "lat": 57.0488,
  "lon": 9.9217
}
```

---

## 🚀 Getting Started

### Install dependencies

```bash
npm install
```

### Run locally

```bash
ng serve
```

Open:

    http://localhost:4200

---

## 🎮 Difficulty Modes

- Easy -- all roads + water
- Medium -- major roads + water
- Hard -- primary roads only
- Extreme -- water only

---

## 💡 Future Ideas

- Daily challenge mode
- Animated city transitions
- Municipality boundary mode
- Global leaderboard
- Shareable streak links

---
