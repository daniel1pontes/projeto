import { z } from "zod";

export const createFisioterapeutaSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  email: z.string().email("Email inválido").max(100),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100),
  telefone: z
    .string()
    .regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos"),
  crefito: z.string().min(1, "CREFITO é obrigatório"),
  especialidade: z.string().min(1, "Especialidade é obrigatória"),
});

export const updateFisioterapeutaSchema = z.object({
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
  crefito: z.string().min(1, "CREFITO é obrigatório").optional(),
  especialidade: z.string().min(1, "Especialidade é obrigatória").optional(),
});

export const fisioterapeutaIdSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export const fisioterapeutaQuerySchema = z.object({
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

export const disponibilidadeSchema = z.object({
  dataHora: z.string().min(1, "Data e hora são obrigatórias"),
});

export type CreateFisioterapeutaInput = z.infer<
  typeof createFisioterapeutaSchema
>;
export type UpdateFisioterapeutaInput = z.infer<
  typeof updateFisioterapeutaSchema
>;
export type FisioterapeutaIdInput = z.infer<typeof fisioterapeutaIdSchema>;
export type FisioterapeutaQueryInput = z.infer<
  typeof fisioterapeutaQuerySchema
>;
export type DisponibilidadeInput = z.infer<typeof disponibilidadeSchema>;
