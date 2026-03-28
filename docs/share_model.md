# Compartir recetas

## Lógica

1. **Token opaco** (`shareToken`): cadena aleatoria (p. ej. 32 bytes en hex ≈ 64 caracteres), **única** en tabla `Recipe`. No deriva del título ni del id público.
2. **Estado**: `shareToken = null` → no hay enlace público activo; cualquier valor → existe exactamente **un** enlace `/compartir/[token]`.
3. **Renovar**: `POST` genera un **nuevo** token e invalida el anterior (un solo enlace válido a la vez).
4. **Revocar**: `DELETE` pone `shareToken = null` (el enlace deja de resolver).
5. **Autorización**: solo el **dueño** de la receta (`Recipe.userOid`) puede generar, renovar o revocar. La **lectura** por token no requiere sesión.
6. **Vista pública**: solo datos de la receta (título, descripción, metadatos, ingredientes, pasos, ajuste local de porciones). Sin favoritos, recetarios ni datos de cuenta.
7. **Historial**: al crear o renovar enlace se registra `HistoryEvent` con `actionType: SHARED` (trazabilidad).

## URL

- Ruta canónica: `/compartir/[token]`.
- URL absoluta para copiar: origen de la petición o `AUTH_URL` / `NEXT_PUBLIC_APP_URL` si está definida.
