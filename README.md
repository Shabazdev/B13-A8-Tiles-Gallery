# Tesserae — Premium Tiles Gallery Showcase

An elegant, Swiss-minimalist web showroom designed to showcase a curated collection of exquisite ceramic, marble, terracotta, porcelain, and glass tiles. Developed with React 19, Tailwind CSS v4, and Framer Motion.

## 🏛️ Project Theme & Design Concept
Tesserae uses a high-contrast editorial aesthetic incorporating generous negative space, subtle zinc lines, and crisp typography pairings. By combining the sleek **Inter** sans-serif font for general UI controls with the beautiful **Playfair Display** editorial serif for headings, the platform reflects the craftsmanship and structural beauty of artisanal tiling.

## ✨ Key Features

### 🧱 1. Responsive Layout & Navbar Navigation
- **Responsive Header (Navbar)**:
  - Left: Website logo links directly to the Home dashboard.
  - Centre: Navigational links for **Home**, **All Tiles**, and **My Profile** (with private route protection).
  - Right: Context-aware sign-in controls showing dynamic user names and avatars for active sessions, and a quick "Logout" button. On anonymous sessions, an elegant "Login" CTA is displayed.
- **Architectural Footer**: Includes curated category shortcuts, a dynamic "Join the Club" newsletter sub-module with success feedback, and a functional "Contact Us" info directory.

### 🏠 2. Dynamic Home Page
- **Hero Banner**: A clean display typography header ("Discover Your Perfect Aesthetic") coupled with a "Browse Now" button leading to the catalog and an inline showcase mockup.
- **Scrolling Announcement Marquee**: Powered by **Framer Motion**, a seamless infinite text scroll showing new arrivals, product drops, and artisan notices.
- **Artisan Showcase**: Loads and displays the top 4 featured tiles with responsive interaction cards and detail quick-links.

### 🔍 3. All Tiles Catalogue
- **Instant Search Input**: Search through tiles by title with real-time text matching.
- **Bespoke Category Filtering**: Filter tiles by material type (ceramic, marble, mosaic, terracotta, glass, porcelain) through interactive tabs.
- **Interactive Card Elements**: Every card includes responsive hover zoom scales, stock availability indicators, material specifications, and a dynamic CTA.

### 🛡️ 4. Local Database-backed Authentication
- **User Login**: Form with email and password fields, validation warnings, register navigation triggers, and **Google Social login simulation** which sets up a pre-configured Google account in one click.
- **User Registration**: Create accounts by entering Name, Email, Password, and a custom Profile Photo link. Newly registered accounts are committed to `localStorage` and can immediately be logged into!
- **Default Tester Credentials**: To make grading painless, the database automatically seeds a demo account:
  - **Email**: `designer@tesserae.com`
  - **Password**: `password123`

### 👤 5. Designer Profile & Update Suite
- **My Profile**: Private route displaying current designer credentials, join dates, access tiers, layout preferences, and shortcuts.
- **Update Information**: An isolated settings view allowing users to live-update their Display Name and Image URL, updating all matching session parameters in real time.

### 🚦 6. Robust SPA Routing & Guards
- **Page-Reload Safety**: Uses a custom hash-based routing engine (`HashRouter`). Reloading from `/my-profile` or `/tile/tile_001` works flawlessly without ever throwing 404 router errors.
- **Private View Redirect Guard**: Restricts access to `/my-profile`, `/update-profile`, and single `/tile/[id]` details. Accessing these anonymously displays an error Toast warning and redirects users to sign in.
- **Simulated Latency Loaders**: Integrates an aesthetic "Loading Studio..." overlay spinner on all route changes to mimic real-world network requests.
- **404 Misplaced Tile Page**: Dedicated fully styled not-found layout for invalid paths.

---

## 📦 Installed Packages & Technologies
The application uses the following pre-configured dependencies:
- **`react` & `react-dom` (^19.0.1)**: Progressive client UI architecture.
- **`motion` (^12.23.24)**: High-end animation triggers and infinite scrolling loops.
- **`lucide-react` (^0.546.0)**: Modern, vector-sharp SVG icons.
- **`@tailwindcss/vite` (^4.1.14)**: Modern Utility-first Tailwind CSS engine.
- **`vite` (^6.2.3)**: blazingly fast bundling and asset management.
