import { useQuery, useMutation, useQueryClient } from "react-query";
import { authService } from "../services";
import { Usuario, LoginCredentials, RegisterData } from "../types";
import toast from "react-hot-toast";

export const useAuth = () => {
  const queryClient = useQueryClient();

  const loginMutation = useMutation(
    async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials);
      return response;
    },
    {
      onSuccess: (data) => {
        toast.success("Login realizado com sucesso!");
        queryClient.setQueryData("user", data.user);
      },
      onError: () => {
        toast.error("Erro ao fazer login. Verifique suas credenciais.");
      },
    }
  );

  const registerMutation = useMutation(
    async (userData: RegisterData) => {
      const response = await authService.register(userData);
      return response;
    },
    {
      onSuccess: () => {
        toast.success("Cadastro realizado com sucesso!");
      },
      onError: () => {
        toast.error("Erro ao fazer cadastro. Tente novamente.");
      },
    }
  );

  const logoutMutation = useMutation(
    async () => {
      await authService.logout();
    },
    {
      onSuccess: () => {
        toast.success("Logout realizado com sucesso!");
        queryClient.clear();
      },
    }
  );

  const { data: user, isLoading } = useQuery<Usuario>(
    "user",
    async (): Promise<Usuario> => {
      const response = await authService.getProfile();
      return response as Usuario;
    },
    {
      retry: false,
      onError: () => {
        // User is not authenticated
      },
    }
  );

  const isAuthenticated = !!user;

  const hasRole = (role: Usuario["role"]) => {
    return user?.role === role;
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    hasRole,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
  };
};
