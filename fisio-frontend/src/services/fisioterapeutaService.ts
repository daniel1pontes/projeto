import { api } from "./api";
import { Fisioterapeuta, FisioterapeutaStats } from "@/types";

export interface UpdateFisioterapeutaData {
  usuario?: {
    nome?: string;
    email?: string;
    telefone?: string;
  };
  crefito?: string;
  especialidade?: string;
  ativo?: boolean;
}

export class FisioterapeutaService {
  async list(): Promise<Fisioterapeuta[]> {
    const response = await api.get<Fisioterapeuta[]>("/api/fisioterapeutas");
    return response.data;
  }

  async getById(id: string): Promise<Fisioterapeuta> {
    const response = await api.get<Fisioterapeuta>(
      `/api/fisioterapeutas/${id}`
    );
    return response.data;
  }

  async update(
    id: string,
    data: UpdateFisioterapeutaData
  ): Promise<Fisioterapeuta> {
    const response = await api.put<Fisioterapeuta>(
      `/api/fisioterapeutas/${id}`,
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/api/fisioterapeutas/${id}`);
  }

  async getConsultas(id: string): Promise<any[]> {
    const response = await api.get<any[]>(
      `/api/fisioterapeutas/${id}/consultas`
    );
    return response.data;
  }

  async getEstatisticas(id: string): Promise<FisioterapeutaStats> {
    const response = await api.get<FisioterapeutaStats>(
      `/api/fisioterapeutas/${id}/estatisticas`
    );
    return response.data;
  }
}

export const fisioterapeutaService = new FisioterapeutaService();
export default fisioterapeutaService;
