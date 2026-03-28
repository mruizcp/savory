# Favoritos y recetarios (colecciones)

## Datos (Prisma existente)

| Modelo | Rol |
|--------|-----|
| `RecipeFavorite` | Relación usuario–receta (`userOid`, `recipeId`), única por par. |
| `Cookbook` | Recetario del usuario (`name`, `description?`). |
| `CookbookRecipe` | Receta en un recetario (`cookbookId`, `recipeId`, `position?`). |

Las recetas son siempre del propio usuario (`Recipe.userOid`); favoritos y recetarios aplican sobre esas recetas.

## API

| Operación | Método | Ruta |
|-----------|--------|------|
| Estado / alternar favorito | `GET` / `POST` | `/api/recipes/[recipeId]/favorite` |
| Listar favoritos | `GET` | `/api/favorites` |
| Listar recetarios | `GET` | `/api/cookbooks` |
| Crear recetario | `POST` | `/api/cookbooks` |
| Detalle recetario + recetas | `GET` | `/api/cookbooks/[cookbookId]` |
| Renombrar / borrar recetario | `PATCH` / `DELETE` | `/api/cookbooks/[cookbookId]` |
| Añadir / quitar receta | `POST` / `DELETE` | `/api/cookbooks/[cookbookId]/recipes` |

## Historial (`HistoryEvent`)

- **Favoritos**: `entityType: FAVORITE`, `actionType: CREATED` (añadir) / `DELETED` (quitar), `entityId`: `recipeId`.
- **Recetarios**: `entityType: COOKBOOK`, `CREATED` / `UPDATED` / `DELETED`, `entityId`: `cookbookId`; al añadir receta, `UPDATED` con metadata `{ recipeId, recipeTitle }`.

## UI

- `/favoritos`: lista de recetas favoritas con enlace al detalle.
- `/recetarios`: lista de recetarios, crear nuevo, enlace a detalle.
- `/recetarios/[id]`: recetas del recetario, quitar de la colección.
- Detalle de receta: botón favorito y selector para añadir a un recetario.

## Navegación

Entradas **Favoritos** y **Recetarios** en la navegación principal.
