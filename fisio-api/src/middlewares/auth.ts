import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../database/prisma";
import { createError } from "./errorHandler";

interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

interface AuthRequest extends Request {
  user?: DecodedToken;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw createError("Access token required", 401);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createError("JWT secret not configured", 500);
    }

    const decoded = jwt.verify(token, jwtSecret) as DecodedToken;

    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
      },
    });

    if (!user) {
      throw createError("User not found", 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.papel,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createError("Invalid token", 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError("Authentication required", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError("Insufficient permissions", 403));
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret) {
        const decoded = jwt.verify(token, jwtSecret) as DecodedToken;

        const user = await prisma.usuario.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            papel: true,
          },
        });

        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.papel,
          };
        }
      }
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};
