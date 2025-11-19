import { Request, Response, NextFunction } from "express";
import { createError } from "./errorHandler";

interface ValidationRule {
  field: string;
  rules: string[];
  message?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validate = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Record<string, string> = {};

    for (const rule of rules) {
      const value = req.body[rule.field];
      const fieldErrors: string[] = [];

      for (const validation of rule.rules) {
        if (
          validation === "required" &&
          (!value || value.toString().trim() === "")
        ) {
          fieldErrors.push(`${rule.field} is required`);
        }

        if (
          validation === "email" &&
          value &&
          !isValidEmail(value.toString())
        ) {
          fieldErrors.push(`${rule.field} must be a valid email`);
        }

        if (validation.startsWith("min:")) {
          const minLength = parseInt(validation.split(":")[1]);
          if (value && value.toString().length < minLength) {
            fieldErrors.push(
              `${rule.field} must be at least ${minLength} characters`
            );
          }
        }

        if (validation.startsWith("max:")) {
          const maxLength = parseInt(validation.split(":")[1]);
          if (value && value.toString().length > maxLength) {
            fieldErrors.push(
              `${rule.field} must not exceed ${maxLength} characters`
            );
          }
        }

        if (
          validation === "strong" &&
          value &&
          !isStrongPassword(value.toString())
        ) {
          fieldErrors.push(
            `${rule.field} must contain at least 8 characters, one uppercase, one lowercase, one number and one special character`
          );
        }

        if (validation.startsWith("regex:")) {
          const pattern = validation.split(":")[1];
          if (value && !new RegExp(pattern).test(value.toString())) {
            fieldErrors.push(`${rule.field} format is invalid`);
          }
        }
      }

      if (fieldErrors.length > 0) {
        errors[rule.field] = fieldErrors.join(", ");
      }
    }

    if (Object.keys(errors).length > 0) {
      return next(createError("Validation failed", 400));
    }

    next();
  };
};

export const validateQuery = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Record<string, string> = {};

    for (const rule of rules) {
      const value = req.query[rule.field];
      const fieldErrors: string[] = [];

      for (const validation of rule.rules) {
        if (
          validation === "required" &&
          (!value || value.toString().trim() === "")
        ) {
          fieldErrors.push(`${rule.field} is required`);
        }

        if (
          validation === "number" &&
          value &&
          isNaN(Number(value.toString()))
        ) {
          fieldErrors.push(`${rule.field} must be a number`);
        }

        if (validation.startsWith("min:")) {
          const minValue = parseInt(validation.split(":")[1]);
          if (value && Number(value.toString()) < minValue) {
            fieldErrors.push(`${rule.field} must be at least ${minValue}`);
          }
        }

        if (validation.startsWith("max:")) {
          const maxValue = parseInt(validation.split(":")[1]);
          if (value && Number(value.toString()) > maxValue) {
            fieldErrors.push(`${rule.field} must not exceed ${maxValue}`);
          }
        }
      }

      if (fieldErrors.length > 0) {
        errors[rule.field] = fieldErrors.join(", ");
      }
    }

    if (Object.keys(errors).length > 0) {
      return next(createError("Query validation failed", 400));
    }

    next();
  };
};

// Helper functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isStrongPassword(password: string): boolean {
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
}

// Common validation schemas
export const commonValidations = {
  login: [
    { field: "email", rules: ["required", "email"] },
    { field: "senha", rules: ["required", "min:6"] },
  ],

  register: [
    { field: "nome", rules: ["required", "min:3", "max:100"] },
    { field: "email", rules: ["required", "email"] },
    { field: "senha", rules: ["required", "strong"] },
    { field: "telefone", rules: ["required", "regex:^[0-9]{10,11}$"] },
  ],

  paciente: [
    { field: "nome", rules: ["required", "min:3", "max:100"] },
    { field: "cpf", rules: ["required", "regex:^[0-9]{11}$"] },
    { field: "telefone", rules: ["required", "regex:^[0-9]{10,11}$"] },
    { field: "dataNascimento", rules: ["required"] },
  ],

  consulta: [
    { field: "pacienteId", rules: ["required"] },
    { field: "fisioterapeutaId", rules: ["required"] },
    { field: "dataHora", rules: ["required"] },
    { field: "duracao", rules: ["required", "number", "min:15", "max:240"] },
  ],

  pagination: [
    { field: "page", rules: ["number", "min:1"] },
    { field: "limit", rules: ["number", "min:1", "max:100"] },
  ],
};
