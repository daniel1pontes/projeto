import { Request, Response, NextFunction } from "express";
import { prisma } from "../database/prisma";
import { createError } from "../middlewares/errorHandler";
import bcrypt from "bcryptjs";

export const getAllFisioterapeutas = async (
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
        {
          usuario: {
            nome: { contains: search as string, mode: "insensitive" },
          },
        },
        {
          usuario: {
            email: { contains: search as string, mode: "insensitive" },
          },
        },
        { crefito: { contains: search as string, mode: "insensitive" } },
        { especialidade: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [fisioterapeutas, total] = await Promise.all([
      prisma.fisioterapeuta.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.fisioterapeuta.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: fisioterapeutas,
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

export const getFisioterapeutaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const fisioterapeuta = await prisma.fisioterapeuta.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            createdAt: true,
          },
        },
        consultas: {
          include: {
            paciente: true,
          },
          orderBy: { dataHora: "desc" },
        },
      },
    });

    if (!fisioterapeuta) {
      throw createError("Fisioterapeuta não encontrado", 404);
    }

    res.json({
      success: true,
      data: fisioterapeuta,
    });
  } catch (error) {
    next(error);
  }
};

export const createFisioterapeuta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nome, email, senha, telefone, crefito, especialidade } = req.body;

    // Verificar se email já existe
    const emailExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (emailExistente) {
      throw createError("Email já cadastrado", 400);
    }

    // Verificar se CREFITO já existe
    const crefitoExistente = await prisma.fisioterapeuta.findUnique({
      where: { crefito },
    });

    if (crefitoExistente) {
      throw createError("CREFITO já cadastrado", 400);
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        telefone,
        papel: "FISIOTERAPEUTA",
      },
    });

    // Criar fisioterapeuta
    const fisioterapeuta = await prisma.fisioterapeuta.create({
      data: {
        usuarioId: usuario.id,
        crefito,
        especialidade,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            createdAt: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: fisioterapeuta,
      message: "Fisioterapeuta criado com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

export const updateFisioterapeuta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, crefito, especialidade } = req.body;

    const fisioterapeutaExistente = await prisma.fisioterapeuta.findUnique({
      where: { id },
      include: { usuario: true },
    });

    if (!fisioterapeutaExistente) {
      throw createError("Fisioterapeuta não encontrado", 404);
    }

    // Verificar se email já existe (se fornecido e diferente do atual)
    if (email && email !== fisioterapeutaExistente.usuario.email) {
      const emailExistente = await prisma.usuario.findUnique({
        where: { email },
      });

      if (emailExistente) {
        throw createError("Email já cadastrado", 400);
      }
    }

    // Verificar se CREFITO já existe (se fornecido e diferente do atual)
    if (crefito && crefito !== fisioterapeutaExistente.crefito) {
      const crefitoExistente = await prisma.fisioterapeuta.findUnique({
        where: { crefito },
      });

      if (crefitoExistente) {
        throw createError("CREFITO já cadastrado", 400);
      }
    }

    // Atualizar usuário e fisioterapeuta
    const [usuarioAtualizado] = await Promise.all([
      prisma.usuario.update({
        where: { id: fisioterapeutaExistente.usuarioId },
        data: {
          nome,
          email,
          telefone,
        },
      }),
      prisma.fisioterapeuta.update({
        where: { id },
        data: {
          crefito,
          especialidade,
        },
      }),
    ]);

    const fisioterapeutaAtualizado = await prisma.fisioterapeuta.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            createdAt: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: fisioterapeutaAtualizado,
      message: "Fisioterapeuta atualizado com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFisioterapeuta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const fisioterapeutaExistente = await prisma.fisioterapeuta.findUnique({
      where: { id },
    });

    if (!fisioterapeutaExistente) {
      throw createError("Fisioterapeuta não encontrado", 404);
    }

    // Verificar se existem consultas futuras
    const consultasFuturas = await prisma.consulta.count({
      where: {
        fisioterapeutaId: id,
        dataHora: { gt: new Date() },
        status: { notIn: ["CANCELADA", "CONCLUIDA", "NAO_COMPARECEU"] },
      },
    });

    if (consultasFuturas > 0) {
      throw createError(
        "Não é possível excluir fisioterapeuta com consultas agendadas",
        400
      );
    }

    // Excluir fisioterapeuta e usuário
    await prisma.fisioterapeuta.delete({
      where: { id },
    });

    await prisma.usuario.delete({
      where: { id: fisioterapeutaExistente.usuarioId },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const toggleFisioterapeutaStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const fisioterapeuta = await prisma.fisioterapeuta.findUnique({
      where: { id },
    });

    if (!fisioterapeuta) {
      throw createError("Fisioterapeuta não encontrado", 404);
    }

    const fisioterapeutaAtualizado = await prisma.fisioterapeuta.update({
      where: { id },
      data: { ativo: !fisioterapeuta.ativo },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            createdAt: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: fisioterapeutaAtualizado,
      message: `Fisioterapeuta ${
        fisioterapeutaAtualizado.ativo ? "ativado" : "desativado"
      } com sucesso`,
    });
  } catch (error) {
    next(error);
  }
};

export const getFisioterapeutasDisponiveis = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dataHora } = req.query;

    if (!dataHora) {
      throw createError("Data e hora são obrigatórias", 400);
    }

    const dataHoraConsulta = new Date(dataHora as string);

    // Buscar todos os fisioterapeutas ativos
    const todosFisioterapeutas = await prisma.fisioterapeuta.findMany({
      where: { ativo: true },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
      },
    });

    // Buscar fisioterapeutas com consulta no mesmo horário
    const fisioterapeutasOcupados = await prisma.consulta.findMany({
      where: {
        dataHora: {
          gte: new Date(dataHoraConsulta.getTime() - 30 * 60 * 1000), // 30 min antes
          lte: new Date(dataHoraConsulta.getTime() + 30 * 60 * 1000), // 30 min depois
        },
        status: { notIn: ["CANCELADA", "CONCLUIDA", "NAO_COMPARECEU"] },
      },
      select: {
        fisioterapeutaId: true,
      },
    });

    const fisioterapeutasOcupadosIds = new Set(
      fisioterapeutasOcupados.map((c: any) => c.fisioterapeutaId)
    );

    // Filtrar fisioterapeutas disponíveis
    const fisioterapeutasDisponiveis = todosFisioterapeutas.filter(
      (f: any) => !fisioterapeutasOcupadosIds.has(f.id)
    );

    res.json({
      success: true,
      data: fisioterapeutasDisponiveis,
    });
  } catch (error) {
    next(error);
  }
};
