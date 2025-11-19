import { api } from "./api";
import { Paciente, PaginationParams, PaginatedResponse } from "@/types";

export interface CreatePacienteData {
  nome: string;
  cpf: string;
  dataNascimento: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  convenio?: string;
  numeroConvenio?: string;
  historico?: string;
}

export interface UpdatePacienteData extends Partial<CreatePacienteData> {}

export interface ListPacientesParams extends PaginationParams {
  search?: string;
  ativo?: boolean;
}

export class PacienteService {
  async list(
    params: ListPacientesParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<Paciente>> {
    const response = await api.get<PaginatedResponse<Paciente>>(
      "/api/pacientes",
      { params }
    );
    return response.data;
  }

  async getById(id: string): Promise<Paciente> {
    const response = await api.get<Paciente>(`/api/pacientes/${id}`);
    return response.data;
  }

  async create(data: CreatePacienteData): Promise<Paciente> {
    const response = await api.post<Paciente>("/api/pacientes", data);
    return response.data;
  }

  async update(id: string, data: UpdatePacienteData): Promise<Paciente> {
    const response = await api.put<Paciente>(`/api/pacientes/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/api/pacientes/${id}`);
  }

  async getConsultas(id: string): Promise<any[]> {
    const response = await api.get<any[]>(`/api/pacientes/${id}/consultas`);
    return response.data;
  }
}

export const pacienteService = new PacienteService();
export default pacienteService;
