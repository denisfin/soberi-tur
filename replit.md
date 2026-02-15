# СобериТур — Landing Page

## Overview
Single-page landing website for personalized travel tours across Russia. Dark premium design with cyan (#00bfff) accent color. Two tour modes: 1) AI-generated custom tours via GigaChat LLM, 2) Pre-generated weekend tour routes with day-by-day itineraries.

## Recent Changes
- 2026-02-15: Initial MVP — complete landing page with Hero, Search Bar, Route Cards, Footer
- 2026-02-15: GigaChat LLM integration — POST /api/generate-tour endpoint, /tour page with markdown rendering
- 2026-02-15: Replaced city cards with 6 weekend route cards (Moscow-Tula, SPb-Petrozavodsk, Moscow-Plyos, Moscow-Yaroslavl, Krasnodar-Sochi, NN-Kazan)
- 2026-02-15: Pre-generated tour content with day-by-day itineraries, hotels, restaurants
- 2026-02-15: New /tour/:id page for viewing pre-generated tour content
- Generated 7 custom images (hero + 6 route cards)
- Dark theme configured in both :root and .dark CSS

## Architecture
- **Frontend**: React + Tailwind CSS + Framer Motion for animations
- **Backend**: Express.js with in-memory storage (no database needed)
- **LLM**: GigaChat API (Sberbank) with OAuth 2.0 token flow
- **Styling**: Dark theme (#0a0a0a background, #00bfff accent, white text)
- **Fonts**: Montserrat (sans), Playfair Display (serif)

## Key Files
- `client/src/pages/home.tsx` — Main landing page with all sections
- `client/src/pages/tour.tsx` — Dynamic tour generation page with LLM response rendering
- `client/src/pages/tour-preview.tsx` — Pre-generated tour detail page (/tour/:id)
- `client/src/App.tsx` — Router setup (/, /tour/:id, /tour)
- `client/src/index.css` — Theme variables
- `server/routes.ts` — API endpoints (/api/cities, /api/search, /api/generate-tour, /api/route-cards, /api/tours/:id)
- `server/storage.ts` — In-memory city and route card data
- `server/pregeneratedTours.ts` — Pre-generated tour content for 6 weekend routes
- `server/russian-ca-chain.pem` — Russian CA certificates for GigaChat TLS
- `shared/schema.ts` — TypeScript types and Zod schemas (tourSearchSchema, generateTourSchema, RouteCard, PreGeneratedTour)
- `client/public/images/` — Generated route card and hero images

## Features
- Hero section with parallax background
- Search bar with city autocomplete (~250 Russian cities), date range picker, guest counter, children age selector
- GigaChat LLM tour generation with personalized prompts
- Tour result page with markdown rendering (react-markdown)
- 6 weekend route cards (3 days / 2 nights) with click-to-view details
- Pre-generated tour content: hotels (economy/comfort/luxury), restaurants, day-by-day itinerary
- Fixed navigation with mobile hamburger menu
- Footer with social links
- Scroll-triggered fade-in animations
- Search persistence via sessionStorage
- Tour result caching (skips LLM call if parameters unchanged)

## Environment Secrets
- `GIGACHAT_AUTH_KEY` — GigaChat API authorization key (Base64 encoded)
- `SESSION_SECRET` — Session secret
