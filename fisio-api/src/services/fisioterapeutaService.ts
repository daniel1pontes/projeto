import bcrypt from "bcryptjs";
import { prisma } from "../database/prisma";
import { createError } from "../middlewares/errorHandler";
import {
  CreateFisioterapeutaInput,
  UpdateFisioterapeutaInput,
  FisioterapeutaQueryInput,
  DisponibilidadeInput,
} from "../schemas/fisioterapeuta";

export class FisioterapeutaService {
  static async list(query: FisioterapeutaQueryInput) {
    const { page, limit, search, ativo } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { crefito: { contains: search, mode: "insensitive" } },
        { especialidade: { contains: search, mode: "insensitive" } },
      ];
    }

    if (ativo !== undefined) {
      where.ativo = ativo;
    }

    const [fisioterapeutas, total] = await Promise.all([
      prisma.fisioterapeuta.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: "asc" },
        include: {
          usuario: true,
        },
      }),
      prisma.fisioterapeuta.count({ where }),
    ]);

    return {
      fisioterapeutas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const fisioterapeuta = await prisma.fisioterapeuta.findUnique({
      where: { id },
      include: {
        usuario: true,
      },
    });

    if (!fisioterapeuta) {
      throw createError("Fisioterapeuta não encontrado", 404);
    }

    return fisioterapeuta;
  }

  static async create(data: CreateFisioterapeutaInput) {
    const { nome, email, senha, telefone, crefito, especialidade } = data;

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

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        telefone,
        papel: "FISIOTERAPEUTA",
      },
    });

    const fisioterapeuta = await prisma.fisioterapeuta.create({
      data: {
        usuarioId: usuario.id,
        crefito,
        especialidade,
        ativo: true,
      },
      include: {
        usuario: true,
      },
    });

    return fisioterapeuta;
  }

  static async update(id: string, data: UpdateFisioterapeutaInput) {
    const { nome, email, telefone, crefito, especialidade } = data;

    const fisioterapeutaExistente = await prisma.fisioterapeuta.findUnique({
      where: { id },
      include: {
        usuario: true,
      },
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

    // Atualizar usuário
    await prisma.usuario.update({
      where: { id: fisioterapeutaExistente.usuarioId },
      data: {
        nome,
        email,
        telefone,
      },
    });

    // Atualizar fisioterapeuta
    const fisioterapeuta = await prisma.fisioterapeuta.update({
      where: { id },
      data: {
        crefito,
        especialidade,
      },
      include: {
        usuario: true,
      },
    });

    return fisioterapeuta;
  }

  static async delete(id: string) {
    const fisioterapeuta = await prisma.fisioterapeuta.findUnique({
      where: { id },
      include: {
        usuario: true,
      },
    });

    if (!fisioterapeuta) {
      throw createError("Fisioterapeuta não encontrado", 404);
    }

    // Verificar se existem consultas futuras
    const consultasFuturas = await prisma.consulta.count({
      where: {
        fisioterapeutaId: id,
        dataHora: {
          gte: new Date(),
        },
        status: {
          notIn: ["CANCELADA", "CONCLUIDA"],
        },
      },
    });

    if (consultasFuturas > 0) {
      throw createError(
        "Não é possível excluir fisioterapeuta com consultas futuras agendadas",
        400
      );
    }

    // Excluir em ordem correta (fisioterapeuta primeiro, depois usuário)
    await prisma.fisioterapeuta.delete({
      where: { id },
    });

    await prisma.usuario.delete({
      where: { id: fisioterapeuta.usuarioId },
    });

    return { message: "Fisioterapeuta excluído com sucesso" };
  }

  static async toggleStatus(id: string) {
    const fisioterapeuta = await prisma.fisioterapeuta.findUnique({
      where: { id },
      include: {
        usuario: true,
      },
    });

    if (!fisioterapeuta) {
      throw createError("Fisioterapeuta não encontrado", 404);
    }

    const fisioterapeutaAtualizado = await prisma.fisioterapeuta.update({
      where: { id },
      data: { ativo: !fisioterapeuta.ativo },
      include: {
        usuario: true,
      },
    });

    return {
      message: `Fisioterapeuta ${
        fisioterapeutaAtualizado.ativo ? "ativado" : "desativado"
      } com sucesso`,
      fisioterapeuta: fisioterapeutaAtualizado,
    };
  }

  static async getDisponiveis(data: DisponibilidadeInput) {
    const { dataHora } = data;
    const dataHoraConsulta = new Date(dataHora);

    // Buscar todos os fisioterapeutas ativos
    const todosFisioterapeutas = await prisma.fisioterapeuta.findMany({
      where: { ativo: true },
      include: {
        usuario: true,
      },
    });

    // Buscar consultas no mesmo período (considerando 1 hora de margem)
    const dataInicio = new Date(dataHoraConsulta.getTime() - 30 * 60000); // 30 min antes
    const dataFim = new Date(dataHoraConsulta.getTime() + 30 * 60000); // 30 min depois

    const consultasNoPeriodo = await prisma.consulta.findMany({
      where: {
        dataHora: {
          gte: dataInicio,
          lte: dataFim,
        },
        status: {
          notIn: ["CANCELADA", "CONCLUIDA"],
        },
      },
      select: {
        fisioterapeutaId: true,
      },
    });

    // Filtrar fisioterapeutas disponíveis
    const fisioterapeutasOcupadosIds = new Set(
      consultasNoPeriodo.map((c: any) => c.fisioterapeutaId)
    );

    const fisioterapeutasDisponiveis = todosFisioterapeutas.filter(
      (f: any) => !fisioterapeutasOcupadosIds.has(f.id)
    );

    return {
      dataHora: dataHoraConsulta,
      disponiveis: fisioterapeutasDisponiveis,
      total: fisioterapeutasDisponiveis.length,
    };
  }
}
