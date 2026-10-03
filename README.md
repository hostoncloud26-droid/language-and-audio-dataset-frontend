# 🎙️ Language & Audio Dataset Platform - Frontend

Modern, high-performance React + TypeScript web application for managing multi-lingual datasets, recording and previewing audio, uploading speech files, and streaming data from remote file servers.

---

## 🚀 Key Features

- **📊 Comprehensive Dataset Dashboard**: Filter by language, search by sentence, paginate dataset entries with real-time statistics.
- **🎙️ Studio Audio Recorder**: In-browser audio recording with live waveform visualizer, pause/resume, audio trimming, and quality settings.
- **☁️ Remote Storage Integration**: Instant playback and direct audio upload to remote Chibisafe file servers.
- **🔐 Secure Authentication**: JWT session handling, role-based controls, and user profiles.
- **🎨 Glassmorphic Modern UI**: Built with Lucide React icons, Tailwind-free flexible Vanilla CSS styling, responsive layout, dark theme accents, and micro-interactions.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 6](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS modern design system

---

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── CollectData/    # Audio recorder, text area, audio preview cards
│   │   ├── ExploreDataset/ # Table view, filters, search, audio players
│   │   └── Layout/         # Header, Navigation, Footer
│   ├── context/            # React context providers (Auth, Language, Data)
│   ├── services/           # Backend API integration (FastAPI client)
│   ├── types/              # TypeScript interface definitions
│   ├── App.tsx             # Root component and tab navigation
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global design system and themes
├── index.html              # HTML entry point
├── package.json            # Project manifest and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── .env.example            # Environment variables template
└── .gitignore              # Git ignore rules
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0.0 or higher recommended)
- `npm` (bundled with Node.js) or `pnpm` / `yarn`

### 2. Installation
Navigate into the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` to point to your FastAPI backend:
```env
# Backend API endpoints
VITE_API_URL=http://localhost:8000/api
VITE_BACKEND_URL=http://localhost:8000
```

### 4. Running the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173` to view the application.

### 5. Building for Production
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory.

---

## 🐙 Push to GitHub as a Separate Repository

To publish this frontend as its own independent GitHub repository:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Initialize a new Git repository
git init

# 3. Stage and commit files
git add .
git commit -m "feat: initial frontend commit for Language & Audio Dataset Platform"

# 4. Set default branch to main
git branch -M main

# 5. Connect to your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_FRONTEND_REPO_NAME>.git

# 6. Push to GitHub
git push -u origin main
```
