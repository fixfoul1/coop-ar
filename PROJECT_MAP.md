# PROJECT_MAP.md — منصة ألعاب عربية Co-op

## [TECH_STACK]
- React 19.2.8 + Vite 8.2.2
- TypeScript 6.0.2
- Tailwind CSS 4.3.3
- PeerJS 1.5.5 (WebRTC P2P)
- Cairo Font (Google Fonts)
- Cloudflare Pages (Hosting — $0/month)

## [SYSTEM_FLOW]
1. User opens site → Home page with 3 game cards
2. User clicks card → Username modal (localStorage)
3. User enters name → Create/Join room
4. PeerJS establishes P2P connection via WebRTC
5. Host runs game logic, Guest renders state
6. Game ends → Back to home

## [ARCHITECTURE]
- Host-Authoritative model (no cheating)
- P2P via WebRTC (zero server cost)
- localStorage for persistence (username only)
- RTL-first CSS with Cairo font
- Domain-Driven file structure (per-game)

## [ORPHANS & PENDING]
