<div align="center">
  <img src="./public/pwa-192x192.png" alt="Skippie Logo" width="120" />

  # 🎓 Skippie
  **Predictive Intelligence for UTU Attendance Planning**

  [![Vercel Deployment](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://utu-skippie.vercel.app/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

  [**Live Web App**](https://utu-skippie.vercel.app/) • [**Report a Bug**](https://github.com/M0neySSH/utu-skippie/issues)
</div>

---

## 🎯 The Motive

Tracking university attendance shouldn't feel like a second job. Between calculating 75% thresholds, predicting safe days off, and navigating clunky university portals, staying on top of your schedule can be incredibly tedious. 

**Skippie** was engineered to automate this workflow. By bypassing the traditional UKTECH portal and directly parsing the core academic database, Skippie hands UTU students the computational power to predict, simulate, and optimize their entire semester in milliseconds. Our mission is to automate the mundane calculations so you can focus your energy entirely on passing exams and excelling at university.

---

## 📸 Screenshots

*(Replace the placeholder URLs below with the actual paths to your screenshots once uploaded to GitHub)*

<div align="center">
  <img src="https://via.placeholder.com/800x400.png?text=Dashboard+Screenshot+Here" width="80%" alt="Skippie Dashboard" />
</div>

<div align="center">
  <img src="https://via.placeholder.com/400x400.png?text=Smart+Plan+Screenshot+Here" width="40%" alt="Smart Action Plan" />
  <img src="https://via.placeholder.com/400x400.png?text=Daily+Simulator+Screenshot+Here" width="40%" alt="Daily Simulator" />
</div>

---

## ⚡ Elite Engine Features

### 🧠 Smart Bunk Engine
Tell Skippie your weekly timetable. The algorithm mathematically computes an explicit action plan of exactly which classes you can skip today, tomorrow, and next week while safely remaining above the dangerous 75% red-line.

### 📅 Daily Simulator
Wake up, open the app, and uncheck the classes you plan to sleep through. The simulator instantly projects your hypothetical final attendance percentage by 5:00 PM, taking the guesswork out of bunking.

### 📋 Deep Subject History
No more blind data. The Subject History tab reconstructs your entire semester by plotting every single Present, Absent, and Official Leave marker directly onto an interactive calendar grid.

### 📚 Live Academic Calendar Sync
Skippie automatically hooks into the live `uktech.ac.in` API to pull official holidays, ensuring your simulated timelines are perfectly mapped without docking attendance for university-wide off days.

### 🔒 100% Client-Side Privacy
Your secret UKTECH tokens never touch our databases. Skippie operates entirely as a local Progressive Web App (PWA) right on your phone's processor. 

---

## 🚀 Quick Start / Installation

Because Skippie relies on private student IDs, you must extract a one-time token from your active portal session.

1. **Visit the App:** Navigate to [utu-skippie.vercel.app](https://utu-skippie.vercel.app/)
2. **Copy the Extractor Code:** Tap the "❓ How to find my IDs?" button and copy the provided JavaScript.
3. **Login to UKTECH:** Open a new tab, login to your student dashboard, and open the *Student Attendance System* page. Select your exact semester from the dropdowns.
4. **Extract:** Type `javascript:` into your browser's URL bar, paste the copied code directly after it, and hit enter.
5. **Analyze:** Copy the generated popup token, paste it back into Skippie, and hit "Fetch & Analyze".

**📱 Install as an App:**
For the best experience, scroll to the bottom of the Skippie footer and tap **"Install Skippie App"** to save it as a native offline PWA on your iOS or Android home screen!

---

## 💻 Tech Stack

- **Frontend:** React 18, Vite, Vanilla CSS (Glassmorphism UI)
- **Backend (Proxy):** Node.js, Vercel Serverless Functions
- **Parsing Engine:** Cheerio
- **PWA Capabilities:** `vite-plugin-pwa`

---

## 🛠️ Local Development Setup

If you wish to run the app locally and contribute to the source code:

```bash
# Clone the repository
git clone https://github.com/M0neySSH/utu-skippie.git

# Navigate into the directory
cd utu-skippie

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

---

<div align="center">
  <b>Developed with ❤️ for the Veer Madho Singh Bhandari Uttarakhand Technical University community.</b><br>
  Built by <a href="https://github.com/M0neySSH">Manish</a>
</div>
