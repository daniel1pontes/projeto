import { prisma } from "../database/prisma";
import { createError } from "../middlewares/errorHandler";
import {
  CreatePacienteInput,
  UpdatePacienteInput,
  PacienteQueryInput,
} from "../schemas/paciente";

export class PacienteService {
  static async list(query: PacienteQueryInput) {
    const { page, limit, search, ativo } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { cpf: { contains: search, mode: "insensitive" } },
      ];
    }

    if (ativo !== undefined) {
      where.ativo = ativo;
    }

    const [pacientes, total] = await Promise.all([
      prisma.paciente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: "asc" },
      }),
      prisma.paciente.count({ where }),
    ]);

    return {
      pacientes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const paciente = await prisma.paciente.findUnique({
      where: { id },
    });

    if (!paciente) {
      throw createError("Paciente não encontrado", 404);
    }

    return paciente;
  }

  static async create(data: CreatePacienteInput) {
    const { nome, email, cpf, telefone, dataNascimento, convenio, historico } =
      data;

    // Verificar se CPF já existe
    const cpfExistente = await prisma.paciente.findUnique({
      where: { cpf },
    });

    if (cpfExistente) {
      throw createError("CPF já cadastrado", 400);
    }

    // Verificar se email já existe
    const emailExistente = await prisma.paciente.findUnique({
      where: { email },
    });

    if (emailExistente) {
      throw createError("Email já cadastrado", 400);
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
        ativo: true,
      },
    });

    return paciente;
  }

  static async update(id: string, data: UpdatePacienteInput) {
    const { nome, email, telefone, dataNascimento, convenio, historico } = data;

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

    return paciente;
  }

  static async delete(id: string) {
    const paciente = await prisma.paciente.findUnique({
      where: { id },
    });

    if (!paciente) {
      throw createError("Paciente não encontrado", 404);
    }

    // Verificar se existem consultas futuras
    const consultasFuturas = await prisma.consulta.count({
      where: {
        pacienteId: id,
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
        "Não é possível excluir paciente com consultas futuras agendadas",
        400
      );
    }

    await prisma.paciente.delete({
      where: { id },
    });

    return { message: "Paciente excluído com sucesso" };
  }

  static async toggleStatus(id: string) {
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

    return {
      message: `Paciente ${
        pacienteAtualizado.ativo ? "ativado" : "desativado"
      } com sucesso`,
      paciente: pacienteAtualizado,
    };
  }
}
