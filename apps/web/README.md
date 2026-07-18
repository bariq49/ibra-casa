# Sellzy Storefront (`apps/web`)

The Next.js 14 App Router application serving as the primary digital interface for consumers. This node handles localized routing, complex variant cart algorithms asynchronously, and integrates tightly with our bespoke API engine.

## ⚡️ Key Features

- **Instant Suspense Rendering**: Structural sections evaluate immediately while product arrays gracefully pulse internally mimicking high-grade native loading environments.
- **Zustand Advanced Synchronization**: Cart, Wishlist, and Contextual interfaces operate fluidly in memory and aggressively sync backend databases strictly per configuration directives.
- **Tailwind Global Consistency**: All thematic structures abide strictly by our pre-structured Tailwind CSS guidelines allowing rapid deployment changes.

## 🚀 Development Setup

The web layer requires the backend `apps/api` to be actively running. Ensure your `.env` perfectly matches the required configurations detailed in `THEMEFOREST_SETUP.md`.

```bash
pnpm run dev:web
```

Open [http://localhost:3000](http://localhost:3000) with your browser to witness the system active.
