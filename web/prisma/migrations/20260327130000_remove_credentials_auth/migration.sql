BEGIN TRY

BEGIN TRAN;

IF EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = N'User_email_key'
    AND object_id = OBJECT_ID(N'dbo.[User]')
)
BEGIN
  DROP INDEX [User_email_key] ON [dbo].[User];
END

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = N'User_email_idx'
    AND object_id = OBJECT_ID(N'dbo.[User]')
)
BEGIN
  CREATE NONCLUSTERED INDEX [User_email_idx] ON [dbo].[User]([email]);
END

IF COL_LENGTH('dbo.User', 'passwordHash') IS NOT NULL
BEGIN
  ALTER TABLE [dbo].[User] DROP COLUMN [passwordHash];
END

COMMIT;

END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0 ROLLBACK TRAN;
  THROW;
END CATCH
