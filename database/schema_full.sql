/*
  App Recetas Inteligentes - Full SQL Schema (SQL Server / Azure SQL)
  Includes: users, profiles, ingredients, recipes, history, favorites, cookbooks.
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

/* =========================
   USERS & PROFILE
========================= */
CREATE TABLE dbo.Users (
  Id NVARCHAR(36) NOT NULL PRIMARY KEY,
  Oid NVARCHAR(128) NOT NULL UNIQUE,
  Email NVARCHAR(320) NULL,
  DisplayName NVARCHAR(160) NULL,
  AuthProvider NVARCHAR(64) NOT NULL CONSTRAINT DF_Users_AuthProvider DEFAULT ('AZURE_AD_B2C'),
  CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT (SYSUTCDATETIME()),
  UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT (SYSUTCDATETIME()),
  LastLoginAt DATETIME2 NULL
);
CREATE INDEX IX_Users_Email ON dbo.Users (Email);

CREATE TABLE dbo.UserProfiles (
  Id NVARCHAR(36) NOT NULL PRIMARY KEY,
  UserOid NVARCHAR(128) NOT NULL UNIQUE,
  CookingLevel NVARCHAR(24) NOT NULL CONSTRAINT DF_UserProfiles_CookingLevel DEFAULT ('BEGINNER'),
  CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_UserProfiles_CreatedAt DEFAULT (SYSUTCDATETIME()),
  UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_UserProfiles_UpdatedAt DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_UserProfiles_Users_UserOid FOREIGN KEY (UserOid) REFERENCES dbo.Users(Oid) ON DELETE CASCADE
);

CREATE TABLE dbo.UserProfileDietaryRestrictions (
  Id NVARCHAR(36) NOT NULL PRIMARY KEY,
  ProfileId NVARCHAR(36) NOT NULL,
  Value NVARCHAR(120) NOT NULL,
  CONSTRAINT FK_UserProfileDietaryRestrictions_UserProfiles_ProfileId
    FOREIGN KEY (ProfileId) REFERENCES dbo.UserProfiles(Id) ON DELETE CASCADE,
  CONSTRAINT UQ_UserProfileDietaryRestrictions UNIQUE (ProfileId, Value)
);

CREATE TABLE dbo.UserProfileGoals (
  Id NVARCHAR(36) NOT NULL PRIMARY KEY,
  ProfileId NVARCHAR(36) NOT NULL,
  Value NVARCHAR(80) NOT NULL,
  CONSTRAINT FK_UserProfileGoals_UserProfiles_ProfileId
    FOREIGN KEY (ProfileId) REFERENCES dbo.UserProfiles(Id) ON DELETE CASCADE,
  CONSTRAINT UQ_UserProfileGoals UNIQUE (ProfileId, Value)
);

CREATE TABLE dbo.UserProfileDislikedIngredients (
  Id NVARCHAR(36) NOT NULL PRIMARY KEY,
  ProfileId NVARCHAR(36) NOT NULL,
  Value NVARCHAR(120) NOT NULL,
  CONSTRAINT FK_UserProfileDislikedIngredients_UserProfiles_ProfileId
    FOREIGN KEY (ProfileId) REFERENCES dbo.UserProfiles(Id) ON DELETE CASCADE,
  CONSTRAINT UQ_UserProfileDislikedIngredients UNIQUE (ProfileId, Value)
);

/* =========================
   INGREDIENTS
========================= */
CREATE TABLE dbo.IngredientCatalog (
  Id NVARCHAR(36) NOT NULL PRIMARY KEY,
  NameNormalized NVARCHAR(120) NOT NULL UNIQUE,
  DisplayName NVARCHAR(120) NOT NULL,
  CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_IngredientCatalog_CreatedAt DEFAULT (SYSUTCDATETIME()),
  UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_IngredientCatalog_UpdatedAt DEFAULT (SYSUTCDATETIME())
);

CREATE TABLE dbo.IngredientAliases (
  Id NVARCHAR(36) NOT NULL PRIMARY KEY,
  IngredientId NVARCHAR(36) NOT NULL,
  AliasNormalized NVARCHAR(120) NOT NULL,
  CONSTRAINT FK_IngredientAliases_IngredientCatalog_IngredientId
    FOREIGN KEY (IngredientId) REFERENCES dbo.IngredientCatalog(Id) ON DELETE CASCADE,
  CONSTRAINT UQ_IngredientAliases UNIQUE (IngredientId, AliasNormalized)
);
CREATE INDEX IX_IngredientAliases_AliasNormalized ON dbo.IngredientAliases (AliasNormalized);

CREATE TABLE dbo.IngredientInputSessions (
  Id NVARCHAR(36) NOT NULL PRIMARY KEY,
  UserOid NVARCHAR(128) NOT NULL,
  SourceType NVARCHAR(24) NOT NULL, /* MANUAL | PHOTO */
  ImageUrl NVARCHAR(1024) NULL,
  StorageProvider NVARCHAR(80) NULL,
  DetectionProvider NVARCHAR(80) NULL,
  Status NVARCHAR(24) NOT NULL CONSTRAINT DF_IngredientInputSessions_Status DEFAULT ('COMPLETED'),
  CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_IngredientInputSessions_CreatedAt DEFAULT (SYSUTCDATETIME()),
  UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_IngredientInputSessions_UpdatedAt DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_IngredientInputSessions_Users_UserOid
    FOREIGN KEY (UserOid) REFERENCES dbo.Users(Oid) ON DELETE CASCADE
);
CREATE INDEX IX_IngredientInputSessions_UserOid_CreatedAt ON dbo.IngredientInputSessions (UserOid, CreatedAt);

CREATE TABLE dbo.IngredientInputItems (
  Id NVARCHAR(36) NOT NULL PRIMARY KEY,
  SessionId NVARCHAR(36) NOT NULL,
  IngredientId NVARCHAR(36) NULL,
  RawName NVARCHAR(120) NOT NULL,
  NormalizedName NVARCHAR(120) NOT NULL,
  Origin NVARCHAR(24) NOT NULL, /* DETECTED | MANUAL */
  WasEdited BIT NOT NULL CONSTRAINT DF_IngredientInputItems_WasEdited DEFAULT (0),
  Confidence DECIMAL(5,4) NULL,
  CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_IngredientInputItems_CreatedAt DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_IngredientInputItems_IngredientInputSessions_SessionId
    FOREIGN KEY (SessionId) REFERENCES dbo.IngredientInputSessions(Id) ON DELETE CASCADE,
  CONSTRAINT FK_IngredientInputItems_IngredientCatalog_IngredientId
    FOREIGN KEY (IngredientId) REFERENCES dbo.IngredientCatalog(Id)
);
CREATE INDEX IX_IngredientInputItems_SessionId ON dbo.IngredientInputItems (SessionId);
CREATE INDEX IX_IngredientInputItems_NormalizedName ON dbo.IngredientInputItems (NormalizedName);

/* =========================
   RECIPES
========================= */
CREATE TABLE dbo.Recipes (
  Id NVARCHAR(36) NOT NULL PRIMARY KEY,
  UserOid NVARCHAR(128) NOT NULL,
  Title NVARCHAR(180) NOT NULL,
  Description NVARCHAR(2000) NULL,
  SourceType NVARCHAR(24) NOT NULL, /* GENERATED | EXISTING | IMPORTED */
  GenerationType NVARCHAR(24) NULL, /* WITH_AVAILABLE | WITH_MISSING */
  Servings INT NULL,
  TotalMinutes INT NULL,
  Calories INT NULL,
  Difficulty NVARCHAR(24) NULL, /* EASY | MEDIUM | HARD */
  UtensilsText NVARCHAR(1000) NULL,
  AiProvider NVARCHAR(80) NULL,
  AiModel NVARCHAR(120) NULL,
  ParentRecipeId NVARCHAR(36) NULL,
  CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Recipes_CreatedAt DEFAULT (SYSUTCDATETIME()),
  UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Recipes_UpdatedAt DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_Recipes_Users_UserOid
    FOREIGN KEY (UserOid) REFERENCES dbo.Users(Oid) ON DELETE CASCADE,
  CONSTRAINT FK_Recipes_Recipes_ParentRecipeId
    FOREIGN KEY (ParentRecipeId) REFERENCES dbo.Recipes(Id)
);
CREATE INDEX IX_Recipes_UserOid_CreatedAt ON dbo.Recipes (UserOid, CreatedAt);
CREATE INDEX IX_Recipes_Title ON dbo.Recipes (Title);

CREATE TABLE dbo.RecipeSteps (
  Id NVARCHAR(36) NOT NULL PRIMARY KEY,
  RecipeId NVARCHAR(36) NOT NULL,
  StepNumber INT NOT NULL,
  Instruction NVARCHAR(2000) NOT NULL,
  CONSTRAINT FK_RecipeSteps_Recipes_RecipeId
    FOREIGN KEY (RecipeId) REFERENCES dbo.Recipes(Id) ON DELETE CASCADE,
  CONSTRAINT UQ_RecipeSteps UNIQUE (RecipeId, StepNumber)
);

CREATE TABLE dbo.RecipeIngredients (
  Id NVARCHAR(36) NOT NULL PRIMARY KEY,
  RecipeId NVARCHAR(36) NOT NULL,
  IngredientId NVARCHAR(36) NULL,
  IngredientName NVARCHAR(120) NOT NULL,
  QuantityText NVARCHAR(64) NULL,
  IsMissing BIT NOT NULL CONSTRAINT DF_RecipeIngredients_IsMissing DEFAULT (0),
  CONSTRAINT FK_RecipeIngredients_Recipes_RecipeId
    FOREIGN KEY (RecipeId) REFERENCES dbo.Recipes(Id) ON DELETE CASCADE,
  CONSTRAINT FK_RecipeIngredients_IngredientCatalog_IngredientId
    FOREIGN KEY (IngredientId) REFERENCES dbo.IngredientCatalog(Id)
);

CREATE TABLE dbo.RecipeGenerationAttempts (
  Id NVARCHAR(36) NOT NULL PRIMARY KEY,
  UserOid NVARCHAR(128) NOT NULL,
  RecipeId NVARCHAR(36) NULL,
  IngredientSessionId NVARCHAR(36) NULL,
  PromptVersion NVARCHAR(64) NULL,
  Status NVARCHAR(24) NOT NULL, /* SUCCESS | ERROR */
  ErrorMessage NVARCHAR(2000) NULL,
  CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_RecipeGenerationAttempts_CreatedAt DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_RecipeGenerationAttempts_Users_UserOid
    FOREIGN KEY (UserOid) REFERENCES dbo.Users(Oid),
  CONSTRAINT FK_RecipeGenerationAttempts_Recipes_RecipeId
    FOREIGN KEY (RecipeId) REFERENCES dbo.Recipes(Id),
  CONSTRAINT FK_RecipeGenerationAttempts_IngredientInputSessions_IngredientSessionId
    FOREIGN KEY (IngredientSessionId) REFERENCES dbo.IngredientInputSessions(Id)
);

/* =========================
   FAVORITES & COOKBOOKS
========================= */
CREATE TABLE dbo.RecipeFavorites (
  Id NVARCHAR(36) NOT NULL PRIMARY KEY,
  UserOid NVARCHAR(128) NOT NULL,
  RecipeId NVARCHAR(36) NOT NULL,
  CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_RecipeFavorites_CreatedAt DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_RecipeFavorites_Users_UserOid
    FOREIGN KEY (UserOid) REFERENCES dbo.Users(Oid),
  CONSTRAINT FK_RecipeFavorites_Recipes_RecipeId
    FOREIGN KEY (RecipeId) REFERENCES dbo.Recipes(Id) ON DELETE CASCADE,
  CONSTRAINT UQ_RecipeFavorites UNIQUE (UserOid, RecipeId)
);
CREATE INDEX IX_RecipeFavorites_UserOid_CreatedAt ON dbo.RecipeFavorites (UserOid, CreatedAt);

CREATE TABLE dbo.Cookbooks (
  Id NVARCHAR(36) NOT NULL PRIMARY KEY,
  UserOid NVARCHAR(128) NOT NULL,
  Name NVARCHAR(120) NOT NULL,
  Description NVARCHAR(500) NULL,
  CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Cookbooks_CreatedAt DEFAULT (SYSUTCDATETIME()),
  UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Cookbooks_UpdatedAt DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_Cookbooks_Users_UserOid
    FOREIGN KEY (UserOid) REFERENCES dbo.Users(Oid) ON DELETE CASCADE
);
CREATE INDEX IX_Cookbooks_UserOid_CreatedAt ON dbo.Cookbooks (UserOid, CreatedAt);

CREATE TABLE dbo.CookbookRecipes (
  Id NVARCHAR(36) NOT NULL PRIMARY KEY,
  CookbookId NVARCHAR(36) NOT NULL,
  RecipeId NVARCHAR(36) NOT NULL,
  Position INT NULL,
  AddedAt DATETIME2 NOT NULL CONSTRAINT DF_CookbookRecipes_AddedAt DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_CookbookRecipes_Cookbooks_CookbookId
    FOREIGN KEY (CookbookId) REFERENCES dbo.Cookbooks(Id) ON DELETE CASCADE,
  CONSTRAINT FK_CookbookRecipes_Recipes_RecipeId
    FOREIGN KEY (RecipeId) REFERENCES dbo.Recipes(Id),
  CONSTRAINT UQ_CookbookRecipes UNIQUE (CookbookId, RecipeId)
);
CREATE INDEX IX_CookbookRecipes_CookbookId_Position ON dbo.CookbookRecipes (CookbookId, Position);

/* =========================
   HISTORY / AUDIT
========================= */
CREATE TABLE dbo.HistoryEvents (
  Id NVARCHAR(36) NOT NULL PRIMARY KEY,
  UserOid NVARCHAR(128) NOT NULL,
  EntityType NVARCHAR(40) NOT NULL, /* PROFILE | INGREDIENTS | RECIPE | FAVORITE | COOKBOOK */
  EntityId NVARCHAR(128) NULL,
  ActionType NVARCHAR(40) NOT NULL, /* CREATED | UPDATED | DELETED | REGENERATED | SHARED */
  Summary NVARCHAR(400) NOT NULL,
  MetadataText NVARCHAR(4000) NULL,
  CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_HistoryEvents_CreatedAt DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_HistoryEvents_Users_UserOid
    FOREIGN KEY (UserOid) REFERENCES dbo.Users(Oid) ON DELETE CASCADE
);
CREATE INDEX IX_HistoryEvents_UserOid_CreatedAt ON dbo.HistoryEvents (UserOid, CreatedAt);
CREATE INDEX IX_HistoryEvents_EntityType_EntityId_CreatedAt ON dbo.HistoryEvents (EntityType, EntityId, CreatedAt);
