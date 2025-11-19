import React from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Avatar,
} from "@mui/material";
import { Person, Save } from "@mui/icons-material";
import { useMutation, useQueryClient } from "react-query";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const perfilSchema = z
  .object({
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    telefone: z.string().min(1, "Telefone é obrigatório"),
    senhaAtual: z.string().optional(),
    novaSenha: z.string().optional(),
    confirmarSenha: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.novaSenha && data.novaSenha !== data.confirmarSenha) {
        return false;
      }
      return true;
    },
    {
      message: "Senhas não conferem",
      path: ["confirmarSenha"],
    }
  );

type PerfilFormData = z.infer<typeof perfilSchema>;

export const Perfil: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: user?.nome || "",
      email: user?.email || "",
      telefone: user?.telefone || "",
    },
  });

  const updateMutation = useMutation(
    async (data: PerfilFormData) => {
      const updateData: any = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
      };

      if (data.novaSenha && data.senhaAtual) {
        updateData.senhaAtual = data.senhaAtual;
        updateData.novaSenha = data.novaSenha;
      }

      const response = await api.put("/api/usuarios/perfil", updateData);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success("Perfil atualizado com sucesso!");
        queryClient.invalidateQueries("user");
        reset({
          ...reset,
          senhaAtual: "",
          novaSenha: "",
          confirmarSenha: "",
        });
      },
      onError: () => {
        toast.error("Erro ao atualizar perfil");
      },
    }
  );

  const onSubmit = (data: PerfilFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Meu Perfil
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Avatar sx={{ width: 100, height: 100, mx: "auto", mb: 2 }}>
              <Person sx={{ fontSize: 50 }} />
            </Avatar>
            <Typography variant="h6">{user?.nome}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.role}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Membro desde{" "}
              {new Date(user?.createdAt || "").toLocaleDateString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome"
                    {...register("nome")}
                    error={!!errors.nome}
                    helperText={errors.nome?.message}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    {...register("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    {...register("telefone")}
                    error={!!errors.telefone}
                    helperText={errors.telefone?.message}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                    Alterar Senha
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Senha Atual"
                    type="password"
                    {...register("senhaAtual")}
                    error={!!errors.senhaAtual}
                    helperText={errors.senhaAtual?.message}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Nova Senha"
                    type="password"
                    {...register("novaSenha")}
                    error={!!errors.novaSenha}
                    helperText={errors.novaSenha?.message}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Confirmar Nova Senha"
                    type="password"
                    {...register("confirmarSenha")}
                    error={!!errors.confirmarSenha}
                    helperText={errors.confirmarSenha?.message}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={updateMutation.isLoading}
                    sx={{ mt: 2 }}
                  >
                    {updateMutation.isLoading
                      ? "Salvando..."
                      : "Salvar Alterações"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
