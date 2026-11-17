# XTREME AI — Google Gemini Model Web Replica

A web replica of Google Gemini (Gemini 2.0 Flash, 1.5 Pro, and Ultra Deep Think) built with React, Vite, KaTeX, and modern CSS.

## 🌟 Key Features

1. **Custom XTREME Geometric Logo & Modern UI**:
   - Distinctive futuristic **"X"** geometric emblem with dual cybernetic diagonal neon blades (Electric Cyan & Neon Amber/Crimson) and central glowing energy core.
   - Replaced Google Gemini star logo across the title, sidebar, avatars, and favicon with the custom XTREME emblem.
   - Authentic Dark (`#131314`) and Light mode toggle.
   - Collapsible sidebar with chat session history, rename, delete, and persistent `localStorage` storage.

2. **XTREME Model Lineup**:
   - **XTREME Normal 1.0**: Balanced daily intelligence, clean structured responses, and multimodal comprehension.
   - **XTREME Fire 3.0**: Blazing speed, rapid code synthesis, and live web-grounded creative intelligence.
   - **XTREME Lightning 5.0**: Ultra-fast deep cognitive horsepower with step-by-step reasoning traces and complex problem solving.

3. **Multimodal Intelligence & Attachments**:
   - Upload any image or file via the `+` attachment button.
   - Built-in **Sample Multimodal Images picker** (Nebula, Cyberpunk Drone, Financial Dashboard, Architecture) to test multimodal reasoning in 1 click.
   - Image analysis with object recognition, contextual breakdown, and OCR.

3. **Thinking Process (Deep Think / Chain-of-Thought)**:
   - Interactive collapsible accordion ("Thought for 3.2s") showing step-by-step reasoning traces and problem breakdown, just like Gemini 2.0 Flash Thinking.

4. **Interactive Live Canvas & Code Sandbox**:
   - Every generated HTML/CSS/JavaScript or Canvas code block has a **"Run in Live Canvas"** button.
   - Opens an embedded sandbox runner iframe where users can run and interact with the code live!

5. **Voice Capabilities**:
   - **Speech-to-Text Dictation**: Click the microphone icon to speak your prompts (uses Web Speech API).
   - **XTREME Live Voice Mode**: Fullscreen Gemini Live voice chat with pulsing glowing particle orb and speech interaction.
   - **Text-to-Speech (TTS) Reader**: Listen to any model answer read aloud with play/pause and custom speech speed controls.

6. **Gemini "Drafts" Feature**:
   - Offers multiple response drafts (Draft 1, Draft 2, Draft 3) for each generated response so you can explore alternate formulations.

7. **Dual Engine (Real Gemini API + Smart Offline Engine)**:
   - **Offline Mode**: Works 100% out of the box with zero keys needed, providing structured answers across coding, quantum physics, creative concept art, and viral marketing.
   - **Live Gemini API Mode**: Enter your free Google AI Studio API key in **Settings** (`AIzaSy...`) to talk to live `gemini-2.0-flash-exp` or `gemini-1.5-pro` with real-time Google search grounding.

8. **Live Real-Time Web Access & Clear Deep Thinking**:
   - Built-in real-time web crawler and Wikipedia search engine (`/api/search`).
   - Deep webpage reader (`/api/fetch-page`) that reads live websites and URLs directly.
   - Grounded reasoning engine that cross-verifies facts from live sources before generating structured answers with cited clickable source chips.
   - Real-time search progress indicator: `🌐 Searching the live web...` -> `📚 Reading sources...` -> `🧠 Deep thinking and synthesizing...`

---

## 🚀 Live Hosted Production Sites

- ⚡ **Official Vercel Production URL**: **[https://xtreme-ai-azure.vercel.app](https://xtreme-ai-azure.vercel.app)**
- 🌐 **Netlify Production URL**: **[https://xtreme-ai-model.netlify.app](https://xtreme-ai-model.netlify.app)**
- 📊 **Vercel Project Dashboard**: [https://vercel.com/carrer-ai/xtreme-ai](https://vercel.com/carrer-ai/xtreme-ai)

---

## 💻 Local Access & Domain Mapping
The application is bound to standard HTTP **Port 80**, meaning you don't even need to type `:5173`.

To open it using the exact domain name in your browser:
1. Right-click [`map-xtreme-domain.bat`](file:///C:/Users/santh/.gemini/antigravity/scratch/xtreme-ai/map-xtreme-domain.bat) in the project folder and click **Run as Administrator** (or run PowerShell as Administrator and enter `Add-Content -Path "$env:SystemRoot\System32\drivers\etc\hosts" -Value "`n127.0.0.1 www.xtremeai.com www.xtreme-ai.com"`).
2. Open your browser and go to:
   - **`http://www.xtremeai.com`**
   - **`http://www.xtreme-ai.com`**
   - **`http://localhost`**

### 2. Live Public Internet Tunnel
- Public live URL: **`https://xtreme-ai.loca.lt`**

### 3. Deploying to Netlify
You can deploy to **Netlify** with full serverless live search support:
```bash
cd C:\Users\santh\.gemini\antigravity\scratch\xtreme-ai
.\deploy.bat
```
- **Custom Domain (`www.xtremeai.com`)**:
  In your Netlify Dashboard, go to **Domain management → Add custom domain**, enter **`www.xtremeai.com`**, and point your registrar's DNS (CNAME: `xtreme-ai-model.netlify.app`).

### 4. 1-Click Interactive Deployer
Double-click [`deploy.bat`](file:///C:/Users/santh/.gemini/antigravity/scratch/xtreme-ai/deploy.bat) in the project directory to build, bundle, and deploy straight to Netlify production in one click!
