# JOLIE — Toko Pakan Jolie Gebang

Reference UI and production foundation for the JOLIE web/PWA.

## Design contract

The uploaded JOLIE reference is the visual baseline:
- green/white/orange JOLIE identity
- marketplace-style header and navigation
- large agricultural hero
- circular category navigation
- product cards with live catalog data
- AI Companion panel
- Virtual Veterinary Assistant
- customer registration / loyalty
- articles and tips
- responsive mobile experience
- future Business OS and AKVISIO customization

## Run

```bash
npm install
npm run dev
```

## Production direction

The UI is intentionally separated from business data. Product, stock, pricing, orders, customers, authentication, payments, shipping, AI and Business OS will be connected to the dedicated Supabase project without exposing service-role credentials in the browser.
