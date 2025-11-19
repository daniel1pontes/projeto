import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../database/prisma";
import { createError } from "../middlewares/errorHandler";
import {
  LoginInput,
  RegisterInput,
  ChangePasswordInput,
} from "../schemas/auth";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "fallback-refresh-secret";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

// Converter strings de tempo para segundos
const parseExpiresIn = (timeString: string): number => {
  if (timeString.endsWith("s")) return parseInt(timeString);
  if (timeString.endsWith("m")) return parseInt(timeString) * 60;
  if (timeString.endsWith("h")) return parseInt(timeString) * 3600;
  if (timeString.endsWith("d")) return parseInt(timeString) * 86400;
  return parseInt(timeString); // assume segundos se não tiver sufixo
};

export class AuthService {
  static async login(data: LoginInput) {
    const { email, senha } = data;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      throw createError("Email ou senha inválidos", 401);
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      throw createError("Email ou senha inválidos", 401);
    }

    // Buscar informações específicas do papel
    let perfil = null;
    if (usuario.papel === "FISIOTERAPEUTA") {
      perfil = await prisma.fisioterapeuta.findUnique({
        where: { usuarioId: usuario.id },
        select: {
          id: true,
          crefito: true,
          especialidade: true,
          ativo: true,
        },
      });
    } else if (usuario.papel === "RECEPCIONISTA") {
      perfil = await prisma.recepcionista.findUnique({
        where: { usuarioId: usuario.id },
        select: {
          id: true,
          ativo: true,
        },
      });
    }

    if (!perfil || !perfil.ativo) {
      throw createError("Usuário inativo", 401);
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        papel: usuario.papel,
        perfilId: perfil.id,
      },
      JWT_SECRET,
      { expiresIn: parseExpiresIn(JWT_EXPIRES_IN) }
    );

    const refreshToken = jwt.sign({ id: usuario.id }, REFRESH_TOKEN_SECRET, {
      expiresIn: parseExpiresIn(REFRESH_TOKEN_EXPIRES_IN),
    });

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        telefone: usuario.telefone,
        createdAt: usuario.createdAt,
      },
      perfil,
      token,
      refreshToken,
    };
  }

  static async register(data: RegisterInput) {
    const { nome, email, senha, telefone, papel, crefito, especialidade } =
      data;

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      throw createError("Email já cadastrado", 400);
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        telefone,
        papel,
      },
    });

    let perfil = null;
    if (papel === "FISIOTERAPEUTA") {
      perfil = await prisma.fisioterapeuta.create({
        data: {
          usuarioId: usuario.id,
          crefito: crefito!,
          especialidade: especialidade!,
          ativo: true,
        },
      });
    } else if (papel === "RECEPCIONISTA") {
      perfil = await prisma.recepcionista.create({
        data: {
          usuarioId: usuario.id,
          ativo: true,
        },
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        papel: usuario.papel,
        perfilId: perfil.id,
      },
      JWT_SECRET,
      { expiresIn: parseExpiresIn(JWT_EXPIRES_IN) }
    );

    const refreshToken = jwt.sign({ id: usuario.id }, REFRESH_TOKEN_SECRET, {
      expiresIn: parseExpiresIn(REFRESH_TOKEN_EXPIRES_IN),
    });

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        telefone: usuario.telefone,
        createdAt: usuario.createdAt,
      },
      perfil,
      token,
      refreshToken,
    };
  }

  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
        id: string;
      };

      const usuario = await prisma.usuario.findUnique({
        where: { id: decoded.id },
      });

      if (!usuario) {
        throw createError("Usuário não encontrado", 404);
      }

      // Buscar informações específicas do papel
      let perfil = null;
      if (usuario.papel === "FISIOTERAPEUTA") {
        perfil = await prisma.fisioterapeuta.findUnique({
          where: { usuarioId: usuario.id },
          select: {
            id: true,
            crefito: true,
            especialidade: true,
            ativo: true,
          },
        });
      } else if (usuario.papel === "RECEPCIONISTA") {
        perfil = await prisma.recepcionista.findUnique({
          where: { usuarioId: usuario.id },
          select: {
            id: true,
            ativo: true,
          },
        });
      }

      if (!perfil || !perfil.ativo) {
        throw createError("Usuário inativo", 401);
      }

      const newToken = jwt.sign(
        {
          id: usuario.id,
          email: usuario.email,
          papel: usuario.papel,
          perfilId: perfil.id,
        },
        JWT_SECRET,
        { expiresIn: parseExpiresIn(JWT_EXPIRES_IN) }
      );

      const newRefreshToken = jwt.sign(
        { id: usuario.id },
        REFRESH_TOKEN_SECRET,
        { expiresIn: parseExpiresIn(REFRESH_TOKEN_EXPIRES_IN) }
      );

      return {
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw createError("Refresh token inválido", 401);
    }
  }

  static async changePassword(userId: string, data: ChangePasswordInput) {
    const { senhaAtual, novaSenha } = data;

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw createError("Usuário não encontrado", 404);
    }

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaValida) {
      throw createError("Senha atual incorreta", 400);
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    await prisma.usuario.update({
      where: { id: userId },
      data: { senha: novaSenhaHash },
    });

    return { message: "Senha alterada com sucesso" };
  }

  static async getProfile(userId: string, papel: string) {
    let perfil = null;

    if (papel === "FISIOTERAPEUTA") {
      perfil = await prisma.fisioterapeuta.findUnique({
        where: { usuarioId: userId },
        include: {
          usuario: true,
        },
      });
    } else if (papel === "RECEPCIONISTA") {
      perfil = await prisma.recepcionista.findUnique({
        where: { usuarioId: userId },
        include: {
          usuario: true,
        },
      });
    }

    if (!perfil) {
      throw createError("Perfil não encontrado", 404);
    }

    return perfil;
  }

  static async updateProfile(userId: string, papel: string, data: any) {
    const { nome, email, telefone, crefito, especialidade } = data;

    // Verificar se email já existe (se fornecido e diferente do atual)
    if (email) {
      const emailExistente = await prisma.usuario.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });

      if (emailExistente) {
        throw createError("Email já cadastrado", 400);
      }
    }

    // Atualizar usuário
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: userId },
      data: {
        nome,
        email,
        telefone,
      },
    });

    // Atualizar informações específicas do papel
    let perfilAtualizado = null;
    if (papel === "FISIOTERAPEUTA") {
      // Verificar se CREFITO já existe (se fornecido)
      if (crefito) {
        const crefitoExistente = await prisma.fisioterapeuta.findFirst({
          where: {
            crefito,
            NOT: { usuarioId: userId },
          },
        });

        if (crefitoExistente) {
          throw createError("CREFITO já cadastrado", 400);
        }
      }

      perfilAtualizado = await prisma.fisioterapeuta.update({
        where: { usuarioId: userId },
        data: {
          crefito,
          especialidade,
        },
        include: {
          usuario: true,
        },
      });
    } else if (papel === "RECEPCIONISTA") {
      perfilAtualizado = await prisma.recepcionista.update({
        where: { usuarioId: userId },
        data: {},
        include: {
          usuario: true,
        },
      });
    }

    return perfilAtualizado;
  }
}
