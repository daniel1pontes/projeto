import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../database/prisma";
import { createError } from "../middlewares/errorHandler";
import "../types/express";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      throw createError("Email e senha são obrigatórios", 400);
    }

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        fisioterapeuta: true,
        recepcionista: true,
      },
    });

    if (!usuario) {
      throw createError("Credenciais inválidas", 401);
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      throw createError("Credenciais inválidas", 401);
    }

    // Verificar se usuário está ativo
    if (usuario.fisioterapeuta && !usuario.fisioterapeuta.ativo) {
      throw createError("Usuário inativo", 401);
    }

    if (usuario.recepcionista && !usuario.recepcionista.ativo) {
      throw createError("Usuário inativo", 401);
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        papel: usuario.papel,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remover senha do response
    const { senha: _, ...usuarioSemSenha } = usuario;

    res.json({
      success: true,
      data: {
        usuario: usuarioSemSenha,
        token,
      },
      message: "Login realizado com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nome, email, senha, telefone, papel } = req.body;

    if (!nome || !email || !senha || !telefone || !papel) {
      throw createError("Todos os campos são obrigatórios", 400);
    }

    // Verificar se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
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
        papel,
      },
    });

    // Criar perfil específico baseado no papel
    if (papel === "FISIOTERAPEUTA") {
      await prisma.fisioterapeuta.create({
        data: {
          usuarioId: usuario.id,
          crefito: "PENDING", // Deverá ser atualizado depois
          especialidade: "A definir",
        },
      });
    } else if (papel === "RECEPCIONISTA") {
      await prisma.recepcionista.create({
        data: {
          usuarioId: usuario.id,
        },
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        papel: usuario.papel,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remover senha do response
    const { senha: _, ...usuarioSemSenha } = usuario;

    res.status(201).json({
      success: true,
      data: {
        usuario: usuarioSemSenha,
        token,
      },
      message: "Usuário criado com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore - req.user é adicionado pelo middleware de autenticação
    const userId = req.user.id;

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        fisioterapeuta: true,
        recepcionista: true,
      },
    });

    if (!usuario) {
      throw createError("Usuário não encontrado", 404);
    }

    // Remover senha do response
    const { senha: _, ...usuarioSemSenha } = usuario;

    res.json({
      success: true,
      data: usuarioSemSenha,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore - req.user é adicionado pelo middleware de autenticação
    const userId = req.user.id;
    const { nome, telefone } = req.body;

    const usuario = await prisma.usuario.update({
      where: { id: userId },
      data: {
        nome,
        telefone,
      },
      include: {
        fisioterapeuta: true,
        recepcionista: true,
      },
    });

    // Remover senha do response
    const { senha: _, ...usuarioSemSenha } = usuario;

    res.json({
      success: true,
      data: usuarioSemSenha,
      message: "Perfil atualizado com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore - req.user é adicionado pelo middleware de autenticação
    const userId = req.user.id;
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      throw createError("Senha atual e nova senha são obrigatórias", 400);
    }

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw createError("Usuário não encontrado", 404);
    }

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaValida) {
      throw createError("Senha atual incorreta", 401);
    }

    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha
    await prisma.usuario.update({
      where: { id: userId },
      data: { senha: novaSenhaHash },
    });

    res.json({
      success: true,
      message: "Senha alterada com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore - req.user é adicionado pelo middleware de autenticação
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userPapel = req.user.role;

    // Gerar novo token JWT
    const token = jwt.sign(
      {
        id: userId,
        email: userEmail,
        papel: userPapel,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      data: {
        token,
      },
      message: "Token renovado com sucesso",
    });
  } catch (error) {
    next(error);
  }
};
