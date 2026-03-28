"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { RecipeFavoriteButton } from "@/components/recipes/recipe-favorite-button";
import { Button } from "@/components/ui/button";
import type { RecipeSearchSummary } from "@/lib/recipes/recipe-search-summary";
import {
  RECIPE_DIFFICULTY_FILTER,
  RECIPE_DIET_TAGS,
  RECIPE_MAX_MINUTES_PRESETS,
  RECIPE_MEAL_TYPES,
  parseDietTagsFromDb,
} from "@/lib/recipes/recipe-filter-constants";

type SearchApiResponse = {
  recipes?: RecipeSearchSummary[];
  persistenceAvailable?: boolean;
  error?: string;
};

const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: "Fácil",
  MEDIUM: "Media",
  HARD: "Difícil",
};

const selectClass =
  "mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-base outline-none ring-accent focus-visible:ring-2 sm:text-sm";

type Props = {
  /** Desde el servidor: evita un fetch innecesario si ya sabemos que no hay BD */
  persistenceAvailable: boolean;
};

export function RecipesSearchPageClient({
  persistenceAvailable: persistenceFromServer,
}: Props) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterMaxMinutes, setFilterMaxMinutes] = useState("");
  const [filterMealType, setFilterMealType] = useState("");
  const [filterDietTag, setFilterDietTag] = useState("");
  const [recipes, setRecipes] = useState<RecipeSearchSummary[]>([]);
  const [loading, setLoading] = useState(persistenceFromServer);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 320);
    return () => clearTimeout(t);
  }, [query]);

  const searchKey = useMemo(() => debounced, [debounced]);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        filterDifficulty ||
          filterMaxMinutes ||
          filterMealType ||
          filterDietTag,
      ),
    [
      filterDifficulty,
      filterMaxMinutes,
      filterMealType,
      filterDietTag,
    ],
  );

  const load = useCallback(async () => {
    if (!persistenceFromServer) {
      setLoading(false);
      setRecipes([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchKey) params.set("q", searchKey);
      if (filterDifficulty) params.set("difficulty", filterDifficulty);
      if (filterMaxMinutes) params.set("maxMinutes", filterMaxMinutes);
      if (filterMealType) params.set("mealType", filterMealType);
      if (filterDietTag) params.set("dietTag", filterDietTag);
      params.set("limit", "40");
      const res = await fetch(`/api/recipes/search?${params.toString()}`);
      const data = (await res.json()) as SearchApiResponse;
      if (!res.ok) {
        setError(data.error ?? "No se pudieron cargar las recetas.");
        return;
      }
      setRecipes(data.recipes ?? []);
    } catch {
      setError("Error de red.");
    } finally {
      setLoading(false);
    }
  }, [
    persistenceFromServer,
    searchKey,
    filterDifficulty,
    filterMaxMinutes,
    filterMealType,
    filterDietTag,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  function clearFilters() {
    setFilterDifficulty("");
    setFilterMaxMinutes("");
    setFilterMealType("");
    setFilterDietTag("");
  }

  if (!persistenceFromServer) {
    return (
      <div className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-50/60 p-6 text-sm leading-relaxed text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/25 dark:text-amber-50">
        <p className="font-medium">Búsqueda no disponible</p>
        <p className="mt-2 text-muted-foreground dark:text-amber-100/85">
          Configura{" "}
          <code className="font-mono text-[0.85rem]">DATABASE_URL</code> en el
          servidor para listar y buscar tus recetas guardadas.
        </p>
      </div>
    );
  }

  const emptyMessage =
    searchKey || hasActiveFilters
      ? "No hay recetas que coincidan con tu búsqueda o filtros. Prueba quitar filtros o otra palabra clave."
      : "Aún no tienes recetas guardadas. Genera ideas en Recetas y vuelve aquí cuando las hayas guardado.";

  return (
    <div className="mt-8 space-y-6">
      <div>
        <label className="text-sm font-medium" htmlFor="recipe-search">
          Buscar por título, descripción o ingrediente
        </label>
        <input
          id="recipe-search"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Ej: pollo, ensalada, pasta…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-base outline-none ring-accent focus-visible:ring-2 sm:text-sm"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Combina texto con los filtros de abajo. Deja el texto vacío para solo
          filtrar por tipo, tiempo o dieta.
        </p>
      </div>

      <fieldset className="space-y-3 rounded-2xl border border-border bg-card/40 p-4">
        <legend className="px-1 text-sm font-medium">Filtros</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground" htmlFor="filter-difficulty">
              Dificultad
            </label>
            <select
              id="filter-difficulty"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className={selectClass}
            >
              {RECIPE_DIFFICULTY_FILTER.map((o) => (
                <option key={o.value || "any"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground" htmlFor="filter-time">
              Tiempo máximo
            </label>
            <select
              id="filter-time"
              value={filterMaxMinutes}
              onChange={(e) => setFilterMaxMinutes(e.target.value)}
              className={selectClass}
            >
              {RECIPE_MAX_MINUTES_PRESETS.map((o) => (
                <option key={o.value || "any"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground" htmlFor="filter-meal">
              Tipo de comida
            </label>
            <select
              id="filter-meal"
              value={filterMealType}
              onChange={(e) => setFilterMealType(e.target.value)}
              className={selectClass}
            >
              <option value="">Cualquiera</option>
              {RECIPE_MEAL_TYPES.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground" htmlFor="filter-diet">
              Dieta / restricción
            </label>
            <select
              id="filter-diet"
              value={filterDietTag}
              onChange={(e) => setFilterDietTag(e.target.value)}
              className={selectClass}
            >
              <option value="">Cualquiera</option>
              {RECIPE_DIET_TAGS.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            className="text-xs sm:text-sm"
            onClick={clearFilters}
          >
            Limpiar filtros
          </Button>
        ) : null}
      </fieldset>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          className="text-xs sm:text-sm"
          onClick={() => void load()}
          disabled={loading}
        >
          Actualizar
        </Button>
        {loading ? (
          <span className="text-xs text-muted-foreground">Buscando…</span>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && recipes.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : null}

      {!loading && !error && recipes.length > 0 ? (
        <ul className="space-y-3">
          {recipes.map((r) => {
            const mealLabel = r.mealType
              ? RECIPE_MEAL_TYPES.find((m) => m.code === r.mealType)?.label
              : null;
            const dietLabels = parseDietTagsFromDb(r.dietTagsCsv)
              .map(
                (code) =>
                  RECIPE_DIET_TAGS.find((d) => d.code === code)?.label ?? code,
              )
              .filter(Boolean);

            return (
              <li
                key={r.id}
                className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/recetas/${r.id}`}
                    className="min-w-0 flex-1 text-base font-medium text-foreground hover:underline sm:text-sm"
                  >
                    {r.title}
                  </Link>
                  <RecipeFavoriteButton
                    recipeId={r.id}
                    initialFavorited={r.isFavorite}
                    variant="icon"
                    onChange={(fav) => {
                      setRecipes((prev) =>
                        prev.map((row) =>
                          row.id === r.id ? { ...row, isFavorite: fav } : row,
                        ),
                      );
                    }}
                  />
                </div>
                {mealLabel || dietLabels.length > 0 ? (
                  <p className="mt-2 flex flex-wrap gap-1.5">
                    {mealLabel ? (
                      <span className="inline-flex rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {mealLabel}
                      </span>
                    ) : null}
                    {dietLabels.map((label) => (
                      <span
                        key={label}
                        className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-50/80 px-2 py-0.5 text-[11px] font-medium text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                      >
                        {label}
                      </span>
                    ))}
                  </p>
                ) : null}
                {r.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {r.description}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  {r.totalMinutes != null ? `${r.totalMinutes} min` : "—"}
                  {r.difficulty && DIFFICULTY_LABEL[r.difficulty]
                    ? ` · ${DIFFICULTY_LABEL[r.difficulty]}`
                    : ""}
                  {" · "}
                  {new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(
                    new Date(r.updatedAt),
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
