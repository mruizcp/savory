BEGIN TRY

BEGIN TRAN;

-- Hash bcrypt de contraseña inválida (usuarios heredados deben usar "Olvidé contraseña" o admin).
DECLARE @placeholderPwd NVARCHAR(255) = N'$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.GJ.ykQxQ/0Qgq';

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'UserLearningAggregate_userOid_fkey')
  ALTER TABLE [dbo].[UserLearningAggregate] DROP CONSTRAINT [UserLearningAggregate_userOid_fkey];

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'UserProfile_userOid_fkey')
  ALTER TABLE [dbo].[UserProfile] DROP CONSTRAINT [UserProfile_userOid_fkey];

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'IngredientInputSession_userOid_fkey')
  ALTER TABLE [dbo].[IngredientInputSession] DROP CONSTRAINT [IngredientInputSession_userOid_fkey];

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'Recipe_userOid_fkey')
  ALTER TABLE [dbo].[Recipe] DROP CONSTRAINT [Recipe_userOid_fkey];

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'RecipeGenerationAttempt_userOid_fkey')
  ALTER TABLE [dbo].[RecipeGenerationAttempt] DROP CONSTRAINT [RecipeGenerationAttempt_userOid_fkey];

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'RecipeFavorite_userOid_fkey')
  ALTER TABLE [dbo].[RecipeFavorite] DROP CONSTRAINT [RecipeFavorite_userOid_fkey];

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'Cookbook_userOid_fkey')
  ALTER TABLE [dbo].[Cookbook] DROP CONSTRAINT [Cookbook_userOid_fkey];

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'HistoryEvent_userOid_fkey')
  ALTER TABLE [dbo].[HistoryEvent] DROP CONSTRAINT [HistoryEvent_userOid_fkey];

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IngredientInputSession_userOid_createdAt_idx' AND object_id = OBJECT_ID(N'dbo.IngredientInputSession'))
  DROP INDEX [IngredientInputSession_userOid_createdAt_idx] ON [dbo].[IngredientInputSession];

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'Recipe_userOid_createdAt_idx' AND object_id = OBJECT_ID(N'dbo.Recipe'))
  DROP INDEX [Recipe_userOid_createdAt_idx] ON [dbo].[Recipe];

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'Recipe_userOid_mealType_idx' AND object_id = OBJECT_ID(N'dbo.Recipe'))
  DROP INDEX [Recipe_userOid_mealType_idx] ON [dbo].[Recipe];

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'Recipe_userOid_difficulty_idx' AND object_id = OBJECT_ID(N'dbo.Recipe'))
  DROP INDEX [Recipe_userOid_difficulty_idx] ON [dbo].[Recipe];

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'RecipeFavorite_userOid_createdAt_idx' AND object_id = OBJECT_ID(N'dbo.RecipeFavorite'))
  DROP INDEX [RecipeFavorite_userOid_createdAt_idx] ON [dbo].[RecipeFavorite];

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'Cookbook_userOid_createdAt_idx' AND object_id = OBJECT_ID(N'dbo.Cookbook'))
  DROP INDEX [Cookbook_userOid_createdAt_idx] ON [dbo].[Cookbook];

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'HistoryEvent_userOid_createdAt_idx' AND object_id = OBJECT_ID(N'dbo.HistoryEvent'))
  DROP INDEX [HistoryEvent_userOid_createdAt_idx] ON [dbo].[HistoryEvent];

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'User_email_idx' AND object_id = OBJECT_ID(N'dbo.[User]'))
  DROP INDEX [User_email_idx] ON [dbo].[User];

IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = N'RecipeFavorite_userOid_recipeId_key' AND parent_object_id = OBJECT_ID(N'dbo.RecipeFavorite'))
  ALTER TABLE [dbo].[RecipeFavorite] DROP CONSTRAINT [RecipeFavorite_userOid_recipeId_key];

IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = N'UserProfile_userOid_key' AND parent_object_id = OBJECT_ID(N'dbo.UserProfile'))
  ALTER TABLE [dbo].[UserProfile] DROP CONSTRAINT [UserProfile_userOid_key];

IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = N'UserLearningAggregate_pkey' AND parent_object_id = OBJECT_ID(N'dbo.UserLearningAggregate'))
  ALTER TABLE [dbo].[UserLearningAggregate] DROP CONSTRAINT [UserLearningAggregate_pkey];

ALTER TABLE [dbo].[UserLearningAggregate] ADD [userId] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[UserProfile] ADD [userId] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[IngredientInputSession] ADD [userId] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[Recipe] ADD [userId] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[RecipeGenerationAttempt] ADD [userId] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[RecipeFavorite] ADD [userId] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[Cookbook] ADD [userId] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[HistoryEvent] ADD [userId] NVARCHAR(1000) NULL;

-- SQL Server no reconoce columnas nuevas en el mismo lote que ALTER ADD; usar lote aparte vía SQL dinámico.
EXEC(N'UPDATE T SET T.[userId] = U.[id]
FROM [dbo].[UserLearningAggregate] AS T
INNER JOIN [dbo].[User] AS U ON T.[userOid] = U.[oid]');

EXEC(N'UPDATE T SET T.[userId] = U.[id]
FROM [dbo].[UserProfile] AS T
INNER JOIN [dbo].[User] AS U ON T.[userOid] = U.[oid]');

EXEC(N'UPDATE T SET T.[userId] = U.[id]
FROM [dbo].[IngredientInputSession] AS T
INNER JOIN [dbo].[User] AS U ON T.[userOid] = U.[oid]');

EXEC(N'UPDATE T SET T.[userId] = U.[id]
FROM [dbo].[Recipe] AS T
INNER JOIN [dbo].[User] AS U ON T.[userOid] = U.[oid]');

EXEC(N'UPDATE T SET T.[userId] = U.[id]
FROM [dbo].[RecipeGenerationAttempt] AS T
INNER JOIN [dbo].[User] AS U ON T.[userOid] = U.[oid]');

EXEC(N'UPDATE T SET T.[userId] = U.[id]
FROM [dbo].[RecipeFavorite] AS T
INNER JOIN [dbo].[User] AS U ON T.[userOid] = U.[oid]');

EXEC(N'UPDATE T SET T.[userId] = U.[id]
FROM [dbo].[Cookbook] AS T
INNER JOIN [dbo].[User] AS U ON T.[userOid] = U.[oid]');

EXEC(N'UPDATE T SET T.[userId] = U.[id]
FROM [dbo].[HistoryEvent] AS T
INNER JOIN [dbo].[User] AS U ON T.[userOid] = U.[oid]');

ALTER TABLE [dbo].[UserLearningAggregate] DROP COLUMN [userOid];
ALTER TABLE [dbo].[UserProfile] DROP COLUMN [userOid];
ALTER TABLE [dbo].[IngredientInputSession] DROP COLUMN [userOid];
ALTER TABLE [dbo].[Recipe] DROP COLUMN [userOid];
ALTER TABLE [dbo].[RecipeGenerationAttempt] DROP COLUMN [userOid];
ALTER TABLE [dbo].[RecipeFavorite] DROP COLUMN [userOid];
ALTER TABLE [dbo].[Cookbook] DROP COLUMN [userOid];
ALTER TABLE [dbo].[HistoryEvent] DROP COLUMN [userOid];

ALTER TABLE [dbo].[UserLearningAggregate] ALTER COLUMN [userId] NVARCHAR(1000) NOT NULL;

ALTER TABLE [dbo].[UserProfile] ALTER COLUMN [userId] NVARCHAR(1000) NOT NULL;

ALTER TABLE [dbo].[IngredientInputSession] ALTER COLUMN [userId] NVARCHAR(1000) NOT NULL;

ALTER TABLE [dbo].[Recipe] ALTER COLUMN [userId] NVARCHAR(1000) NOT NULL;

ALTER TABLE [dbo].[RecipeGenerationAttempt] ALTER COLUMN [userId] NVARCHAR(1000) NOT NULL;

ALTER TABLE [dbo].[RecipeFavorite] ALTER COLUMN [userId] NVARCHAR(1000) NOT NULL;

ALTER TABLE [dbo].[Cookbook] ALTER COLUMN [userId] NVARCHAR(1000) NOT NULL;

ALTER TABLE [dbo].[HistoryEvent] ALTER COLUMN [userId] NVARCHAR(1000) NOT NULL;

ALTER TABLE [dbo].[UserLearningAggregate] ADD CONSTRAINT [UserLearningAggregate_pkey] PRIMARY KEY CLUSTERED ([userId]);

IF COL_LENGTH('dbo.[User]', 'passwordHash') IS NULL
BEGIN
  ALTER TABLE [dbo].[User] ADD [passwordHash] NVARCHAR(255) NULL;
END

UPDATE [dbo].[User]
SET [email] = N'migrado-' + REPLACE(CAST([id] AS NVARCHAR(64)), N'-', N'') + N'@placeholder.local'
WHERE [email] IS NULL OR LTRIM(RTRIM([email])) = N'';

EXEC sp_executesql
  N'UPDATE [dbo].[User] SET [passwordHash] = @pwd WHERE [passwordHash] IS NULL',
  N'@pwd NVARCHAR(255)',
  @pwd = @placeholderPwd;

ALTER TABLE [dbo].[User] ALTER COLUMN [email] NVARCHAR(320) NOT NULL;

ALTER TABLE [dbo].[User] ALTER COLUMN [passwordHash] NVARCHAR(255) NOT NULL;

IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = N'User_oid_key' AND parent_object_id = OBJECT_ID(N'dbo.[User]'))
  ALTER TABLE [dbo].[User] DROP CONSTRAINT [User_oid_key];

ALTER TABLE [dbo].[User] DROP COLUMN [oid];

IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = N'User_authProvider_df' AND parent_object_id = OBJECT_ID(N'dbo.[User]'))
  ALTER TABLE [dbo].[User] DROP CONSTRAINT [User_authProvider_df];

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.[User]') AND name = N'authProvider')
  ALTER TABLE [dbo].[User] DROP COLUMN [authProvider];

IF NOT EXISTS (
  SELECT 1
  FROM sys.key_constraints
  WHERE name = N'User_email_key'
    AND parent_object_id = OBJECT_ID(N'dbo.[User]')
)
BEGIN
  ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email]);
END

ALTER TABLE [dbo].[UserProfile] ADD CONSTRAINT [UserProfile_userId_key] UNIQUE NONCLUSTERED ([userId]);

ALTER TABLE [dbo].[RecipeFavorite] ADD CONSTRAINT [RecipeFavorite_userId_recipeId_key] UNIQUE NONCLUSTERED ([userId],[recipeId]);

ALTER TABLE [dbo].[UserLearningAggregate] ADD CONSTRAINT [UserLearningAggregate_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE [dbo].[UserProfile] ADD CONSTRAINT [UserProfile_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE [dbo].[IngredientInputSession] ADD CONSTRAINT [IngredientInputSession_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE [dbo].[Recipe] ADD CONSTRAINT [Recipe_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE [dbo].[RecipeGenerationAttempt] ADD CONSTRAINT [RecipeGenerationAttempt_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE [dbo].[RecipeFavorite] ADD CONSTRAINT [RecipeFavorite_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE [dbo].[Cookbook] ADD CONSTRAINT [Cookbook_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE [dbo].[HistoryEvent] ADD CONSTRAINT [HistoryEvent_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE NONCLUSTERED INDEX [IngredientInputSession_userId_createdAt_idx] ON [dbo].[IngredientInputSession]([userId], [createdAt]);

CREATE NONCLUSTERED INDEX [Recipe_userId_createdAt_idx] ON [dbo].[Recipe]([userId], [createdAt]);

CREATE NONCLUSTERED INDEX [Recipe_userId_mealType_idx] ON [dbo].[Recipe]([userId], [mealType]);

CREATE NONCLUSTERED INDEX [Recipe_userId_difficulty_idx] ON [dbo].[Recipe]([userId], [difficulty]);

CREATE NONCLUSTERED INDEX [RecipeFavorite_userId_createdAt_idx] ON [dbo].[RecipeFavorite]([userId], [createdAt]);

CREATE NONCLUSTERED INDEX [Cookbook_userId_createdAt_idx] ON [dbo].[Cookbook]([userId], [createdAt]);

CREATE NONCLUSTERED INDEX [HistoryEvent_userId_createdAt_idx] ON [dbo].[HistoryEvent]([userId], [createdAt]);

COMMIT;

END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0 ROLLBACK TRAN;
  THROW;
END CATCH
