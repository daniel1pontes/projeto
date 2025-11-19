import { api } from "./api";
import { DashboardStats } from "@/types";

export class DashboardService {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>("/api/dashboard/stats");
    return response.data;
  }

  async getRecentConsultas(limit: number = 5): Promise<any[]> {
    const response = await api.get<any[]>("/api/dashboard/recent-consultas", {
      params: { limit },
    });
    return response.data;
  }

  async getRecentPacientes(limit: number = 5): Promise<any[]> {
    const response = await api.get<any[]>("/api/dashboard/recent-pacientes", {
      params: { limit },
    });
    return response.data;
  }

  async getConsultasHoje(): Promise<any[]> {
    const response = await api.get<any[]>("/api/dashboard/consultas-hoje");
    return response.data;
  }

  async getConsultasSemana(): Promise<any[]> {
    const response = await api.get<any[]>("/api/dashboard/consultas-semana");
    return response.data;
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
