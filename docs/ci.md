# Integración continua (CI)

## Ubicación

El workflow de GitHub Actions está en [.github/workflows/ci.yml](../.github/workflows/ci.yml). El código de la app vive en `web/`; todos los pasos usan ese directorio.

## Qué ejecuta

1. `npm ci` — instalación reproducible desde `web/package-lock.json`.
2. `npx prisma generate` — genera el cliente Prisma a partir de `web/prisma/schema.prisma` (no requiere conexión ni `DATABASE_URL` real).
3. `npm run typecheck` — `tsc --noEmit` sobre el proyecto TypeScript.
4. `npm run lint` — ESLint (`eslint-config-next`).
5. `npm run test:run` — Vitest en modo run único.
6. `npm run build` — compilación de Next.js.

### Build en CI sin secretos reales

Durante `next build`, Node suele estar en modo producción y la app importa módulos que leen `AUTH_SECRET` (p. ej. `getAuthSecret()` en `web/src/lib/auth/env.ts`). El workflow define **solo en el paso Build** variables *dummy* (`AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL`, `OPENAI_API_KEY`) para que el empaquetado no falle: **no son credenciales reales** ni se conecta a Azure/OpenAI en ese job.

## Secretos y variables

La validación base **no define secretos** en GitHub. No hace falta `OPENAI_API_KEY`, `DATABASE_URL` ni `AUTH_SECRET` para generate, typecheck ni tests unitarios actuales.

Para desarrollo local o despliegue, usa `web/.env.example` como referencia y copia a `.env.local`; nunca subas valores reales al repo.

## Ampliar el pipeline

Opciones: matriz de versiones de Node, caché de `.next`, o jobs adicionales con secretos almacenados en GitHub (staging) distintos de los placeholders del build público.
