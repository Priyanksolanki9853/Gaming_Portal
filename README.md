# 🎮 Immersive Gaming Portal Portfolio

<img width="1915" height="1064" alt="Screenshot 2025-12-12 021839" src="https://github.com/user-attachments/assets/f85ba35b-740b-40a3-97cb-04d2b99da740" />

> A high-performance, cyberpunk-themed Single Page Application (SPA) showcasing game development projects. Features a persistent state system, integrated arcade games, and a cloud-based global leaderboard.

<div align="center">

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

[**🔴 LIVE DEMO**](https://priyanksolanki9853.github.io/Gaming_Portal.github.io/#)
</div>

---

## ✨ Key Features

### 🎨 **UI/UX Experience**
* **Glassmorphism & Neon Aesthetic:** Modern UI with backdrop filters and dynamic lighting.
* **3D Holographic Tilt:** Game cards rotate in 3D space based on mouse position.
* **Particle Network Background:** Interactive HTML5 Canvas animation.
* **CRT Retro Mode:** Toggleable scanlines and screen curvature for 90s nostalgia.
* **Glitch Effects:** Cyberpunk text distortion on hover interactions.
* **Dynamic Audio Engine:** Synthesized SFX for clicks, hovers, and typing (Web Audio API).

### ⚙️ **Functionality**
* **Single Page Application (SPA):** Smooth section transitions without page reloads.
* **Persistence System:** Saves user preferences (Theme, Sound, Retro Mode) and High Scores to LocalStorage.
* **Integrated Arcade:** Fully playable "Neon Snake" game embedded directly in the portal.
* **Global Leaderboard:** Real-time high score tracking powered by **Supabase** (PostgreSQL).
* **Easter Eggs:** Konami Code (`↑ ↑ ↓ ↓ ← → ← → B A`) support to unlock "God Mode".

---

## 🕹️ The Arcade & Leaderboard

The portal features a custom-built **Snake Game** running on the HTML5 Canvas.
* **Engine:** Pure JavaScript (No game engine overhead).
* **Backend:** Connected to **Supabase** via REST API.
* **Logic:** Scores are submitted automatically upon Game Over and ranked globally.

---

## 🚀 Installation & Setup

If you want to run this project locally or fork it:

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    ```
2.  **Open the folder**
    Navigate to the project directory.
3.  **Launch**
    Open `index.html` in any modern browser.

*(Note: No Node.js or NPM installation required. This is a vanilla implementation for maximum performance.)*

---

## 🗄️ Database Setup (Supabase)

The project uses Supabase for the leaderboard. If you fork this repo, set up your own database:

1.  Create a project at [Supabase.com](https://supabase.com).
2.  Create a table named `scores` with columns:
    * `id` (int8, primary key)
    * `created_at` (timestamptz)
    * `player_name` (text)
    * `score` (int8)
3.  Disable **Row Level Security (RLS)** or add a policy to allow public inserts.
4.  Update the `SUPABASE_URL` and `SUPABASE_KEY` in `index.html` (Script section).

---

## 🕵️ Secrets

There are hidden interactions within the portal.
* **God Mode:** Try entering the famous Konami Code.
* **Deep Diver:** Scroll to the very bottom to unlock an achievement.
* **Time Traveler:** Activate the CRT TV mode in the header.

---

## 📬 Contact

**Priyank Solanki** - Indie Game Developer

* [**Itch.io Profile**](https://priyank-solanki.itch.io/)
* [**GitHub**](https://github.com/Priyanksolanki9853)
* [**Email**](mailto:priyank9853@gmail.com)

---

<div align="center">
  <sub>Built with 💻 & ☕ by Priyank Solanki. © 2025 All Rights Reserved.</sub>
</div>
