BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [oid] NVARCHAR(128) NOT NULL,
    [email] NVARCHAR(320),
    [displayName] NVARCHAR(160),
    [authProvider] NVARCHAR(64) NOT NULL CONSTRAINT [User_authProvider_df] DEFAULT 'AZURE_AD_B2C',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [lastLoginAt] DATETIME2,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_oid_key] UNIQUE NONCLUSTERED ([oid])
);

-- CreateTable
CREATE TABLE [dbo].[UserLearningAggregate] (
    [userOid] NVARCHAR(128) NOT NULL,
    [payloadJson] NVARCHAR(4000) NOT NULL,
    [computedAt] DATETIME2 NOT NULL CONSTRAINT [UserLearningAggregate_computedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [UserLearningAggregate_pkey] PRIMARY KEY CLUSTERED ([userOid])
);

-- CreateTable
CREATE TABLE [dbo].[UserProfile] (
    [id] NVARCHAR(1000) NOT NULL,
    [userOid] NVARCHAR(128) NOT NULL,
    [cookingLevel] NVARCHAR(24) NOT NULL CONSTRAINT [UserProfile_cookingLevel_df] DEFAULT 'BEGINNER',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UserProfile_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [UserProfile_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserProfile_userOid_key] UNIQUE NONCLUSTERED ([userOid])
);

-- CreateTable
CREATE TABLE [dbo].[UserProfileDietaryRestriction] (
    [id] NVARCHAR(1000) NOT NULL,
    [profileId] NVARCHAR(1000) NOT NULL,
    [value] NVARCHAR(120) NOT NULL,
    CONSTRAINT [UserProfileDietaryRestriction_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserProfileDietaryRestriction_profileId_value_key] UNIQUE NONCLUSTERED ([profileId],[value])
);

-- CreateTable
CREATE TABLE [dbo].[IngredientCatalog] (
    [id] NVARCHAR(1000) NOT NULL,
    [nameNormalized] NVARCHAR(120) NOT NULL,
    [displayName] NVARCHAR(120) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [IngredientCatalog_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [IngredientCatalog_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [IngredientCatalog_nameNormalized_key] UNIQUE NONCLUSTERED ([nameNormalized])
);

-- CreateTable
CREATE TABLE [dbo].[IngredientAlias] (
    [id] NVARCHAR(1000) NOT NULL,
    [ingredientId] NVARCHAR(1000) NOT NULL,
    [aliasNormalized] NVARCHAR(120) NOT NULL,
    CONSTRAINT [IngredientAlias_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [IngredientAlias_ingredientId_aliasNormalized_key] UNIQUE NONCLUSTERED ([ingredientId],[aliasNormalized])
);

-- CreateTable
CREATE TABLE [dbo].[IngredientInputSession] (
    [id] NVARCHAR(1000) NOT NULL,
    [userOid] NVARCHAR(128) NOT NULL,
    [sourceType] NVARCHAR(24) NOT NULL,
    [imageUrl] NVARCHAR(1024),
    [storageProvider] NVARCHAR(80),
    [detectionProvider] NVARCHAR(80),
    [status] NVARCHAR(24) NOT NULL CONSTRAINT [IngredientInputSession_status_df] DEFAULT 'COMPLETED',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [IngredientInputSession_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [IngredientInputSession_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[IngredientInputItem] (
    [id] NVARCHAR(1000) NOT NULL,
    [sessionId] NVARCHAR(1000) NOT NULL,
    [ingredientId] NVARCHAR(1000),
    [rawName] NVARCHAR(120) NOT NULL,
    [normalizedName] NVARCHAR(120) NOT NULL,
    [origin] NVARCHAR(24) NOT NULL,
    [wasEdited] BIT NOT NULL CONSTRAINT [IngredientInputItem_wasEdited_df] DEFAULT 0,
    [confidence] DECIMAL(5,4),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [IngredientInputItem_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [IngredientInputItem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Recipe] (
    [id] NVARCHAR(1000) NOT NULL,
    [userOid] NVARCHAR(128) NOT NULL,
    [title] NVARCHAR(180) NOT NULL,
    [description] NVARCHAR(2000),
    [sourceType] NVARCHAR(24) NOT NULL,
    [generationType] NVARCHAR(24),
    [servings] INT,
    [totalMinutes] INT,
    [calories] INT,
    [difficulty] NVARCHAR(24),
    [mealType] NVARCHAR(40),
    [dietTagsCsv] NVARCHAR(400),
    [notes] NVARCHAR(2000),
    [utensilsText] NVARCHAR(1000),
    [aiProvider] NVARCHAR(80),
    [aiModel] NVARCHAR(120),
    [parentRecipeId] NVARCHAR(1000),
    [basedOnRecipeId] NVARCHAR(1000),
    [shareToken] NVARCHAR(64),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Recipe_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Recipe_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Recipe_shareToken_key] UNIQUE NONCLUSTERED ([shareToken])
);

-- CreateTable
CREATE TABLE [dbo].[RecipeStep] (
    [id] NVARCHAR(1000) NOT NULL,
    [recipeId] NVARCHAR(1000) NOT NULL,
    [stepNumber] INT NOT NULL,
    [instruction] NVARCHAR(2000) NOT NULL,
    CONSTRAINT [RecipeStep_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RecipeStep_recipeId_stepNumber_key] UNIQUE NONCLUSTERED ([recipeId],[stepNumber])
);

-- CreateTable
CREATE TABLE [dbo].[RecipeIngredient] (
    [id] NVARCHAR(1000) NOT NULL,
    [recipeId] NVARCHAR(1000) NOT NULL,
    [ingredientId] NVARCHAR(1000),
    [ingredientName] NVARCHAR(120) NOT NULL,
    [quantityText] NVARCHAR(64),
    [isMissing] BIT NOT NULL CONSTRAINT [RecipeIngredient_isMissing_df] DEFAULT 0,
    CONSTRAINT [RecipeIngredient_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RecipeGenerationAttempt] (
    [id] NVARCHAR(1000) NOT NULL,
    [userOid] NVARCHAR(128) NOT NULL,
    [recipeId] NVARCHAR(1000),
    [ingredientSessionId] NVARCHAR(1000),
    [promptVersion] NVARCHAR(64),
    [status] NVARCHAR(24) NOT NULL,
    [errorMessage] NVARCHAR(2000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RecipeGenerationAttempt_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [RecipeGenerationAttempt_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RecipeFavorite] (
    [id] NVARCHAR(1000) NOT NULL,
    [userOid] NVARCHAR(128) NOT NULL,
    [recipeId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RecipeFavorite_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [RecipeFavorite_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RecipeFavorite_userOid_recipeId_key] UNIQUE NONCLUSTERED ([userOid],[recipeId])
);

-- CreateTable
CREATE TABLE [dbo].[Cookbook] (
    [id] NVARCHAR(1000) NOT NULL,
    [userOid] NVARCHAR(128) NOT NULL,
    [name] NVARCHAR(120) NOT NULL,
    [description] NVARCHAR(500),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Cookbook_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Cookbook_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[CookbookRecipe] (
    [id] NVARCHAR(1000) NOT NULL,
    [cookbookId] NVARCHAR(1000) NOT NULL,
    [recipeId] NVARCHAR(1000) NOT NULL,
    [position] INT,
    [addedAt] DATETIME2 NOT NULL CONSTRAINT [CookbookRecipe_addedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [CookbookRecipe_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [CookbookRecipe_cookbookId_recipeId_key] UNIQUE NONCLUSTERED ([cookbookId],[recipeId])
);

-- CreateTable
CREATE TABLE [dbo].[HistoryEvent] (
    [id] NVARCHAR(1000) NOT NULL,
    [userOid] NVARCHAR(128) NOT NULL,
    [entityType] NVARCHAR(40) NOT NULL,
    [entityId] NVARCHAR(128),
    [actionType] NVARCHAR(40) NOT NULL,
    [summary] NVARCHAR(400) NOT NULL,
    [metadataText] NVARCHAR(4000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [HistoryEvent_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [HistoryEvent_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[UserProfileGoal] (
    [id] NVARCHAR(1000) NOT NULL,
    [profileId] NVARCHAR(1000) NOT NULL,
    [value] NVARCHAR(80) NOT NULL,
    CONSTRAINT [UserProfileGoal_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserProfileGoal_profileId_value_key] UNIQUE NONCLUSTERED ([profileId],[value])
);

-- CreateTable
CREATE TABLE [dbo].[UserProfileDislikedIngredient] (
    [id] NVARCHAR(1000) NOT NULL,
    [profileId] NVARCHAR(1000) NOT NULL,
    [value] NVARCHAR(120) NOT NULL,
    CONSTRAINT [UserProfileDislikedIngredient_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserProfileDislikedIngredient_profileId_value_key] UNIQUE NONCLUSTERED ([profileId],[value])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [User_email_idx] ON [dbo].[User]([email]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IngredientAlias_aliasNormalized_idx] ON [dbo].[IngredientAlias]([aliasNormalized]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IngredientInputSession_userOid_createdAt_idx] ON [dbo].[IngredientInputSession]([userOid], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IngredientInputItem_sessionId_idx] ON [dbo].[IngredientInputItem]([sessionId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IngredientInputItem_normalizedName_idx] ON [dbo].[IngredientInputItem]([normalizedName]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Recipe_userOid_createdAt_idx] ON [dbo].[Recipe]([userOid], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Recipe_title_idx] ON [dbo].[Recipe]([title]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Recipe_userOid_mealType_idx] ON [dbo].[Recipe]([userOid], [mealType]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Recipe_userOid_difficulty_idx] ON [dbo].[Recipe]([userOid], [difficulty]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [RecipeFavorite_userOid_createdAt_idx] ON [dbo].[RecipeFavorite]([userOid], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Cookbook_userOid_createdAt_idx] ON [dbo].[Cookbook]([userOid], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CookbookRecipe_cookbookId_position_idx] ON [dbo].[CookbookRecipe]([cookbookId], [position]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [HistoryEvent_userOid_createdAt_idx] ON [dbo].[HistoryEvent]([userOid], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [HistoryEvent_entityType_entityId_createdAt_idx] ON [dbo].[HistoryEvent]([entityType], [entityId], [createdAt]);

-- AddForeignKey
ALTER TABLE [dbo].[UserLearningAggregate] ADD CONSTRAINT [UserLearningAggregate_userOid_fkey] FOREIGN KEY ([userOid]) REFERENCES [dbo].[User]([oid]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserProfile] ADD CONSTRAINT [UserProfile_userOid_fkey] FOREIGN KEY ([userOid]) REFERENCES [dbo].[User]([oid]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserProfileDietaryRestriction] ADD CONSTRAINT [UserProfileDietaryRestriction_profileId_fkey] FOREIGN KEY ([profileId]) REFERENCES [dbo].[UserProfile]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[IngredientAlias] ADD CONSTRAINT [IngredientAlias_ingredientId_fkey] FOREIGN KEY ([ingredientId]) REFERENCES [dbo].[IngredientCatalog]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[IngredientInputSession] ADD CONSTRAINT [IngredientInputSession_userOid_fkey] FOREIGN KEY ([userOid]) REFERENCES [dbo].[User]([oid]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[IngredientInputItem] ADD CONSTRAINT [IngredientInputItem_sessionId_fkey] FOREIGN KEY ([sessionId]) REFERENCES [dbo].[IngredientInputSession]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[IngredientInputItem] ADD CONSTRAINT [IngredientInputItem_ingredientId_fkey] FOREIGN KEY ([ingredientId]) REFERENCES [dbo].[IngredientCatalog]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Recipe] ADD CONSTRAINT [Recipe_userOid_fkey] FOREIGN KEY ([userOid]) REFERENCES [dbo].[User]([oid]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Recipe] ADD CONSTRAINT [Recipe_parentRecipeId_fkey] FOREIGN KEY ([parentRecipeId]) REFERENCES [dbo].[Recipe]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Recipe] ADD CONSTRAINT [Recipe_basedOnRecipeId_fkey] FOREIGN KEY ([basedOnRecipeId]) REFERENCES [dbo].[Recipe]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RecipeStep] ADD CONSTRAINT [RecipeStep_recipeId_fkey] FOREIGN KEY ([recipeId]) REFERENCES [dbo].[Recipe]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RecipeIngredient] ADD CONSTRAINT [RecipeIngredient_recipeId_fkey] FOREIGN KEY ([recipeId]) REFERENCES [dbo].[Recipe]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RecipeIngredient] ADD CONSTRAINT [RecipeIngredient_ingredientId_fkey] FOREIGN KEY ([ingredientId]) REFERENCES [dbo].[IngredientCatalog]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RecipeGenerationAttempt] ADD CONSTRAINT [RecipeGenerationAttempt_userOid_fkey] FOREIGN KEY ([userOid]) REFERENCES [dbo].[User]([oid]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RecipeGenerationAttempt] ADD CONSTRAINT [RecipeGenerationAttempt_recipeId_fkey] FOREIGN KEY ([recipeId]) REFERENCES [dbo].[Recipe]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RecipeGenerationAttempt] ADD CONSTRAINT [RecipeGenerationAttempt_ingredientSessionId_fkey] FOREIGN KEY ([ingredientSessionId]) REFERENCES [dbo].[IngredientInputSession]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RecipeFavorite] ADD CONSTRAINT [RecipeFavorite_userOid_fkey] FOREIGN KEY ([userOid]) REFERENCES [dbo].[User]([oid]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RecipeFavorite] ADD CONSTRAINT [RecipeFavorite_recipeId_fkey] FOREIGN KEY ([recipeId]) REFERENCES [dbo].[Recipe]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Cookbook] ADD CONSTRAINT [Cookbook_userOid_fkey] FOREIGN KEY ([userOid]) REFERENCES [dbo].[User]([oid]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CookbookRecipe] ADD CONSTRAINT [CookbookRecipe_cookbookId_fkey] FOREIGN KEY ([cookbookId]) REFERENCES [dbo].[Cookbook]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CookbookRecipe] ADD CONSTRAINT [CookbookRecipe_recipeId_fkey] FOREIGN KEY ([recipeId]) REFERENCES [dbo].[Recipe]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[HistoryEvent] ADD CONSTRAINT [HistoryEvent_userOid_fkey] FOREIGN KEY ([userOid]) REFERENCES [dbo].[User]([oid]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserProfileGoal] ADD CONSTRAINT [UserProfileGoal_profileId_fkey] FOREIGN KEY ([profileId]) REFERENCES [dbo].[UserProfile]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserProfileDislikedIngredient] ADD CONSTRAINT [UserProfileDislikedIngredient_profileId_fkey] FOREIGN KEY ([profileId]) REFERENCES [dbo].[UserProfile]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
