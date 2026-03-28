# Recomendaciones inteligentes (v1)

## Objetivo (canvas)

Sugerir ideas de cocina alineadas al **uso real**: historial, favoritos y comportamiento reciente.

## Señales (inputs)

| Fuente | Qué se extrae |
|--------|----------------|
| **Favoritos** | Nombres de ingredientes de las recetas marcadas (tabla `RecipeIngredient` vía `RecipeFavorite`). |
| **Historial** | Eventos `HistoryEvent` recientes: vistas previas de listas (`metadata.preview`), títulos implícitos en `summary` de recetas generadas. |
| **Comportamiento** | Conteos simples en ventana móvil (p. ej. 14 días): cuántas recetas generadas / sesiones de ingredientes; refuerza el “peso” del contexto en el prompt. |
| **Perfil (opcional)** | Ingredientes no deseados del perfil para **excluir** o mencionar como restricción en el prompt. |

Todo se normaliza (minúsculas, trim) y se agrega **frecuencia** de ingredientes para un top-N.

## Generación (v1 simple)

1. **Con `OPENAI_API_KEY`**: un único mensaje al modelo (JSON) con resumen de señales + restricciones; salida validada con Zod (`title`, `rationale`, `highlightIngredients`).
2. **Sin IA o error**: **plantillas heurísticas** a partir del top de ingredientes y, si hace falta, ejemplos del catálogo interno.

## Salida

- 3 sugerencias fijas en v1 (configurable).
- La UI muestra tarjetas con título, breve razón e ingredientes destacados; enlace a `/recetas` para generar con la idea.

## Evolución futura

- Embeddings / ranking de recetas guardadas.
- A/B de prompts y feedback explícito (“me gustó”).
