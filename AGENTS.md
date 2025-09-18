# Repository Guidelines

## Project Structure & Module Organization
Source lives in `src/`, anchored by `App.tsx` for camera capture, barcode scanning, and Gemini calls. Create reusable UI pieces inside `src/components/`; colocate feature-specific hooks or helpers alongside their consumer to keep logic discoverable. Static assets belong in `public/` for unprocessed files or `src/assets/` when imported by the bundler. Build and type settings live in `vite.config.ts`, `tsconfig.app.json`, and `tsconfig.node.json`; adjust those rather than hand-editing generated outputs. Keep credentials in `.env` (ignored by git).

## Build, Test, and Development Commands
Key npm scripts:
```
npm install        # install dependencies
npm run dev        # start Vite dev server with hot reload
npm run build      # type-check and output production build to dist/
npm run preview    # serve the dist/ bundle locally
npm run lint       # run ESLint with the shared config
```
Use Node 18+ to match Vite support. Commit generated `dist/` files only during releases.

## Coding Style & Naming Conventions
TypeScript is the default; prefer typed React hooks and avoid `any`. Follow the ESLint recommended and React Hooks rules enforced by `eslint.config.js` (2-space indent, single quotes, semicolons). Name components and modules with PascalCase (`src/components/NutritionSummary.tsx`), hooks with `useX`, and environment variables with the `VITE_` prefix so Vite can expose them.

## Testing Guidelines
Automated tests are not yet provisioned. When adding them, use Vitest + React Testing Library under `src/__tests__/` and name files `<Component>.test.tsx`. Ensure new features include at least smoke coverage for rendering and Gemini error handling. Until the suite exists, document manual verification steps in pull requests.

## Commit & Pull Request Guidelines
Commits in `git log` use concise, imperative headlines ("Fix TypeScript build error..."). Keep related changes together, reference tickets with `[#ID]` when available, and avoid tooling noise such as dependency bumps unless intentional. PRs should include: summary of user-facing impact, screenshots or clips for UI updates, updated `.env.example` entries when secrets change, and a checklist of tests performed.

## Configuration & Security Notes
Create `.env` with `VITE_GEMINI_API_KEY=<token>` before running the dev server. Never commit real keys; share instructions in the PR instead. Camera and barcode features require https in production—plan deployments accordingly.
