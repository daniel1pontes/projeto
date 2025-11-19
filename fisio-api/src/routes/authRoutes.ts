import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login de usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/login", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registro de novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *               - telefone
 *               - papel
 *             properties:
 *               nome:
 *                 type: string
 *                 minLength: 3
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 minLength: 6
 *               telefone:
 *                 type: string
 *               papel:
 *                 type: string
 *                 enum: [ADMIN, FISIOTERAPEUTA, RECEPCIONISTA]
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post("/register", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obter dados do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       401:
 *         description: Não autorizado
 */
router.get("/me", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

export default router;
