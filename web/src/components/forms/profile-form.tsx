"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  COOKING_LEVEL_OPTIONS,
  DIETARY_RESTRICTION_OPTIONS,
  PROFILE_GOAL_OPTIONS,
  type UserProfileInput,
} from "@/features/profile";

type SaveResult = {
  ok: boolean;
  message: string;
};

type ProfileFormProps = {
  initialData: UserProfileInput;
  action: (prevState: SaveResult, formData: FormData) => Promise<SaveResult>;
};

const initialState: SaveResult = {
  ok: false,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-105 disabled:opacity-60 dark:hover:brightness-110"
    >
      {pending ? "Guardando..." : "Guardar perfil"}
    </button>
  );
}

export function ProfileForm({ initialData, action }: ProfileFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-6">
      <section className="rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Restricciones alimenticias
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DIETARY_RESTRICTION_OPTIONS.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="dietaryRestrictions"
                value={option}
                defaultChecked={initialData.dietaryRestrictions.includes(option)}
                className="size-4 rounded border-border"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border p-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold uppercase tracking-wide text-muted-foreground">
            Nivel de cocina
          </span>
          <select
            name="cookingLevel"
            defaultValue={initialData.cookingLevel}
            className="min-h-11 rounded-xl border border-border bg-background px-3 text-foreground"
          >
            {COOKING_LEVEL_OPTIONS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Objetivos
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {PROFILE_GOAL_OPTIONS.map((goal) => (
            <label key={goal} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="goals"
                value={goal}
                defaultChecked={initialData.goals.includes(goal)}
                className="size-4 rounded border-border"
              />
              <span>{goal}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border p-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold uppercase tracking-wide text-muted-foreground">
            Ingredientes no deseados
          </span>
          <textarea
            name="dislikedIngredients"
            rows={4}
            defaultValue={initialData.dislikedIngredients.join(", ")}
            placeholder="Ejemplo: cebolla, apio, aceitunas"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
          />
          <span className="text-xs text-muted-foreground">
            Sepáralos por coma.
          </span>
        </label>
      </section>

      <div className="flex flex-col gap-2">
        <SubmitButton />
        {state.message ? (
          <p
            className={state.ok ? "text-sm text-emerald-600" : "text-sm text-red-600"}
            role="status"
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
