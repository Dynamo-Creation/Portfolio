# 🚀 Sonu Choudhary — Ultimate Dynamic 3D Portfolio & No-Code Admin CMS

> **Zero-Build, Pure Modern Web Architecture with Supabase Cloud Realtime Database, 3D Particle Physics, WhatsApp Smart Automation & Full No-Code Admin CMS.**

---

## 📋 Table of Contents
1. [⚡ Quick Overview](#-quick-overview)
2. [👤 User Identity & Persona](#-user-identity--persona)
3. [🏗️ System Architecture & Data Flow](#️-system-architecture--data-flow)
4. [⚡ Supabase Cloud Database Setup (3 Minutes)](#-supabase-cloud-database-setup-3-minutes)
5. [🌐 1-Click Free Hosting Deployment (GitHub Pages)](#-1-click-free-hosting-deployment-github-pages)
6. [🛠️ No-Code Admin CMS Manual & Security](#️-no-code-admin-cms-manual--security)
7. [📂 File Structure](#-file-structure)

---

## ⚡ Quick Overview

This project is a high-performance, responsive, luxury 3D portfolio and CMS ecosystem created for **Sonu Choudhary**. Built with zero build tools or complex frameworks (HTML5, Modern CSS3 with CSS Custom Properties, Vanilla JavaScript ES6+), it runs directly out-of-the-box in any browser and on free static hosts like GitHub Pages, Vercel, Netlify, or Cloudflare Pages.

### ✨ Key Features:
- **0–100% Radial Preloader**: Smooth circular percentage progress and cinematic brand reveal.
- **Interactive 3D Background Canvas**: Mouse/touch reactive particle physics with dynamic constellation lines.
- **Bespoke Domain Showcase Hero**: Tailored interactive switcher for Sonu's 5 domains (3D/VFX Showreel HUD, UI/UX Figma Mockup, Web Dev Live Terminal, Graphics Art Gallery).
- **Dynamic Category & Subcategory Filter**: Instant filtering across categories and dynamic subcategory pills with search bar.
- **Multi-Media Lightbox**: High-res multi-image zoom carousel and embedded video player (YouTube/Vimeo/MP4).
- **WhatsApp Smart Automation Bot**: Interactive project estimator calculating quotes and formatting one-click WhatsApp inquiries.
- **Full No-Code Admin CMS (`admin.html`)**:
  - Dual Authentication (Offline Salted SHA-256 Master Security PIN + Supabase Cloud Email/Password).
  - Anti-Brute-Force Rate Limiting Shield (5-attempt lockout defense).
  - 8+ CRUD Management Modules (Profile, Projects, Services, Skills, Experience, Reviews, Inquiries, Theme Studio).
  - Built-in HTML5 Canvas Image Compressor (< 150KB WebP optimization).
  - 1-Click JSON Backup (`data.json`) and Instant Restore.

---

## 👤 User Identity & Persona

```yaml
Name                 : Sonu Choudhary
Primary Contact      : +91 8620028817 / +91 8584866240
WhatsApp Hotline     : +91 8584866240
Email Address        : Sonu25580@gmail.com
Location             : Kolkata & Remote Worldwide
Domains of Mastery   : 3D Motion & VFX | UI/UX & Product Design | Graphics & Brand Identity | Web Development | Video Editing
```

---

## 🏗️ System Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                      SONU CHOUDHARY PORTFOLIO ECOSYSTEM                │
├──────────────────────────┬──────────────────────────┬──────────────────┤
│    index.html (Client)   │     admin.html (CMS)     │  Supabase Cloud  │
├──────────────────────────┼──────────────────────────┼──────────────────┤
│ • 0-100% Preloader       │ • Dual Auth (PIN & Email)│ • PostgreSQL DB  │
│ • 3D Particle Canvas     │ • Realtime Status HUD    │ • Realtime Sync  │
│ • Multi-Domain Hero      │ • Projects/Services CRUD │ • Media Storage  │
│ • Category/Pill Filters  │ • Inquiries CRM Hub      │ • Row Security   │
│ • Media Lightbox         │ • Theme Studio           │                  │
│ • WhatsApp Bot Form      │ • In-Browser Compressor  │                  │
│ • Mobile 5-Dock Bar      │ • 1-Click JSON Backup    │                  │
└──────────────────────────┴──────────────────────────┴──────────────────┘
```

---

## ⚡ Supabase Cloud Database Setup (3 Minutes)

### Step 1: Create a Free Project
1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **"New Project"**, name it `sonu-portfolio-db`, set a database password, and pick a region (e.g. `Singapore` or `Mumbai`).

### Step 2: Execute the Database Schema Script
1. In the Supabase dashboard, click **"SQL Editor"** (⚡ terminal icon on the left menu).
2. Click **"New Query"**.
3. Open `supabase_schema.sql` from this repository, copy the entire SQL script, and paste it into the query editor.
4. Click the green **"Run"** button. All tables, RLS policies, realtime publications, and storage buckets will be configured instantly!

### Step 3: Connect API Keys
1. In Supabase, go to **Project Settings (⚙️)** -> **API**.
2. Copy the **Project URL** and the **`anon` / `public` API Key**.
3. Open your portfolio's Admin CMS (`admin.html`), navigate to the **"Supabase & Backup"** tab, paste the URL and Key, and click **"Save & Connect"**.

---

## 🌐 1-Click Free Hosting Deployment (GitHub Pages)

### Option A: Drag & Drop via Web Browser
1. Go to [github.com](https://github.com) and create a new public repository named `portfolio`.
2. Click **"uploading an existing file"**.
3. Drag and drop all files (`index.html`, `admin.html`, `data.json`, `supabase_schema.sql`, `css/`, `js/`, `README.md`).
4. Click **"Commit changes"**.
5. In your repository, go to **Settings** -> **Pages** -> Select **Branch: `main`** and **Folder: `/ (root)`** -> Click **Save**.
6. Your live site will be ready at: `https://<your-username>.github.io/portfolio/`

### Option B: Terminal Git CLI
```bash
git init
git add .
git commit -m "Launch Sonu Choudhary 3D Portfolio & No-Code CMS"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## 🛠️ No-Code Admin CMS Manual & Security

- **Admin URL**: Open `admin.html` in any browser or visit `https://<your-domain>/admin.html`.
- **Master Security PIN**: Protected by Web Crypto API salted SHA-256 cryptographic hashing. On first launch, you are prompted to configure your private 4–8 digit PIN. Can be updated anytime in the **Theme & Security** tab.
- **Anti-Brute-Force Shield**: Enforces an attempt limit (5 attempts) with exponential lockouts to block automated guessing attacks.
- **Dual Login Support**: Log in with either your Master Security PIN or your Supabase Cloud credentials.
- **Offline Resilience**: If Supabase is offline or not configured, the site runs seamlessly using `data.json` and browser `localStorage`.
- **1-Click Backup**: Under **"Supabase & Backup"**, click **"1-Click Download JSON Backup"** to export an instant snapshot.

---

## 📂 File Structure

```
f:/portfolio/
├── index.html               # Client-facing dynamic 3D portfolio
├── admin.html               # Full No-Code Admin CMS Dashboard
├── supabase_schema.sql      # Supabase PostgreSQL schema with RLS & Realtime
├── data.json                # Offline & Seed JSON database with rich demo data
├── css/
│   ├── style.css            # Portfolio styles (Glassmorphism, 3D cards, themes, animations)
│   └── admin.css            # Admin HUD styles (Dark HUD, tabs, forms, modals, tables)
├── js/
│   ├── supabase-config.js   # Supabase client setup & connection state manager
│   ├── data-store.js        # 3-tier data layer (Supabase Cloud <-> LocalStorage <-> data.json)
│   ├── canvas-bg.js         # Interactive 3D constellation & particle physics engine
│   ├── app.js               # Portfolio UI logic (Preloader, Hero, Filters, Lightbox, WhatsApp Bot)
│   └── admin.js             # Admin CMS logic (Dual Auth, CRUD, Image Compressor, Backup/Restore)
└── README.md                # Complete documentation & deployment guide
```

---
*Crafted for Sonu Choudhary — Creative Technologist & Visual Director.*
