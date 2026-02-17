
# BP-TT Sales Productivity Dashboard

A high-end, professional sales analytics platform for BP-TT. This dashboard provides real-time insights into salesman productivity, PJP adherence, and sales achievement using Google Sheets as a backend and Google Gemini for AI-driven executive summaries.

## 🚀 Key Features
- **AI Executive Insights**: Powered by Gemini 3 Flash, delivering sharp "Observation-Impact-Action" summaries.
- **Cascading Filters**: Intelligent filtering across Team, Route, and Salesman.
- **Performance Tracking**: Target vs. Actual visualizations and Top/Bottom performer rankings.
- **Route Summary**: Detailed granular table for deep-dive route analysis.

## 🛠️ Tech Stack
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **AI**: @google/genai (Gemini API)

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- NPM or Yarn

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root and add your Gemini API Key:
   ```env
   VITE_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment (Vercel)
This project is configured for seamless deployment on Vercel. 
1. Connect your GitHub repository to Vercel.
2. Add `API_KEY` to the **Environment Variables** in the Vercel project settings.
3. Deploy!
