# Base de Datos Completa - App Recetas Inteligentes

## Cobertura funcional

Este esquema cubre:

- usuarios
- perfiles
- ingredientes (catalogo + capturas manual/foto)
- recetas (incluye regeneracion)
- historial/auditoria
- favoritos
- recetarios

## Entidades principales

- `User`: identidad de la app asociada al `oid` de Azure AD B2C.
- `UserProfile`: preferencias de perfil (nivel, restricciones, objetivos, ingredientes no deseados).
- `IngredientCatalog`: catalogo normalizado de ingredientes.
- `IngredientInputSession`: sesion de captura de ingredientes (`MANUAL` o `PHOTO`), con metadatos de imagen/deteccion.
- `IngredientInputItem`: ingredientes capturados por sesion (detectados o agregados manualmente).
- `Recipe`: receta final (generada o existente), con soporte de regeneracion (`parentRecipeId`).
- `RecipeStep` y `RecipeIngredient`: detalle de receta.
- `RecipeGenerationAttempt`: trazabilidad de intentos de IA.
- `RecipeFavorite`: favoritos por usuario.
- `Cookbook` y `CookbookRecipe`: recetarios personales.
- `HistoryEvent`: historial inmutable para auditoria funcional.

## Relaciones clave

- `User (1) -> (1) UserProfile` por `User.oid = UserProfile.userOid`.
- `User (1) -> (N) IngredientInputSession`.
- `IngredientInputSession (1) -> (N) IngredientInputItem`.
- `IngredientCatalog (1) -> (N) IngredientAlias`.
- `User (1) -> (N) Recipe`.
- `Recipe (1) -> (N) RecipeStep`.
- `Recipe (1) -> (N) RecipeIngredient`.
- `Recipe (1) -> (N) RecipeGenerationAttempt`.
- `Recipe (1) -> (N) RecipeFavorite`, `User (1) -> (N) RecipeFavorite` (favoritos M:N).
- `Cookbook (1) -> (N) CookbookRecipe`, `Recipe (1) -> (N) CookbookRecipe` (recetarios M:N).
- `User (1) -> (N) HistoryEvent` para historial completo.

## Reglas del modelo

- Historial no se sobrescribe: `HistoryEvent` es append-only.
- Toda receta generada queda persistida en `Recipe` + `RecipeGenerationAttempt`.
- Capturas por imagen/manual quedan en `IngredientInputSession` e `IngredientInputItem`.
- Preferencias de perfil quedan normalizadas (tablas hijas para listas).

## Archivos fuente

- Modelos Prisma: `web/prisma/schema.prisma`
- SQL completo: `database/schema_full.sql`
