import { api } from "./api";
import { Consulta, PaginationParams, PaginatedResponse } from "@/types";

export interface CreateConsultaData {
  pacienteId: string;
  fisioterapeutaId: string;
  dataHora: string;
  duracao: number;
  observacoes?: string;
}

export interface UpdateConsultaData extends Partial<CreateConsultaData> {
  status?:
    | "AGENDADA"
    | "EM_ANDAMENTO"
    | "CONCLUIDA"
    | "CANCELADA"
    | "NAO_COMPARECEU";
}

export interface ListConsultasParams extends PaginationParams {
  pacienteId?: string;
  fisioterapeutaId?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface ReagendarConsultaData {
  novaDataHora: string;
}

export class ConsultaService {
  async list(
    params: ListConsultasParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<Consulta>> {
    const response = await api.get<PaginatedResponse<Consulta>>(
      "/api/consultas",
      { params }
    );
    return response.data;
  }

  async getById(id: string): Promise<Consulta> {
    const response = await api.get<Consulta>(`/api/consultas/${id}`);
    return response.data;
  }

  async create(data: CreateConsultaData): Promise<Consulta> {
    const response = await api.post<Consulta>("/api/consultas", data);
    return response.data;
  }

  async update(id: string, data: UpdateConsultaData): Promise<Consulta> {
    const response = await api.put<Consulta>(`/api/consultas/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/api/consultas/${id}`);
  }

  async reagendar(id: string, data: ReagendarConsultaData): Promise<Consulta> {
    const response = await api.put<Consulta>(
      `/api/consultas/${id}/reagendar`,
      data
    );
    return response.data;
  }

  async getAgendaSemana(
    fisioterapeutaId?: string,
    dataInicio?: string
  ): Promise<Consulta[]> {
    const params: any = {};
    if (fisioterapeutaId) params.fisioterapeutaId = fisioterapeutaId;
    if (dataInicio) params.dataInicio = dataInicio;

    const response = await api.get<Consulta[]>("/api/consultas/agenda-semana", {
      params,
    });
    return response.data;
  }
}

export const consultaService = new ConsultaService();
export default consultaService;
