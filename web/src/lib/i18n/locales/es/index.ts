import { auth } from "./auth";
import { cooking } from "./cooking";
import { common } from "./common";
import { home } from "./home";
import { ingredients } from "./ingredients";
import { landingPage } from "./landingPage";
import { language } from "./language";
import { layout } from "./layout";
import { nav } from "./nav";
import { pantry } from "./pantry";
import { recipeCard } from "./recipeCard";
import { recipeGeneration } from "./recipeGeneration";
import { recipeResults } from "./recipeResults";
import { recommendations } from "./recommendations";

export const es = {
  common,
  cooking,
  nav,
  layout,
  home,
  landingPage,
  ingredients,
  pantry,
  recipeCard,
  recipeGeneration,
  recipeResults,
  recommendations,
  auth,
  language,
} as const;
