import { api } from "./api";

export interface RelatorioParams {
  type: string;
  startDate: string;
  endDate: string;
  format: "pdf" | "csv";
}

export interface RelatorioStats {
  totalPacientes: number;
  consultasMes: number;
  taxaComparecimento: number;
}

export class RelatorioService {
  async generateReport(params: RelatorioParams): Promise<Blob> {
    const response = await api.get("/api/relatorios/generate", {
      params,
      responseType: "blob",
    });
    return response.data as Blob;
  }

  async getStats(): Promise<RelatorioStats> {
    const response = await api.get<RelatorioStats>("/api/relatorios/stats");
    return response.data;
  }

  async getRelatorioPacientes(params: RelatorioParams): Promise<Blob> {
    const response = await api.get("/api/relatorios/pacientes", {
      params,
      responseType: "blob",
    });
    return response.data as Blob;
  }

  async getRelatorioConsultas(params: RelatorioParams): Promise<Blob> {
    const response = await api.get("/api/relatorios/consultas", {
      params,
      responseType: "blob",
    });
    return response.data as Blob;
  }

  async getRelatorioFaturamento(params: RelatorioParams): Promise<Blob> {
    const response = await api.get("/api/relatorios/faturamento", {
      params,
      responseType: "blob",
    });
    return response.data as Blob;
  }

  async getRelatorioEstatisticas(params: RelatorioParams): Promise<Blob> {
    const response = await api.get("/api/relatorios/estatisticas", {
      params,
      responseType: "blob",
    });
    return response.data as Blob;
  }

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

export const relatorioService = new RelatorioService();
export default relatorioService;
