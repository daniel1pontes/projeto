import { z } from "zod";

export const createRecepcionistaSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  email: z.string().email("Email inválido").max(100),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100),
  telefone: z
    .string()
    .regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos"),
});

export const updateRecepcionistaSchema = z.object({
  nome: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100)
    .optional(),
  email: z.string().email("Email inválido").max(100).optional(),
  telefone: z
    .string()
    .regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos")
    .optional(),
});

export const recepcionistaIdSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export const recepcionistaQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Página deve ser um número")
    .transform(Number)
    .optional()
    .default("1"),
  limit: z
    .string()
    .regex(/^\d+$/, "Limite deve ser um número")
    .transform(Number)
    .optional()
    .default("10"),
  search: z.string().optional(),
  ativo: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

export type CreateRecepcionistaInput = z.infer<
  typeof createRecepcionistaSchema
>;
export type UpdateRecepcionistaInput = z.infer<
  typeof updateRecepcionistaSchema
>;
export type RecepcionistaIdInput = z.infer<typeof recepcionistaIdSchema>;
export type RecepcionistaQueryInput = z.infer<typeof recepcionistaQuerySchema>;
