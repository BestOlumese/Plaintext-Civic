# ⚖️ PlainText Civic

> Making government and legal documents understandable for everyone through AI-powered simplification.

PlainText Civic is a modern, high-end platform designed to bridge the gap between complex legal jargon and everyday understanding. Using advanced AI analysis, it breaks down dense documents into clear, actionable insights while maintaining the original legal context.

---

## ✨ Key Features

### 🔍 Loophole Finder (AI Risk Analysis)
- **Automated Risk Detection**: Instantly identifies "High Risk" and "Medium Risk" clauses using advanced AI.
- **Plain English Explanations**: Deep-dives into dense legal text to explain exactly what you are agreeing to.
- **Visual Redlining**: Synchronized highlighting between original and simplified text for easy cross-referencing.

### 📜 Smart Translation & Simplification
- **Context-Aware Simplification**: Breaks down complex sentences without losing the original intent.
- **Multilingual Support**: Translate legal documents into Spanish, French, Mandarin, and more.
- **Adjustable Complexity**: Choose between 5th-grade, 8th-grade, or summary reading levels.

### 🔄 Revision Analysis
- **Version Comparison**: View core changes between document revisions in plain English.
- **Absolute Alignment**: Precision-centered comparison modal with premium "wow factor" design.

### 📁 Secure Civic Vault
- **Optimistic File Management**: Instant folder creation, moving, and deletion for a seamless experience.
- **Encrypted Storage**: Secure handling of sensitive documents using UploadThing and Prisma.

---

## 🛠️ Technology Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend**: [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers), [Prisma ORM](https://www.prisma.io/)
- **AI Engine**: [Google Gemini AI](https://ai.google.dev/)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Animations**: [Lucide React](https://lucide.dev/) & Framer Motion transitions
- **File Handling**: [UploadThing](https://uploadthing.com/)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- PostgreSQL database
- Gemini API Key

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/BestOlumese/Plaintext-Civic.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### 3. Environment Variables
Ensure your `.env` file includes:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `GEMINI_API_KEY`: Your Google AI API key.
- `BETTER_AUTH_SECRET`: A secure secret for authentication.

### 4. Database Setup
```bash
npx prisma db push
```

### 5. Run the App
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the platform.

---

## 🎨 Design Philosophy
PlainText Civic follows an **"OS-like" Aesthetic**:
- **Glassmorphism**: Sophisticated backdrop blurs and transparent layers.
- **Micro-animations**: Staggered fades and active-scale feedback on every interaction.
- **Color Palette**: Harmonious slate and blues with surgical red/amber accents for risk detection.

---

Developed with ❤️ for a more transparent legal world.
