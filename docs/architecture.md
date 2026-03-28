# Arquitectura y configuración

## Variables de entorno

Las variables se definen en `web/.env.local` (desarrollo) o en el proveedor de hosting (producción). Copia `web/.env.example` como plantilla.

### Obligatorias en producción

| Variable | Rol |
|----------|-----|
| `AUTH_SECRET` | Secreto de Auth.js (NextAuth). Generar con `openssl rand -base64 32`. En desarrollo puede omitirse (valor por defecto interno). |
| `AUTH_URL` o `NEXTAUTH_URL` | URL pública base de la app (ej. `https://tu-dominio.com`). Usada en callbacks y URLs absolutas. |
| `DATABASE_URL` | Cadena de conexión **Azure SQL** para Prisma. Sin esta variable **no hay persistencia**: historial, recetas guardadas, favoritos, recetarios y perfil en BD no funcionan. |
| `OPENAI_API_KEY` | API key de OpenAI para generación de recetas (y recomendaciones que usan el modelo). |

### Autenticación (correo y contraseña)

El login y el registro usan **NextAuth** con proveedor **Credentials**: correo y contraseña hasheada (bcrypt) en la tabla `User`. No hay proveedores OAuth ni Azure AD B2C.

Requisito operativo: `DATABASE_URL` configurada para que registro e inicio de sesión persistan usuarios.

### Azure Blob Storage (fotos de ingredientes)

La app usa el SDK `@azure/storage-blob` para subir archivos al contenedor indicado. Si **no** hay credenciales completas, en desarrollo las fotos se escriben en `web/public/uploads` (mismo contrato de salida: `url` relativa `/uploads/...`).

| Variable | Rol |
|----------|-----|
| `AZURE_STORAGE_CONNECTION_STRING` | Cadena estándar (incluye `AccountName` y `AccountKey`). Opción recomendada. |
| `AZURE_BLOB_STORAGE_ACCOUNT` | Nombre de la cuenta (si no usas cadena de conexión). |
| `AZURE_BLOB_STORAGE_ACCOUNT_KEY` | Clave de la cuenta para subida y firma de SAS de lectura. Alias: `AZURE_STORAGE_ACCOUNT_NAME` / `AZURE_STORAGE_ACCOUNT_KEY`. |
| `AZURE_BLOB_CONTAINER_NAME` | Contenedor destino (debe existir). |

| Variable | Rol (opcional) |
|----------|------------------|
| `AZURE_BLOB_PUBLIC_READ` | `true`: URL devuelta sin SAS (requiere lectura anónima a nivel **blob** en el contenedor). Cualquier otro valor: se anexa SAS de solo lectura (contenedor puede ser privado). |
| `AZURE_BLOB_SAS_READ_YEARS` | Años de validez del SAS de lectura (por defecto `10`). La URL queda persistida en historial; al rotar la clave de cuenta, renovar enlaces o acortar vigencia. |

### Opcionales

| Variable | Rol |
|----------|-----|
| `OPENAI_MODEL` | Modelo de chat (por defecto `gpt-4o-mini`) |
| `NEXT_PUBLIC_APP_URL` | URL pública para enlaces absolutos (p. ej. compartir) si no hay cabecera `Host` fiable |
| `NEXTAUTH_SECRET` | Alias histórico de `AUTH_SECRET` |

## Persistencia e historial

La regla de producto exige guardar historial cuando el sistema está correctamente desplegado. Si `DATABASE_URL` no está definida:

- Las rutas API que dependen de Prisma devuelven vacío, error controlado o no persisten.
- La interfaz muestra un aviso global (usuarios con sesión) para no dar la impresión de que los datos se guardan en el servidor.

El helper `isDatabaseConfigured()` en `web/src/server/env/is-database-configured.ts` centraliza la comprobación.

## Migraciones (Prisma / Azure SQL)

El directorio `web/prisma/migrations` incluye una migración **baseline** (`20260101000000_init_schema`) que crea el esquema completo a partir de `schema.prisma`. Las migraciones antiguas que solo hacían `ALTER` sobre tablas inexistentes fueron sustituidas por esta baseline.

**Base de datos nueva (vacía):** `npx prisma migrate deploy` desde `web/`.

**Si una migración falló antes (p. ej. P3018) o hay filas en `_prisma_migrations` inconsistentes:** en un entorno de desarrollo puedes borrar todas las tablas del esquema (o recrear la base) y volver a ejecutar `migrate deploy`. En Azure SQL, una base nueva o un esquema `dbo` vacío evita conflictos con objetos previos.
