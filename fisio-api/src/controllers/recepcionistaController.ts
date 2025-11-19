import { Request, Response, NextFunction } from "express";
import { prisma } from "../database/prisma";
import { createError } from "../middlewares/errorHandler";
import bcrypt from "bcryptjs";

export const getAllRecepcionistas = async (
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
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [recepcionistas, total] = await Promise.all([
      prisma.recepcionista.findMany({
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
      prisma.recepcionista.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: recepcionistas,
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

export const getRecepcionistaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const recepcionista = await prisma.recepcionista.findUnique({
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

    if (!recepcionista) {
      throw createError("Recepcionista não encontrado", 404);
    }

    res.json({
      success: true,
      data: recepcionista,
    });
  } catch (error) {
    next(error);
  }
};

export const createRecepcionista = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nome, email, senha, telefone } = req.body;

    // Verificar se email já existe
    const emailExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (emailExistente) {
      throw createError("Email já cadastrado", 400);
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
        papel: "RECEPCIONISTA",
      },
    });

    // Criar recepcionista
    const recepcionista = await prisma.recepcionista.create({
      data: {
        usuarioId: usuario.id,
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
      data: recepcionista,
      message: "Recepcionista criado com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

export const updateRecepcionista = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone } = req.body;

    const recepcionistaExistente = await prisma.recepcionista.findUnique({
      where: { id },
      include: { usuario: true },
    });

    if (!recepcionistaExistente) {
      throw createError("Recepcionista não encontrado", 404);
    }

    // Verificar se email já existe (se fornecido e diferente do atual)
    if (email && email !== recepcionistaExistente.usuario.email) {
      const emailExistente = await prisma.usuario.findUnique({
        where: { email },
      });

      if (emailExistente) {
        throw createError("Email já cadastrado", 400);
      }
    }

    // Atualizar usuário
    await prisma.usuario.update({
      where: { id: recepcionistaExistente.usuarioId },
      data: {
        nome,
        email,
        telefone,
      },
    });

    const recepcionistaAtualizado = await prisma.recepcionista.findUnique({
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
      data: recepcionistaAtualizado,
      message: "Recepcionista atualizado com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRecepcionista = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const recepcionistaExistente = await prisma.recepcionista.findUnique({
      where: { id },
    });

    if (!recepcionistaExistente) {
      throw createError("Recepcionista não encontrado", 404);
    }

    // Excluir recepcionista e usuário
    await prisma.recepcionista.delete({
      where: { id },
    });

    await prisma.usuario.delete({
      where: { id: recepcionistaExistente.usuarioId },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const toggleRecepcionistaStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const recepcionista = await prisma.recepcionista.findUnique({
      where: { id },
    });

    if (!recepcionista) {
      throw createError("Recepcionista não encontrado", 404);
    }

    const recepcionistaAtualizado = await prisma.recepcionista.update({
      where: { id },
      data: { ativo: !recepcionista.ativo },
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
      data: recepcionistaAtualizado,
      message: `Recepcionista ${
        recepcionistaAtualizado.ativo ? "ativado" : "desativado"
      } com sucesso`,
    });
  } catch (error) {
    next(error);
  }
};
