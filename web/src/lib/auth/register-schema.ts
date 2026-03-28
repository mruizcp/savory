import { z } from "zod";

export const registerBodySchema = z
  .object({
    email: z.string().trim().email("Introduce un correo válido."),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
    passwordConfirm: z.string(),
    displayName: z.string().trim().max(160).optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Las contraseñas no coinciden.",
    path: ["passwordConfirm"],
  });

export type RegisterBody = z.infer<typeof registerBodySchema>;
