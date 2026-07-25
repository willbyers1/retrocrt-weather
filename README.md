<div align="center">

# 📺 RetroCRT-Weather

</div>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/OGL-WebGL-FF6B35?style=for-the-badge&logo=webgl&logoColor=white" alt="OGL" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge" alt="PRs Welcome" />
</p>

> Real-time atmospheric telemetry delivered through a nostalgic, phosphor-tinted retro CRT terminal interface.

---

## 📋 Features

- 📟 **Authentic CRT Simulation**: Custom GLSL & CSS scanlines, screen curvature vignette, screen flicker, chromatic aberration, static noise, and typewriter boot sequence.
- 🌌 **Ambient WebGL Plasma Background**: Integrated React Bits `<Plasma />` WebGL canvas rendering smooth electron glow synchronized directly with the screen phosphor palette.
- 🔘 **Specular UI Action Buttons**: Custom React Bits `<SpecularButton />` interactive elements styled with dynamic edge lighting and terminal command aesthetic.
- 🎨 **Dynamic Phosphor Color Palette**: Hot-swap phosphor visual themes across Amber (`#ffb000`), Green (`#33ff33`), and Blue-White (`#a0d8ff`), propagating live color syncing across all UI controls and WebGL shaders.
- 🔐 **BYOK (Bring Your Own Key) Security**: Zero server dependencies; your OpenWeatherMap API key stays securely inside client-side local storage.
- 🗠 **ASCII Forecast & Data Rendering**: Weather metrics, temperature toggles, geolocation support, and 5-day forecasts displayed via customized ASCII frame tables and monochrome glyphs.
- ♿ **Accessible & Motion-Aware**: Native support for `prefers-reduced-motion` to freeze heavy animation effects while keeping dynamic text regions readable with screen-reader live updates.

---

## 🛠️ Tech Stack

- [React](https://react.dev/) — Declarative UI Component Framework
- [TypeScript](https://www.typescriptlang.org/) — Type-Safe Application Logic
- [Vite](https://vitejs.dev/) — Next-Generation Front-End Tooling
- [OGL](https://github.com/oframe/ogl) — Minimalist WebGL Library for Custom Shaders
- [OpenWeatherMap API](https://openweathermap.org/api) — Live Meteorological Data Stream

---

## 📁 Project Structure

```
RetroCRT-Weather/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── style.css
    ├── types.ts
    ├── weather-service.ts
    └── components/
        ├── CrtOverlay.tsx
        ├── WeatherTerminal.tsx
        ├── Plasma/
        │   ├── Plasma.css
        │   └── Plasma.jsx
        └── SpecularButton/
            ├── SpecularButton.css
            └── SpecularButton.jsx
```

---

## 🚀 Quick Start & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/username/RetroCRT-Weather.git
   cd RetroCRT-Weather
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Launch local development server**
   ```bash
   npm run dev
   ```

---

## 🔑 API Key & Configuration

This application uses a **Bring Your Own Key (BYOK)** client-side model:

1. Obtain a free API Key from [OpenWeatherMap](https://home.openweathermap.org/users/sign_up).
2. Launch `RetroCRT-Weather` in your web browser.
3. On initial boot, enter your OpenWeatherMap API key into the terminal prompt.
4. To erase or replace the key at any time, click the `CLEAR_KEY` specular terminal button.

> **Security Note:** Your API key is stored strictly within your browser's `localStorage` and sent directly to OpenWeatherMap via HTTPS endpoints. No third-party proxy or remote logging server is used.

---

## ⚙️ How It Works

1. **Power On**: Upon opening the application, the CRT terminal triggers an automated CRT cathode expansion power-on animation alongside typewriter diagnostic boot logs.
2. **Key Validation**: The terminal verifies client-side `localStorage`. If no key exists, it pauses execution and presents the `API KEY REQUIRED` input buffer.
3. **Command Processing**: Search for a target city via the `SEARCH CITY>` prompt or request automated coordinates using the `GEO_LOCATE` action button.
4. **Theme Synchronization**: Toggle between Amber, Green, or Blue-White modes. The state instantly updates CSS variables (`--crt-fg`, `--crt-glow`), passes new RGB arrays to the `<Plasma />` WebGL uniforms, and adjusts `<SpecularButton />` rim highlights.

---

## 📦 Building for Production

To construct an optimized, static client build for deployment on Vercel, Netlify, or GitHub Pages:

```bash
npm run build
```

Preview the generated production build locally:

```bash
npm run preview
```

---

## 📄 License

Distributed under the **MIT** License. See `LICENSE` for more information.

---

<div align="center">

**Created By Mert Batu BULBUL**
* 🎓 AI Engineering & Full Stack Developer * 💻 React *

**Don't forget to star ⭐ this repo if you found it useful!**

</div>

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues) if you want to contribute.