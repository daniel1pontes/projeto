import { prisma } from "../database/prisma";
import { createError } from "../middlewares/errorHandler";

export interface CreateRecepcionistaData {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
}

export interface UpdateRecepcionistaData {
  nome?: string;
  email?: string;
  telefone?: string;
  ativo?: boolean;
}

export interface ListRecepcionistasParams {
  page?: number;
  limit?: number;
  search?: string;
  ativo?: boolean;
}

export class RecepcionistaService {
  async list(params: ListRecepcionistasParams = {}) {
    const { page = 1, limit = 10, search, ativo } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (ativo !== undefined) {
      where.ativo = ativo;
    }

    if (search) {
      where.usuario = {
        nome: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    const [recepcionistas, total] = await Promise.all([
      prisma.recepcionista.findMany({
        where,
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
        orderBy: {
          usuario: {
            nome: "asc",
          },
        },
        skip,
        take: limit,
      }),
      prisma.recepcionista.count({ where }),
    ]);

    return {
      data: recepcionistas,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: CreateRecepcionistaData) {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (usuarioExistente) {
      throw createError("Email já cadastrado", 400);
    }

    const usuario = await prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        telefone: data.telefone,
        papel: "RECEPCIONISTA",
      },
    });

    const recepcionista = await prisma.recepcionista.create({
      data: {
        usuarioId: usuario.id,
        ativo: true,
      },
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

    return recepcionista;
  }

  async findById(id: string) {
    const recepcionista = await prisma.recepcionista.findUnique({
      where: { id },
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

    if (!recepcionista) {
      throw createError("Recepcionista não encontrado", 404);
    }

    return recepcionista;
  }

  async update(id: string, data: UpdateRecepcionistaData) {
    const recepcionista = await prisma.recepcionista.findUnique({
      where: { id },
    });

    if (!recepcionista) {
      throw createError("Recepcionista não encontrado", 404);
    }

    const updateData: any = {};

    if (data.nome || data.email || data.telefone) {
      const usuarioUpdateData: any = {};

      if (data.nome) usuarioUpdateData.nome = data.nome;
      if (data.email) usuarioUpdateData.email = data.email;
      if (data.telefone) usuarioUpdateData.telefone = data.telefone;

      if (data.email) {
        const emailExistente = await prisma.usuario.findFirst({
          where: {
            email: data.email,
            id: { not: recepcionista.usuarioId },
          },
        });

        if (emailExistente) {
          throw createError("Email já cadastrado", 400);
        }
      }

      await prisma.usuario.update({
        where: { id: recepcionista.usuarioId },
        data: usuarioUpdateData,
      });
    }

    if (data.ativo !== undefined) {
      updateData.ativo = data.ativo;
    }

    const recepcionistaAtualizado = await prisma.recepcionista.update({
      where: { id },
      data: updateData,
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

    return recepcionistaAtualizado;
  }

  async delete(id: string) {
    const recepcionista = await prisma.recepcionista.findUnique({
      where: { id },
    });

    if (!recepcionista) {
      throw createError("Recepcionista não encontrado", 404);
    }

    // Soft delete - apenas desativa o recepcionista
    await prisma.recepcionista.update({
      where: { id },
      data: { ativo: false },
    });

    return { message: "Recepcionista desativado com sucesso" };
  }

  async hardDelete(id: string) {
    const recepcionista = await prisma.recepcionista.findUnique({
      where: { id },
    });

    if (!recepcionista) {
      throw createError("Recepcionista não encontrado", 404);
    }

    await prisma.recepcionista.delete({
      where: { id },
    });

    await prisma.usuario.delete({
      where: { id: recepcionista.usuarioId },
    });

    return { message: "Recepcionista excluído permanentemente" };
  }
}
