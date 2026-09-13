# Tesserae — Premium Tiles Gallery Showcase (Next.js + Better Auth)

An elegant, Swiss-minimalist web showroom showcasing a curated collection of exquisite ceramic, marble, terracotta, porcelain, and glass tiles. Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Motion**, and **Better Auth** for authentication.

> Migrated from React + Firebase Authentication → Next.js App Router + Better Auth (same UI/UX, same features).

## ✨ Features

- **Responsive Navbar & Footer** — sticky glass header, mobile menu, live session avatar, logout.
- **Home Page** — hero banner, infinite scrolling marquee, value props, featured tiles.
- **All Tiles Catalogue** — instant title search + category filtering.
- **Tile Details** (`/tile/[id]`) — full spec sheet, gallery tags, studio-sample CTA.
- **Authentication (Better Auth)**:
  - Email + password **registration** (`/register`) and **login** (`/login`)
  - **Google OAuth** sign-in
  - **Persistent sessions** — survives page reloads
  - Secure **logout**
- **Protected Routes** — `/my-profile`, `/update-profile`, `/tile/[id]` are guarded by:
  1. **Edge middleware** (session-cookie check → redirect to `/login?from=...`)
  2. **Server-side session verification** (`auth.api.getSession`) inside the page components
- **Profile updates** — display name + photo URL saved through `authClient.updateUser`.
- **Toast notifications** — no browser `alert()`; success/error/info toasts everywhere.
- **404 page** — fully styled "Misplaced Tile" layout.

## 🚀 Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

### Environment variables (`.env.local`)

```env
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000

# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=tesserae

# Optional — enables "Sign in with Google" when both are set
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Better Auth creates its MongoDB collections automatically on first run.

### Google OAuth setup

1. Google Cloud Console → APIs & Services → Credentials → **Create OAuth Client ID** (Web application).
2. Authorized JavaScript origin: `http://localhost:3000` (and your production domain).
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`.
4. Copy the client ID/secret into `.env.local`.

## 🗂 Project Structure

```text
app/
├── layout.tsx              # Root layout (Providers + Header + Footer)
├── page.tsx                # Home
├── login/page.tsx
├── register/page.tsx
├── my-profile/page.tsx     # Protected (server-side session check)
├── update-profile/page.tsx # Protected
├── tile/[id]/page.tsx      # Protected
├── all-tiles/page.tsx
├── not-found.tsx
├── loading.tsx
└── api/auth/[...all]/route.ts  # Better Auth handler

components/                 # UI components (preserved from original app)
lib/
├── auth.ts                 # Better Auth server instance (DB + OAuth)
├── auth-client.ts          # Better Auth React client
├── auth-context.tsx        # AuthProvider + useAuth
├── toast-context.tsx       # ToastProvider + useToast
├── tiles.ts                # Static tile catalogue data
└── types.ts

middleware.ts               # Edge guard for protected routes
```

## 📦 Build & Deploy (Vercel)

```bash
npm run build
npm start
```

For **Vercel deployment** set these env vars in the project settings:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL=https://your-app.vercel.app`
- `MONGODB_URI` (use MongoDB Atlas for production)
- `MONGODB_DB_NAME`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

Also add `https://your-app.vercel.app/api/auth/callback/google` to your Google OAuth redirect URIs.
