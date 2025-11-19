import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /api/pacientes:
 *   get:
 *     summary: Listar todos os pacientes
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pacientes
 *       401:
 *         description: Não autorizado
 */
router.get("/", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

/**
 * @swagger
 * /api/pacientes:
 *   post:
 *     summary: Criar novo paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - cpf
 *               - telefone
 *               - dataNascimento
 *             properties:
 *               nome:
 *                 type: string
 *               cpf:
 *                 type: string
 *               telefone:
 *                 type: string
 *               dataNascimento:
 *                 type: string
 *                 format: date
 *               email:
 *                 type: string
 *                 format: email
 *               convenio:
 *                 type: string
 *               historico:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paciente criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post("/", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

/**
 * @swagger
 * /api/pacientes/{id}:
 *   get:
 *     summary: Obter paciente por ID
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do paciente
 *       404:
 *         description: Paciente não encontrado
 */
router.get("/:id", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

/**
 * @swagger
 * /api/pacientes/{id}:
 *   put:
 *     summary: Atualizar paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               telefone:
 *                 type: string
 *               convenio:
 *                 type: string
 *               historico:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paciente atualizado
 *       404:
 *         description: Paciente não encontrado
 */
router.put("/:id", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

/**
 * @swagger
 * /api/pacientes/{id}:
 *   delete:
 *     summary: Excluir paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Paciente excluído
 *       404:
 *         description: Paciente não encontrado
 */
router.delete("/:id", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

export default router;
