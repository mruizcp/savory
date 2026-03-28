-- UNIQUE en columna nullable: SQL Server solo permite un NULL con el índice único clásico.
-- Varios NULL son válidos si el índice único es filtrado (solo filas con shareToken no nulo).

IF EXISTS (
  SELECT 1
  FROM sys.key_constraints
  WHERE name = N'Recipe_shareToken_key'
    AND parent_object_id = OBJECT_ID(N'dbo.Recipe')
)
BEGIN
  ALTER TABLE [dbo].[Recipe] DROP CONSTRAINT [Recipe_shareToken_key];
END

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = N'Recipe_shareToken_key'
    AND object_id = OBJECT_ID(N'dbo.Recipe')
)
BEGIN
  CREATE UNIQUE NONCLUSTERED INDEX [Recipe_shareToken_key]
    ON [dbo].[Recipe]([shareToken])
    WHERE [shareToken] IS NOT NULL;
END
