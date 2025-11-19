import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = z
  .object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
    email: z.string().email("Email inválido").max(100),
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100),
    telefone: z
      .string()
      .regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos"),
    papel: z.enum(["FISIOTERAPEUTA", "RECEPCIONISTA"]),
    crefito: z.string().optional(),
    especialidade: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.papel === "FISIOTERAPEUTA" && !data.crefito) {
        return false;
      }
      return true;
    },
    {
      message: "CREFITO é obrigatório para fisioterapeutas",
      path: ["crefito"],
    }
  )
  .refine(
    (data) => {
      if (data.papel === "FISIOTERAPEUTA" && !data.especialidade) {
        return false;
      }
      return true;
    },
    {
      message: "Especialidade é obrigatória para fisioterapeutas",
      path: ["especialidade"],
    }
  );

export const updateProfileSchema = z.object({
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
  crefito: z.string().optional(),
  especialidade: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
    novaSenha: z
      .string()
      .min(6, "Nova senha deve ter pelo menos 6 caracteres")
      .max(100),
    confirmarNovaSenha: z
      .string()
      .min(1, "Confirmação da nova senha é obrigatória"),
  })
  .refine((data) => data.novaSenha === data.confirmarNovaSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarNovaSenha"],
  });

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token é obrigatório"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
