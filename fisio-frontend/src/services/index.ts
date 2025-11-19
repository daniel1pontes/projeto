export { api } from "./api";
export { authService } from "./authService";
export { pacienteService } from "./pacienteService";
export { consultaService } from "./consultaService";
export { fisioterapeutaService } from "./fisioterapeutaService";
export { recepcionistaService } from "./recepcionistaService";
export { dashboardService } from "./dashboardService";
export { relatorioService } from "./relatorioService";

export type {
  CreatePacienteData,
  UpdatePacienteData,
  ListPacientesParams,
} from "./pacienteService";

export type {
  CreateConsultaData,
  UpdateConsultaData,
  ListConsultasParams,
  ReagendarConsultaData,
} from "./consultaService";

export type { UpdateFisioterapeutaData } from "./fisioterapeutaService";

export type { UpdateRecepcionistaData } from "./recepcionistaService";

export type { RelatorioParams, RelatorioStats } from "./relatorioService";
