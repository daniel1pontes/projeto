import { prisma } from "../database/prisma";
import { createError } from "../middlewares/errorHandler";
import {
  CreateConsultaInput,
  UpdateConsultaInput,
  ConsultaQueryInput,
  CancelarConsultaInput,
  ConcluirConsultaInput,
  AgendaFisioterapeutaInput,
  AgendaPacienteInput,
} from "../schemas/consulta";

export class ConsultaService {
  static async list(query: ConsultaQueryInput) {
    const {
      page,
      limit,
      search,
      status,
      dataInicio,
      dataFim,
      pacienteId,
      fisioterapeutaId,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { paciente: { nome: { contains: search, mode: "insensitive" } } },
        { fisioterapeuta: { nome: { contains: search, mode: "insensitive" } } },
        { observacoes: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (dataInicio || dataFim) {
      where.dataHora = {};
      if (dataInicio) {
        where.dataHora.gte = new Date(dataInicio);
      }
      if (dataFim) {
        where.dataHora.lte = new Date(dataFim);
      }
    }

    if (pacienteId) {
      where.pacienteId = pacienteId;
    }

    if (fisioterapeutaId) {
      where.fisioterapeutaId = fisioterapeutaId;
    }

    const [consultas, total] = await Promise.all([
      prisma.consulta.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataHora: "asc" },
        include: {
          paciente: true,
          fisioterapeuta: {
            include: {
              usuario: true,
            },
          },
        },
      }),
      prisma.consulta.count({ where }),
    ]);

    return {
      consultas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const consulta = await prisma.consulta.findUnique({
      where: { id },
      include: {
        paciente: true,
        fisioterapeuta: {
          include: {
            usuario: true,
          },
        },
      },
    });

    if (!consulta) {
      throw createError("Consulta não encontrada", 404);
    }

    return consulta;
  }

  static async create(data: CreateConsultaInput) {
    const { pacienteId, fisioterapeutaId, dataHora, observacoes } = data;

    // Verificar se paciente existe e está ativo
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
    });

    if (!paciente) {
      throw createError("Paciente não encontrado", 404);
    }

    if (!paciente.ativo) {
      throw createError("Paciente inativo", 400);
    }

    // Verificar se fisioterapeuta existe e está ativo
    const fisioterapeuta = await prisma.fisioterapeuta.findUnique({
      where: { id: fisioterapeutaId },
    });

    if (!fisioterapeuta) {
      throw createError("Fisioterapeuta não encontrado", 404);
    }

    if (!fisioterapeuta.ativo) {
      throw createError("Fisioterapeuta inativo", 400);
    }

    // Verificar se já existe consulta no mesmo horário
    const dataHoraConsulta = new Date(dataHora);
    const dataInicio = new Date(dataHoraConsulta.getTime() - 30 * 60000); // 30 min antes
    const dataFim = new Date(dataHoraConsulta.getTime() + 30 * 60000); // 30 min depois

    const consultaConflitante = await prisma.consulta.findFirst({
      where: {
        fisioterapeutaId,
        dataHora: {
          gte: dataInicio,
          lte: dataFim,
        },
        status: {
          notIn: ["CANCELADA"],
        },
      },
    });

    if (consultaConflitante) {
      throw createError(
        "Fisioterapeuta já possui consulta agendada neste horário",
        400
      );
    }

    // Verificar se paciente já tem consulta no mesmo horário
    const consultaPacienteConflitante = await prisma.consulta.findFirst({
      where: {
        pacienteId,
        dataHora: {
          gte: dataInicio,
          lte: dataFim,
        },
        status: {
          notIn: ["CANCELADA"],
        },
      },
    });

    if (consultaPacienteConflitante) {
      throw createError(
        "Paciente já possui consulta agendada neste horário",
        400
      );
    }

    const consulta = await prisma.consulta.create({
      data: {
        pacienteId,
        fisioterapeutaId,
        dataHora: dataHoraConsulta,
        observacoes,
        status: "AGENDADA",
      },
      include: {
        paciente: true,
        fisioterapeuta: {
          include: {
            usuario: true,
          },
        },
      },
    });

    return consulta;
  }

  static async update(id: string, data: UpdateConsultaInput) {
    const { dataHora, observacoes, status } = data;

    const consultaExistente = await prisma.consulta.findUnique({
      where: { id },
    });

    if (!consultaExistente) {
      throw createError("Consulta não encontrada", 404);
    }

    // Verificar se está tentando alterar horário de consulta já confirmada ou em andamento
    if (
      dataHora &&
      ["CONFIRMADA", "EM_ANDAMENTO"].includes(consultaExistente.status)
    ) {
      throw createError(
        "Não é possível alterar o horário de uma consulta confirmada ou em andamento",
        400
      );
    }

    // Se estiver alterando o horário, verificar conflitos
    if (dataHora) {
      const dataHoraConsulta = new Date(dataHora);
      const dataInicio = new Date(dataHoraConsulta.getTime() - 30 * 60000);
      const dataFim = new Date(dataHoraConsulta.getTime() + 30 * 60000);

      const consultaConflitante = await prisma.consulta.findFirst({
        where: {
          fisioterapeutaId: consultaExistente.fisioterapeutaId,
          dataHora: {
            gte: dataInicio,
            lte: dataFim,
          },
          status: {
            notIn: ["CANCELADA"],
          },
          NOT: { id },
        },
      });

      if (consultaConflitante) {
        throw createError(
          "Fisioterapeuta já possui consulta agendada neste horário",
          400
        );
      }
    }

    const consulta = await prisma.consulta.update({
      where: { id },
      data: {
        dataHora: dataHora ? new Date(dataHora) : undefined,
        observacoes,
        status,
      },
      include: {
        paciente: true,
        fisioterapeuta: {
          include: {
            usuario: true,
          },
        },
      },
    });

    return consulta;
  }

  static async delete(id: string) {
    const consulta = await prisma.consulta.findUnique({
      where: { id },
    });

    if (!consulta) {
      throw createError("Consulta não encontrada", 404);
    }

    // Só permite excluir consultas agendadas
    if (!["AGENDADA"].includes(consulta.status)) {
      throw createError("Só é possível excluir consultas agendadas", 400);
    }

    await prisma.consulta.delete({
      where: { id },
    });

    return { message: "Consulta excluída com sucesso" };
  }

  static async cancelar(id: string, data: CancelarConsultaInput) {
    const { motivo } = data;

    const consulta = await prisma.consulta.findUnique({
      where: { id },
    });

    if (!consulta) {
      throw createError("Consulta não encontrada", 404);
    }

    // Só permite cancelar consultas não concluídas
    if (["CONCLUIDA", "CANCELADA"].includes(consulta.status)) {
      throw createError(
        "Não é possível cancelar uma consulta já concluída ou cancelada",
        400
      );
    }

    const consultaAtualizada = await prisma.consulta.update({
      where: { id },
      data: {
        status: "CANCELADA",
        observacoes: consulta.observacoes
          ? `${consulta.observacoes}\n\nCANCELADA: ${motivo}`
          : `CANCELADA: ${motivo}`,
      },
      include: {
        paciente: true,
        fisioterapeuta: {
          include: {
            usuario: true,
          },
        },
      },
    });

    return consultaAtualizada;
  }

  static async concluir(id: string, data: ConcluirConsultaInput) {
    const { relatorio, evolucao } = data;

    const consulta = await prisma.consulta.findUnique({
      where: { id },
    });

    if (!consulta) {
      throw createError("Consulta não encontrada", 404);
    }

    // Só permite concluir consultas confirmadas ou em andamento
    if (!["CONFIRMADA", "EM_ANDAMENTO"].includes(consulta.status)) {
      throw createError(
        "Só é possível concluir consultas confirmadas ou em andamento",
        400
      );
    }

    const consultaAtualizada = await prisma.consulta.update({
      where: { id },
      data: {
        status: "CONCLUIDA",
        observacoes: consulta.observacoes
          ? `${consulta.observacoes}\n\nRELATÓRIO: ${relatorio}${
              evolucao ? `\nEVO LUÇÃO: ${evolucao}` : ""
            }`
          : `RELATÓRIO: ${relatorio}${
              evolucao ? `\nEVO LUÇÃO: ${evolucao}` : ""
            }`,
      },
      include: {
        paciente: true,
        fisioterapeuta: {
          include: {
            usuario: true,
          },
        },
      },
    });

    return consultaAtualizada;
  }

  static async getAgendaFisioterapeuta(data: AgendaFisioterapeutaInput) {
    const { fisioterapeutaId, dataInicio, dataFim } = data;

    // Verificar se fisioterapeuta existe
    const fisioterapeuta = await prisma.fisioterapeuta.findUnique({
      where: { id: fisioterapeutaId },
      include: {
        usuario: true,
      },
    });

    if (!fisioterapeuta) {
      throw createError("Fisioterapeuta não encontrado", 404);
    }

    const consultas = await prisma.consulta.findMany({
      where: {
        fisioterapeutaId,
        dataHora: {
          gte: new Date(dataInicio),
          lte: new Date(dataFim),
        },
      },
      orderBy: { dataHora: "asc" },
      include: {
        paciente: true,
      },
    });

    return {
      fisioterapeuta,
      periodo: {
        inicio: new Date(dataInicio),
        fim: new Date(dataFim),
      },
      consultas,
      total: consultas.length,
    };
  }

  static async getAgendaPaciente(data: AgendaPacienteInput) {
    const { pacienteId, dataInicio, dataFim } = data;

    // Verificar se paciente existe
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
    });

    if (!paciente) {
      throw createError("Paciente não encontrado", 404);
    }

    const consultas = await prisma.consulta.findMany({
      where: {
        pacienteId,
        dataHora: {
          gte: new Date(dataInicio),
          lte: new Date(dataFim),
        },
      },
      orderBy: { dataHora: "asc" },
      include: {
        fisioterapeuta: {
          include: {
            usuario: true,
          },
        },
      },
    });

    return {
      paciente,
      periodo: {
        inicio: new Date(dataInicio),
        fim: new Date(dataFim),
      },
      consultas,
      total: consultas.length,
    };
  }
}
