import { Request, Response, NextFunction } from "express";
import { prisma } from "../database/prisma";
import { createError } from "../middlewares/errorHandler";
import bcrypt from "bcryptjs";

export const getAllPacientes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10, search, ativo = "true" } = req.query;

    const where: any = {};

    if (ativo !== "all") {
      where.ativo = ativo === "true";
    }

    if (search) {
      where.OR = [
        { nome: { contains: search as string, mode: "insensitive" } },
        { cpf: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [pacientes, total] = await Promise.all([
      prisma.paciente.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.paciente.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: pacientes,
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

export const getPacienteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const paciente = await prisma.paciente.findUnique({
      where: { id },
      include: {
        consultas: {
          include: {
            fisioterapeuta: {
              include: {
                usuario: true,
              },
            },
          },
          orderBy: { dataHora: "desc" },
        },
      },
    });

    if (!paciente) {
      throw createError("Paciente não encontrado", 404);
    }

    res.json({
      success: true,
      data: paciente,
    });
  } catch (error) {
    next(error);
  }
};

export const createPaciente = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nome, email, cpf, telefone, dataNascimento, convenio, historico } =
      req.body;

    // Verificar se CPF já existe
    const cpfExistente = await prisma.paciente.findUnique({
      where: { cpf },
    });

    if (cpfExistente) {
      throw createError("CPF já cadastrado", 400);
    }

    // Verificar se email já existe (se fornecido)
    if (email) {
      const emailExistente = await prisma.paciente.findUnique({
        where: { email },
      });

      if (emailExistente) {
        throw createError("Email já cadastrado", 400);
      }
    }

    const paciente = await prisma.paciente.create({
      data: {
        nome,
        email,
        cpf,
        telefone,
        dataNascimento: new Date(dataNascimento),
        convenio,
        historico,
      },
    });

    res.status(201).json({
      success: true,
      data: paciente,
      message: "Paciente criado com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

export const updatePaciente = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, dataNascimento, convenio, historico } =
      req.body;

    const pacienteExistente = await prisma.paciente.findUnique({
      where: { id },
    });

    if (!pacienteExistente) {
      throw createError("Paciente não encontrado", 404);
    }

    // Verificar se email já existe (se fornecido e diferente do atual)
    if (email && email !== pacienteExistente.email) {
      const emailExistente = await prisma.paciente.findUnique({
        where: { email },
      });

      if (emailExistente) {
        throw createError("Email já cadastrado", 400);
      }
    }

    const paciente = await prisma.paciente.update({
      where: { id },
      data: {
        nome,
        email,
        telefone,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
        convenio,
        historico,
      },
    });

    res.json({
      success: true,
      data: paciente,
      message: "Paciente atualizado com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

export const deletePaciente = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const pacienteExistente = await prisma.paciente.findUnique({
      where: { id },
    });

    if (!pacienteExistente) {
      throw createError("Paciente não encontrado", 404);
    }

    // Verificar se existem consultas futuras
    const consultasFuturas = await prisma.consulta.count({
      where: {
        pacienteId: id,
        dataHora: { gt: new Date() },
        status: { notIn: ["CANCELADA", "CONCLUIDA", "NAO_COMPARECEU"] },
      },
    });

    if (consultasFuturas > 0) {
      throw createError(
        "Não é possível excluir paciente com consultas agendadas",
        400
      );
    }

    await prisma.paciente.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const togglePacienteStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const paciente = await prisma.paciente.findUnique({
      where: { id },
    });

    if (!paciente) {
      throw createError("Paciente não encontrado", 404);
    }

    const pacienteAtualizado = await prisma.paciente.update({
      where: { id },
      data: { ativo: !paciente.ativo },
    });

    res.json({
      success: true,
      data: pacienteAtualizado,
      message: `Paciente ${
        pacienteAtualizado.ativo ? "ativado" : "desativado"
      } com sucesso`,
    });
  } catch (error) {
    next(error);
  }
};
