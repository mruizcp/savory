import { z } from "zod";

export const recommendationSuggestionSchema = z.object({
  title: z.string().min(1).max(120),
  rationale: z.string().min(1).max(400),
  highlightIngredients: z.array(z.string().max(80)).min(1).max(10),
});

export const recommendationsOutputSchema = z.object({
  suggestions: z.array(recommendationSuggestionSchema).min(1).max(5),
});

export type RecommendationSuggestion = z.infer<
  typeof recommendationSuggestionSchema
>;
export type RecommendationsOutput = z.infer<typeof recommendationsOutputSchema>;
