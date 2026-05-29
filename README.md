# 🌍 Smart EcoKids

> An interactive, AI-powered educational platform designed to teach children about ecology, waste management, and sustainability through gamification and hands-on activities.

---

## ✨ Features

- **🤖 AI Waste Scanner**: Uses image recognition to classify waste (Organic, Recyclable, Hazardous) and teaches kids how to dispose of it properly.
- **🎮 Interactive Games**: Drag-and-drop educational mini-games to make learning fun and engaging.
- **📚 Education Hub**: Comprehensive learning materials about the environment, recycling, and conservation.
- **📊 Role-Based Dashboards**: 
  - **Students**: Track progress, quiz scores, and achievements.
  - **Teachers**: Monitor student performance, class statistics, and activity history.
- **🏆 Rewards & Gamification**: Confetti celebrations and badges to motivate young learners.
- **🔐 Secure Authentication**: Handled securely with role-based access control (Student & Teacher).

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (Pages Router)
- **Frontend**: React 19, [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) (Animations)
- **Database**: [Neon Database](https://neon.tech/) (Serverless Postgres) + [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **File Uploads**: [Cloudinary](https://cloudinary.com/) (for waste scanning)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Icons & UI**: [Lucide React](https://lucide.dev/), Canvas Confetti, and custom UI components.

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### Environment Variables
Create a `.env.local` file in the root directory and add the following variables (adjust according to your setup):
```env
# Database (Neon/Postgres)
DATABASE_URL="your_neon_db_url"

# NextAuth
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (for Waste Scanner)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/indraafito/EcoKids.git
   cd EcoKids/smart-ecokids
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Push database schema to Neon (Drizzle):
   ```bash
   npx drizzle-kit push
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the app.

## 📂 Project Structure

- `/components`: Reusable UI components (Buttons, Cards, EcoMascot) and Layouts (Sidebar, BottomNav).
- `/pages`: Application routes (Dashboard, Scanner, Game, Education) and API endpoints (`/pages/api`).
- `/lib`: Utility functions, database configuration (`db.js`), and core logic (`wasteClassifier.js`, `cloudinary.js`).
- `/drizzle`: Database schema (`schema.js`) and migrations.
- `/hooks`: Custom React hooks (Auth, LocalStorage, MediaQuery).
- `/data`: Static data for education and game items.

## 📝 License
This project is designed and developed for the LIDM (Lomba Inovasi Digital Mahasiswa) competition. All rights reserved.
