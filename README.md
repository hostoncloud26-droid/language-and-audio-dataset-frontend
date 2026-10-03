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

