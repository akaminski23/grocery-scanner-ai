# Project Rules — Auto-Loaded by Editors/AI

## ✅ Core Rules (follow in every change)
1) Verify with real data — check API/DB/logs, no assumptions
2) Keep it simple — small PRs, minimal surface area
3) Work in small steps — test locally after each change
4) Clear commits — Conventional Commits prefixes only
5) Security first — no secrets in repo; use `.env` (+ `.env.example`)
6) Consistent style — TypeScript preferred; ESLint + Prettier
7) End-to-end thinking — follow flow: API → state → UI

## 🔐 Env & Secrets
- Commit only `.env.example` with dummy values.
- **.gitignore must ignore:**  
  `.env`, `.env.local`, `.env.*.local`, `.env.production`, `.env.staging`
- Setup: `cp .env.example .env` then fill real values locally.

## 🧪 Definition of Done (DoD)
- Runs locally w/o console errors
- Basic tests (if present) pass
- Accessibility basics if UI
- README & AGENTS/CLAUDE updated if behavior changes

## 🌿 Branch & PR Hygiene
- Branch: `type/short-topic` (ex. `feat/auth-form`)
- PR size target: **≤ 5 files**, **≤ 200 LOC**
- If larger: split into `refactor/`, `feat/`, `chore/` PRs

## 📝 Conventional Commits (quick templates)
- `feat: <short description>`
- `fix: <short description>`
- `docs: <what and where>`
- `refactor: <scope>`
- `test: <what>`
- `chore: <deps/build/infra>`
- Breaking change: add `!` and footer `BREAKING CHANGE: …`

## ⚙️ Standard Scripts
```bash
npm install
npm run dev
npm run build
npm run lint
