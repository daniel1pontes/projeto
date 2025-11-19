import { z } from "zod";

export const createConsultaSchema = z.object({
  pacienteId: z.string().uuid("ID do paciente inválido"),
  fisioterapeutaId: z.string().uuid("ID do fisioterapeuta inválido"),
  dataHora: z.string().min(1, "Data e hora são obrigatórias"),
  observacoes: z.string().optional(),
});

export const updateConsultaSchema = z.object({
  dataHora: z.string().min(1, "Data e hora são obrigatórias").optional(),
  observacoes: z.string().optional(),
  status: z
    .enum([
      "AGENDADA",
      "CONFIRMADA",
      "EM_ANDAMENTO",
      "CONCLUIDA",
      "CANCELADA",
      "NAO_COMPARECEU",
    ])
    .optional(),
});

export const consultaIdSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export const consultaQuerySchema = z.object({
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
  status: z
    .enum([
      "AGENDADA",
      "CONFIRMADA",
      "EM_ANDAMENTO",
      "CONCLUIDA",
      "CANCELADA",
      "NAO_COMPARECEU",
    ])
    .optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  pacienteId: z.string().uuid("ID do paciente inválido").optional(),
  fisioterapeutaId: z.string().uuid("ID do fisioterapeuta inválido").optional(),
});

export const cancelarConsultaSchema = z.object({
  motivo: z.string().min(1, "Motivo do cancelamento é obrigatório"),
});

export const concluirConsultaSchema = z.object({
  relatorio: z.string().min(1, "Relatório é obrigatório"),
  evolucao: z.string().optional(),
});

export const agendaFisioterapeutaSchema = z.object({
  fisioterapeutaId: z.string().uuid("ID do fisioterapeuta inválido"),
  dataInicio: z.string().min(1, "Data início é obrigatória"),
  dataFim: z.string().min(1, "Data fim é obrigatória"),
});

export const agendaPacienteSchema = z.object({
  pacienteId: z.string().uuid("ID do paciente inválido"),
  dataInicio: z.string().min(1, "Data início é obrigatória"),
  dataFim: z.string().min(1, "Data fim é obrigatória"),
});

export type CreateConsultaInput = z.infer<typeof createConsultaSchema>;
export type UpdateConsultaInput = z.infer<typeof updateConsultaSchema>;
export type ConsultaIdInput = z.infer<typeof consultaIdSchema>;
export type ConsultaQueryInput = z.infer<typeof consultaQuerySchema>;
export type CancelarConsultaInput = z.infer<typeof cancelarConsultaSchema>;
export type ConcluirConsultaInput = z.infer<typeof concluirConsultaSchema>;
export type AgendaFisioterapeutaInput = z.infer<
  typeof agendaFisioterapeutaSchema
>;
export type AgendaPacienteInput = z.infer<typeof agendaPacienteSchema>;
