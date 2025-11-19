import { api } from "./api";
import { AuthResponse, LoginCredentials, RegisterData, Usuario } from "@/types";

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/api/auth/login",
      credentials
    );
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/auth/register", data);
    return response.data;
  }

  async getProfile(): Promise<Usuario> {
    const response = await api.get<Usuario>("/api/auth/profile");
    return response.data;
  }

  async updateProfile(data: Partial<Usuario>): Promise<Usuario> {
    const response = await api.put<Usuario>("/api/auth/profile", data);
    return response.data;
  }

  async changePassword(data: {
    senhaAtual: string;
    novaSenha: string;
  }): Promise<void> {
    await api.put("/api/auth/change-password", data);
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  getUser(): Usuario | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  setToken(token: string): void {
    localStorage.setItem("token", token);
  }

  setUser(user: Usuario): void {
    localStorage.setItem("user", JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getUser();
    return user ? roles.includes(user.role) : false;
  }
}

export const authService = new AuthService();
export default authService;
