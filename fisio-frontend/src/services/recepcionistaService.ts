import { api } from "./api";
import { Recepcionista } from "@/types";

export interface UpdateRecepcionistaData {
  usuario?: {
    nome?: string;
    email?: string;
    telefone?: string;
  };
  ativo?: boolean;
}

export class RecepcionistaService {
  async list(): Promise<Recepcionista[]> {
    const response = await api.get<Recepcionista[]>("/api/recepcionistas");
    return response.data;
  }

  async getById(id: string): Promise<Recepcionista> {
    const response = await api.get<Recepcionista>(`/api/recepcionistas/${id}`);
    return response.data;
  }

  async update(
    id: string,
    data: UpdateRecepcionistaData
  ): Promise<Recepcionista> {
    const response = await api.put<Recepcionista>(
      `/api/recepcionistas/${id}`,
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/api/recepcionistas/${id}`);
  }
}

export const recepcionistaService = new RecepcionistaService();
export default recepcionistaService;
