export const pantry = {
  title: "Ideas to cook",
  loading: "Finding recipes that match your pantry…",
  loginPrompt:
    "Sign in to see suggestions from the recipes you’ve already saved.",
  loginCta: "Sign in",
  noDatabase:
    "Personalized suggestions will be available when your account is connected to recipe storage.",
  empty:
    "No saved recipes use those ingredients (or you don’t have saved recipes yet). Try different names or save recipes you cook with those ingredients.",
  error: "We couldn’t load suggestions right now. Try again in a moment.",
  successSubtitle:
    "Only saved recipes that list every ingredient you entered.",
  successSubtitleRelaxed:
    "No saved recipe includes all of them at once; showing ones that use at least part of your pantry list.",
} as const;
