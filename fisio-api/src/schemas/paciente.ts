import { z } from "zod";

export const createPacienteSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  email: z.string().email("Email inválido").max(100),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
  telefone: z
    .string()
    .regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos"),
  dataNascimento: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    return date < today;
  }, "Data de nascimento deve ser no passado"),
  convenio: z.string().optional(),
  historico: z.string().optional(),
});

export const updatePacienteSchema = z.object({
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
  dataNascimento: z
    .string()
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      return date < today;
    }, "Data de nascimento deve ser no passado")
    .optional(),
  convenio: z.string().optional(),
  historico: z.string().optional(),
});

export const pacienteIdSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export const pacienteQuerySchema = z.object({
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

export type CreatePacienteInput = z.infer<typeof createPacienteSchema>;
export type UpdatePacienteInput = z.infer<typeof updatePacienteSchema>;
export type PacienteIdInput = z.infer<typeof pacienteIdSchema>;
export type PacienteQueryInput = z.infer<typeof pacienteQuerySchema>;
