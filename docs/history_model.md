# Modelo de historial (App Recetas Inteligentes)

## Objetivo

Registrar de forma **auditable** y **consultable** lo que indica el canvas:

- ingredientes (listas guardadas)
- fotos (sesión con imagen + detecciones)
- recetas (generación / regeneración)
- cambios (perfil y, en el futuro, ediciones de receta)

## Tabla central: `HistoryEvent`

Evento **append-only** por usuario.

| Campo | Uso |
|--------|-----|
| `userOid` | Dueño del evento |
| `entityType` | `INGREDIENTS` (sesión de ingredientes), `RECIPE`, `PROFILE`, más adelante `FAVORITE` / `COOKBOOK` |
| `entityId` | Id de la entidad relacionada (sesión, receta, perfil) cuando aplique |
| `actionType` | `CREATED`, `UPDATED`, `REGENERATED`, `FAILED`, etc. |
| `summary` | Texto legible para listados |
| `metadataText` | JSON (máx. 4000): `sourceType`, `imageUrl`, vista previa de ingredientes, detalles de error, etc. |

## Datos de negocio (ya existentes)

- **`IngredientInputSession`**: una fila por “captura” (manual o foto); `sourceType` `MANUAL` \| `PHOTO`; `imageUrl` si hubo foto.
- **`IngredientInputItem`**: ítems de esa sesión (`DETECTED` \| `MANUAL`).
- **`Recipe`**: recetas generadas o importadas.
- **`RecipeGenerationAttempt`**: intentos de IA (éxito / error); el historial de **usuario** se refuerza con `HistoryEvent` en fallos.

## Segmentación en UI (“buckets”)

Se **deriva** del `entityType` + `metadataText` (no requiere columna nueva):

| Bucket UI | Origen |
|-------------|--------|
| Ingredientes | `entityType = INGREDIENTS` y `metadata.sourceType = MANUAL` |
| Fotos | `entityType = INGREDIENTS` y `metadata.sourceType = PHOTO` |
| Recetas | `entityType = RECIPE` y acciones de generación / regeneración / fallo |
| Cambios | `entityType = PROFILE` + `UPDATED`, o `RECIPE` + `UPDATED` (futuro) |

## Reglas

- Sin `DATABASE_URL` no hay persistencia ni historial consultable.
- Cada guardado relevante crea al menos un `HistoryEvent` coherente con la entidad persistida.
