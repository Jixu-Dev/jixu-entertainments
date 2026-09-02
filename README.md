<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=Jixu%20Entertainments&fontSize=45&fontAlignY=35&fontColor=FFFFFF&desc=Next-Gen%20Verified%20Streaming%20Index%20for%20Movies%2C%20Anime%20%26%20Live%20TV&descAlignY=55&descSize=16&animation=twinkling" width="100%"/>

[![Next.js](https://img.shields.io/badge/Next.js-15.0-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[**Live Demo**](https://github.com/Jixu-Dev/jixu-entertainments) · [**Submit Platform**](https://github.com/Jixu-Dev/jixu-entertainments/issues) · [**Documentation**](#-key-features) · [**Contributing**](#-community-contributions)

</div>

---

## 🎬 Overview

**Jixu Entertainments** is a community-driven, open-source streaming aggregator and verified index for **movies, TV series, anime, manga, sports, and live television**. Built with **Next.js 15 App Router**, **React 19**, and a high-performance porcelain design system, it delivers a fast, ad-free, and tracker-free gateway to high-quality streaming platforms.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🎭 **Curated Streaming Directory** | 100+ verified streaming portals across Movies, Anime, Manga, Live TV & Sports |
| 🎬 **Rotating Spotlight Hero** | Full-bleed cinematic backdrop with automated 5-minute platform rotation |
| 🤖 **AI Morphing Navigation** | Dissolves into header at top, contracts into floating pill on scroll |
| ⌨️ **Command Palette** | `⌘K` / `Ctrl+K` for instant fuzzy-filtered search across all platforms |
| 🌍 **Multi-Region Catalogs** | Localized portals for USA, UK, India, Germany, France, Japan, Brazil, Russia |
| 🔒 **Built-in Security** | Zero trackers, zero popups, direct mirror links with domain health checks |
| 👑 **Admin Console** | GitHub OAuth RBAC for managing links, submissions, and domain mirrors |

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technologies |
|:---:|:---:|
| **Framework** | <img src="https://skillicons.dev/icons?i=nextjs&theme=dark" height="30"/> Next.js 15 (App Router) |
| **UI Library** | <img src="https://skillicons.dev/icons?i=react&theme=dark" height="30"/> React 19 |
| **Language** | <img src="https://skillicons.dev/icons?i=ts&theme=dark" height="30"/> TypeScript 5 |
| **Styling** | <img src="https://skillicons.dev/icons?i=tailwind&theme=dark" height="30"/> Tailwind CSS 3.4 |
| **Auth** | GitHub OAuth (RBAC) |
| **Database** | SQLite (local adapter) |
| **Container** | <img src="https://skillicons.dev/icons?i=docker&theme=dark" height="30"/> Docker |

</div>

---

## 🚀 Quickstart

### Prerequisites
- **Node.js** v18.17.0+
- **npm** / **pnpm** / **yarn**

```bash
# Clone the repository
git clone https://github.com/Jixu-Dev/jixu-entertainments.git
cd jixu-entertainments

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Fill in your GitHub OAuth and session secrets

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
jixu-entertainments/
├── public/
│   ├── logo/                # Streaming platform logos
│   └── Region-Links/        # Regional catalog datasets (JSON)
├── src/
│   ├── app/                 # Next.js App Router pages & API
│   │   ├── admin-panel/     # Secure Admin Dashboard
│   │   ├── request/         # Community submission form
│   │   ├── dmca/            # DMCA & Content Policy
│   │   └── about/           # Brand & architecture overview
│   ├── components/
│   │   ├── stage/           # Spotlight Bento, Studio Stage
│   │   ├── site-card.tsx    # Cinematic cards with ambient glow
│   │   ├── brand-logo.tsx   # Custom vector monogram
│   │   └── navbar.tsx       # AI morphing navigation
│   └── lib/                 # Auth, DB adapter, GitHub client
└── package.json
```

---

## 🤝 Community Contributions

1. **Submit New Platforms** — Use the `/request` form or open a PR to `public/Region-Links/`
2. **Report Dead Links** — Create an [Issue](https://github.com/Jixu-Dev/jixu-entertainments/issues)
3. **UI & Feature PRs** — Fork → branch → Pull Request

---

## 🔒 Security & Safe Usage

- All API keys and OAuth secrets are excluded via `.gitignore`
- This project is an educational curated directory — it does not host copyrighted content

---

## 📄 License

Licensed under the [MIT License](LICENSE).

---

<div align="center">

**Built with 🎬 by [Rohit Gowda](https://github.com/Jixu-Dev)**

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer&animation=twinkling" width="100%"/>

</div>
