# AceSmart Frontend Application

The frontend client for **AceSmart** — a modern Computer-Based Testing (CBT) and assessment platform built with React 19, Vite, and Chakra UI v3.

---

## 💻 Tech Stack & Key Libraries

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **UI & Design System**: [Chakra UI v3](https://chakra-ui.com/) with Emotion
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Data Fetching**: [TanStack React Query v5](https://tanstack.com/query)
- **Computer Vision & Verification**: [face-api.js](https://justadudewhohacks.github.io/face-api.js/docs/index.html) with models in `/public/models`
- **Math & Equation Formatting**: [Better React MathJax](https://www.npmjs.com/package/better-react-mathjax)
- **Analytics & Visualizations**: [Recharts](https://recharts.org/)
- **Document Exporting**: [jsPDF](https://github.com/parallax/jsPDF) & [SheetJS (xlsx)](https://docs.sheetjs.com/)
- **Icons & Animation**: `react-icons`, `react-fast-marquee`

---

## 📁 Source Directory Structure

```
src/
├── api-endpoint/            # Centralized Axios API request helpers
│   ├── auth/                # Login, Register, Profile queries
│   ├── exams/               # Exam setup and questions retrieval
│   └── students/            # Student management & batch upload
├── assets/                  # Brand assets and imagery
├── components/              # Modular UI components
│   ├── auth/                # Login & Registration modal/drawer forms
│   ├── teacher/             # Exam creation, draft management, question builder
│   └── ui/                  # Chakra UI v3 custom components & landing blocks
├── libs/                    # AuthProvider and global application context
├── pages/                   # Application route views
│   ├── Landing.jsx          # Public showcase & demo landing page
│   ├── TakeExam/            # Student examination flow (Login, Face Check, Test, Score)
│   ├── teacher/             # Teacher management dashboard & reports
│   └── Home.jsx             # Top-level route configuration
├── index.css                # Global base styles & typography
└── main.jsx                 # Provider configuration (Chakra, QueryClient, BrowserRouter)
```

---

## 🏃 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in this directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

### 5. Preview Production Build
```bash
npm run preview
```
