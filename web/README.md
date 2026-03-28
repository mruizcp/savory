# Recetas Inteligentes (web)

Aplicación Next.js (App Router) para generar y gestionar recetas con IA.

## Requisitos

- Node.js compatible con la versión del proyecto
- Cuenta y credenciales según el entorno (ver documentación de variables)

## Configuración

1. Copia `web/.env.example` a `web/.env.local`.
2. Rellena las variables obligatorias para tu entorno (desarrollo o producción).

La referencia completa de variables (`DATABASE_URL`, `OPENAI_API_KEY`, Azure, Auth, etc.) está en **[`docs/architecture.md`](../docs/architecture.md)** en la raíz del repositorio.

## Desarrollo

```bash
cd web
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Persistencia

Sin `DATABASE_URL` el servidor **no guarda** historial, recetas en base de datos, favoritos ni perfil persistido. La interfaz muestra avisos para que no se interprete como “sin actividad” cuando en realidad falta configuración.

## Más documentación

- [`docs/product_canvas.md`](../docs/product_canvas.md) — alcance funcional
- [`docs/cursor_rules.md`](../docs/cursor_rules.md) — convenciones de trabajo
