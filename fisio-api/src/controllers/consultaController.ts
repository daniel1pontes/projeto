import { Request, Response, NextFunction } from "express";
import { prisma } from "../database/prisma";
import { createError } from "../middlewares/errorHandler";

export const getAllConsultas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      dataInicio,
      dataFim,
      pacienteId,
      fisioterapeutaId,
    } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (pacienteId) {
      where.pacienteId = pacienteId;
    }

    if (fisioterapeutaId) {
      where.fisioterapeutaId = fisioterapeutaId;
    }

    if (dataInicio || dataFim) {
      where.dataHora = {};
      if (dataInicio) {
        where.dataHora.gte = new Date(dataInicio as string);
      }
      if (dataFim) {
        where.dataHora.lte = new Date(dataFim as string);
      }
    }

    if (search) {
      where.OR = [
        {
          paciente: {
            nome: { contains: search as string, mode: "insensitive" },
          },
        },
        {
          paciente: {
            cpf: { contains: search as string, mode: "insensitive" },
          },
        },
        {
          fisioterapeuta: {
            usuario: {
              nome: { contains: search as string, mode: "insensitive" },
            },
          },
        },
        { observacoes: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [consultas, total] = await Promise.all([
      prisma.consulta.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              telefone: true,
            },
          },
          fisioterapeuta: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nome: true,
                  crefito: true,
                },
              },
            },
          },
        },
        orderBy: { dataHora: "desc" },
      }),
      prisma.consulta.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: consultas,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getConsultaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

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

    res.json({
      success: true,
      data: consulta,
    });
  } catch (error) {
    next(error);
  }
};

export const createConsulta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pacienteId, fisioterapeutaId, dataHora, observacoes } = req.body;

    // Verificar se paciente existe
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
    });

    if (!paciente) {
      throw createError("Paciente não encontrado", 404);
    }

    // Verificar se fisioterapeuta existe e está ativo
    const fisioterapeuta = await prisma.fisioterapeuta.findUnique({
      where: { id: fisioterapeutaId },
    });

    if (!fisioterapeuta || !fisioterapeuta.ativo) {
      throw createError("Fisioterapeuta não encontrado ou inativo", 404);
    }

    // Verificar se fisioterapeuta está disponível no horário
    const consultaExistente = await prisma.consulta.findFirst({
      where: {
        fisioterapeutaId,
        dataHora: {
          gte: new Date(new Date(dataHora).getTime() - 30 * 60 * 1000), // 30 min antes
          lte: new Date(new Date(dataHora).getTime() + 30 * 60 * 1000), // 30 min depois
        },
        status: { notIn: ["CANCELADA", "CONCLUIDA", "NAO_COMPARECEU"] },
      },
    });

    if (consultaExistente) {
      throw createError(
        "Fisioterapeuta já possui consulta agendada neste horário",
        400
      );
    }

    // Verificar se paciente já tem consulta no mesmo horário
    const pacienteConsultaExistente = await prisma.consulta.findFirst({
      where: {
        pacienteId,
        dataHora: {
          gte: new Date(new Date(dataHora).getTime() - 30 * 60 * 1000), // 30 min antes
          lte: new Date(new Date(dataHora).getTime() + 30 * 60 * 1000), // 30 min depois
        },
        status: { notIn: ["CANCELADA", "CONCLUIDA", "NAO_COMPARECEU"] },
      },
    });

    if (pacienteConsultaExistente) {
      throw createError(
        "Paciente já possui consulta agendada neste horário",
        400
      );
    }

    const consulta = await prisma.consulta.create({
      data: {
        pacienteId,
        fisioterapeutaId,
        dataHora: new Date(dataHora),
        observacoes,
        status: "AGENDADA",
      },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            telefone: true,
          },
        },
        fisioterapeuta: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                crefito: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: consulta,
      message: "Consulta agendada com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

export const updateConsulta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { dataHora, observacoes, status } = req.body;

    const consultaExistente = await prisma.consulta.findUnique({
      where: { id },
    });

    if (!consultaExistente) {
      throw createError("Consulta não encontrada", 404);
    }

    // Se estiver atualizando data/hora, verificar disponibilidade
    if (dataHora && dataHora !== consultaExistente.dataHora.toISOString()) {
      // Verificar se fisioterapeuta está disponível no novo horário
      const consultaExistenteFisio = await prisma.consulta.findFirst({
        where: {
          fisioterapeutaId: consultaExistente.fisioterapeutaId,
          dataHora: {
            gte: new Date(new Date(dataHora).getTime() - 30 * 60 * 1000),
            lte: new Date(new Date(dataHora).getTime() + 30 * 60 * 1000),
          },
          status: { notIn: ["CANCELADA", "CONCLUIDA", "NAO_COMPARECEU"] },
          id: { not: id }, // Excluir a consulta atual da verificação
        },
      });

      if (consultaExistenteFisio) {
        throw createError(
          "Fisioterapeuta já possui consulta agendada neste horário",
          400
        );
      }

      // Verificar se paciente já tem consulta no novo horário
      const pacienteConsultaExistente = await prisma.consulta.findFirst({
        where: {
          pacienteId: consultaExistente.pacienteId,
          dataHora: {
            gte: new Date(new Date(dataHora).getTime() - 30 * 60 * 1000),
            lte: new Date(new Date(dataHora).getTime() + 30 * 60 * 1000),
          },
          status: { notIn: ["CANCELADA", "CONCLUIDA", "NAO_COMPARECEU"] },
          id: { not: id },
        },
      });

      if (pacienteConsultaExistente) {
        throw createError(
          "Paciente já possui consulta agendada neste horário",
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
        paciente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            telefone: true,
          },
        },
        fisioterapeuta: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                crefito: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: consulta,
      message: "Consulta atualizada com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteConsulta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const consultaExistente = await prisma.consulta.findUnique({
      where: { id },
    });

    if (!consultaExistente) {
      throw createError("Consulta não encontrada", 404);
    }

    await prisma.consulta.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const cancelarConsulta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const consulta = await prisma.consulta.findUnique({
      where: { id },
    });

    if (!consulta) {
      throw createError("Consulta não encontrada", 404);
    }

    if (consulta.status === "CANCELADA") {
      throw createError("Consulta já está cancelada", 400);
    }

    if (consulta.status === "CONCLUIDA") {
      throw createError(
        "Não é possível cancelar uma consulta já concluída",
        400
      );
    }

    const consultaAtualizada = await prisma.consulta.update({
      where: { id },
      data: {
        status: "CANCELADA",
        observacoes: motivo
          ? `${motivo}\n\nObservações anteriores: ${consulta.observacoes || ""}`
          : consulta.observacoes,
      },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            telefone: true,
          },
        },
        fisioterapeuta: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                crefito: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: consultaAtualizada,
      message: "Consulta cancelada com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

export const concluirConsulta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { relatorio, evolucao } = req.body;

    const consulta = await prisma.consulta.findUnique({
      where: { id },
    });

    if (!consulta) {
      throw createError("Consulta não encontrada", 404);
    }

    if (consulta.status === "CONCLUIDA") {
      throw createError("Consulta já está concluída", 400);
    }

    if (consulta.status === "CANCELADA") {
      throw createError("Não é possível concluir uma consulta cancelada", 400);
    }

    const consultaAtualizada = await prisma.consulta.update({
      where: { id },
      data: {
        status: "CONCLUIDA",
        observacoes: `${
          consulta.observacoes || ""
        }\n\n--- Relatório ---\nRelatório: ${relatorio || ""}\nEvolução: ${
          evolucao || ""
        }`,
      },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            telefone: true,
          },
        },
        fisioterapeuta: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                crefito: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: consultaAtualizada,
      message: "Consulta concluída com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

export const getAgendaFisioterapeuta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fisioterapeutaId } = req.params;
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
      throw createError("Data início e data fim são obrigatórias", 400);
    }

    // Verificar se fisioterapeuta existe
    const fisioterapeuta = await prisma.fisioterapeuta.findUnique({
      where: { id: fisioterapeutaId },
    });

    if (!fisioterapeuta) {
      throw createError("Fisioterapeuta não encontrado", 404);
    }

    const consultas = await prisma.consulta.findMany({
      where: {
        fisioterapeutaId,
        dataHora: {
          gte: new Date(dataInicio as string),
          lte: new Date(dataFim as string),
        },
      },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            telefone: true,
          },
        },
      },
      orderBy: { dataHora: "asc" },
    });

    res.json({
      success: true,
      data: consultas,
    });
  } catch (error) {
    next(error);
  }
};

export const getAgendaPaciente = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pacienteId } = req.params;
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
      throw createError("Data início e data fim são obrigatórias", 400);
    }

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
          gte: new Date(dataInicio as string),
          lte: new Date(dataFim as string),
        },
      },
      include: {
        fisioterapeuta: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                crefito: true,
              },
            },
          },
        },
      },
      orderBy: { dataHora: "asc" },
    });

    res.json({
      success: true,
      data: consultas,
    });
  } catch (error) {
    next(error);
  }
};
