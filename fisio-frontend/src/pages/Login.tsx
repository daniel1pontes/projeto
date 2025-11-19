import React, { useState } from "react";
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await login({ email: data.email, senha: data.senha });
      toast.success("Login realizado com sucesso!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao fazer login");
      toast.error("Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: "100%" }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              component="h1"
              variant="h4"
              color="primary"
              gutterBottom
            >
              FisioApp
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de Gerenciamento de Fisioterapia
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              autoFocus
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="senha"
              label="Senha"
              type="password"
              autoComplete="current-password"
              {...register("senha")}
              error={!!errors.senha}
              helperText={errors.senha?.message}
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              © 2024 FisioApp. Todos os direitos reservados.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
