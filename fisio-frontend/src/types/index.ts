export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  role: "ADMIN" | "FISIOTERAPEUTA" | "RECEPCIONISTA" | "PACIENTE";
  createdAt: string;
  updatedAt: string;
}

export interface Paciente {
  id: string;
  usuarioId: string;
  cpf: string;
  dataNascimento: string;
  endereco: string;
  convenio: string;
  numeroConvenio?: string;
  historico?: string;
  usuario: Usuario;
  createdAt: string;
  updatedAt: string;
}

export interface Fisioterapeuta {
  id: string;
  usuarioId: string;
  crefito: string;
  especialidade: string;
  ativo: boolean;
  usuario: Usuario;
  createdAt: string;
  updatedAt: string;
}

export interface Recepcionista {
  id: string;
  usuarioId: string;
  ativo: boolean;
  usuario: Usuario;
  createdAt: string;
  updatedAt: string;
}

export interface Consulta {
  id: string;
  pacienteId: string;
  fisioterapeutaId: string;
  dataHora: string;
  duracao: number;
  status:
    | "AGENDADA"
    | "EM_ANDAMENTO"
    | "CONCLUIDA"
    | "CANCELADA"
    | "NAO_COMPARECEU";
  observacoes?: string;
  paciente: Paciente;
  fisioterapeuta: Fisioterapeuta;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: Usuario;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  role: "ADMIN" | "FISIOTERAPEUTA" | "RECEPCIONISTA";
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalPacientes: number;
  totalFisioterapeutas: number;
  totalConsultas: number;
  consultasHoje: number;
  consultasMes: number;
  consultasConcluidas: number;
  consultasCanceladas: number;
}

export interface FisioterapeutaStats {
  totalConsultas: number;
  consultasMes: number;
  consultasConcluidas: number;
  consultasCanceladas: number;
  pacientesUnicos: number;
}
