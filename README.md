<h1 align="center">BuildCon — Animated 3D Construction Website</h1>
<br>
<p align="center">
  <img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js">
  <img src="https://img.shields.io/badge/gsap-88CE02?style=for-the-badge&logo=greensock&logoColor=black" alt="GSAP">
  <img src="https://img.shields.io/badge/vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/css3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
</p>
<br>

🏗️ A scroll-driven, 3D-animated website for a construction company serving **Coimbatore** and **Erode**.

As you scroll, a house is built in real time — from an empty plot to foundation, frame, walls and roof — then the sun sets, the front door opens and the camera walks you inside the finished home.

   🏠 **Three.js** renders the house, crane, landscape and furnished interior in real time

   🎬 **GSAP + ScrollTrigger** tie every construction stage and camera move to the scroll position

   🧈 **Lenis** provides buttery smooth scrolling across the whole page

   ⚡ **Vite** for instant dev server and optimised production builds

> **Note:** "Kongu Buildcon" and all addresses, phone numbers, projects, testimonials and rates are **placeholder demo content**.

## Features

- **3D scroll story** — plot → foundation → RCC frame → walls & glazing → roof & landscaping → dusk → walk inside
- Working tower crane, swaying coconut palms and Western Ghats backdrop
- Interior hotspots (marble flooring, modular kitchen, floating staircase, lighting)
- Animated preloader with blueprint drawing and counter
- Count-up stats, image clip reveals, split-word headline animations
- Horizontal-scroll services section
- Process timeline that fills as you scroll
- Project grid filterable by **Coimbatore / Erode** with 3D hover tilt
- Live **construction cost estimator** (city, package, built-up area → ₹ estimate and timeline)
- Animated office map with route between Coimbatore and Erode
- Testimonial slider, contact form with validation, WhatsApp link
- Custom cursor and magnetic buttons on desktop
- Fully responsive with a mobile menu, respects `prefers-reduced-motion`, WebGL fallback

## Installation

### Step 1: Clone the Repository

**Option A: Using VS Code Terminal**
1. Open Visual Studio Code
2. Open a new terminal (Terminal → New Terminal or ``Ctrl+Shift+` ``)
3. Navigate to your desired directory:
   ```bash
   cd path/to/your/desired/folder
   ```
4. Clone the repository:
   ```bash
   git clone https://github.com/route-34-com/BuildCon.git
   ```
5. Open the project folder:
   ```bash
   cd BuildCon
   ```
6. Open the project in VS Code:
   ```bash
   code .
   ```

**Option B: Using VS Code Git Integration**
1. Open Visual Studio Code
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Type "Git: Clone" and select it
4. Paste the repository URL: `https://github.com/route-34-com/BuildCon.git`
5. Choose a folder location and click "Select Repository Location"
6. Click "Open" when prompted

### Step 2: Install Node.js

1. Visit [Node.js Download Page](https://nodejs.org/)
2. Download the **LTS** version (v18 or newer) for your operating system
3. Run the installer
4. Verify the installation by opening a terminal and typing:
   ```bash
   node -v
   npm -v
   ```
   If Node.js is properly installed, you should see version numbers displayed.

### Step 3: Install Dependencies

In the project folder, run:

```bash
npm install
```

This installs Vite, Three.js, GSAP and Lenis into `node_modules/`.

## Usage

### Running the Development Server

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`) and **start scrolling!** The page will:
- Build the house stage by stage as you scroll
- Transition to dusk and light up the windows
- Open the front door and walk you through the interior

### Building for Production

```bash
npm run build
```

The optimised site is output to the `dist/` folder, ready to deploy on any static host (Netlify, Vercel, GitHub Pages, cPanel, etc.).

### Previewing the Production Build

```bash
npm run preview
```

## Customizing the Site

| What to change | Where |
|---|---|
| Company name, addresses, phone numbers, projects, testimonials | `index.html` |
| Cost estimator rates (₹/sq.ft) and city multipliers | `data-value` attributes in the `#estimate` section of `index.html` |
| 3D house geometry, materials, colours | `src/house.js` → `buildHouse()`, `buildInterior()`, `makeMaterials()` |
| Construction stage timing and camera path | `src/house.js` → `buildTimeline()` |
| Page animations (reveals, counters, sliders, map) | `src/main.js` |
| Colours, fonts, layout | CSS variables at the top of `src/style.css` |

## Troubleshooting

- **Blank 3D section** — your browser or GPU may have WebGL disabled; a fallback image is shown instead. Try the latest Chrome, Edge or Firefox.
- **`npm` not recognised** — Node.js is not installed or not on your PATH; reinstall it and restart the terminal.
- **Port already in use** — run `npm run dev -- --port 5180` to use a different port.
- **Images not loading** — project photos are served from Unsplash; check your internet connection.
- **Choppy animation** — close other GPU-heavy tabs; the scene automatically lowers resolution on mobile.

## Project Structure

```
BuildCon/
├── index.html               # Page markup and all site content
├── package.json             # Scripts and dependencies
├── public/
│   └── favicon.svg          # Site icon
├── src/
│   ├── main.js              # Smooth scroll, section animations, estimator, form
│   ├── house.js             # Three.js 3D house scene and scroll timeline
│   └── style.css            # All styles and responsive layout
├── README.md                # This documentation
└── node_modules/            # Dependencies (created by npm install)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run build`
5. Submit a pull request

In case of any queries, please leave a message or contact me via the email provided in my profile.

<p align="center">
⭐ <strong>Star this repository if you found it helpful!</strong>
</p>
