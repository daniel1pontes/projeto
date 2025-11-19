import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /api/consultas:
 *   get:
 *     summary: Listar todas as consultas
 *     tags: [Consultas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de consultas
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
 * /api/consultas:
 *   post:
 *     summary: Criar nova consulta
 *     tags: [Consultas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pacienteId
 *               - fisioterapeutaId
 *               - dataHora
 *               - duracao
 *             properties:
 *               pacienteId:
 *                 type: string
 *               fisioterapeutaId:
 *                 type: string
 *               dataHora:
 *                 type: string
 *                 format: date-time
 *               duracao:
 *                 type: integer
 *                 minimum: 15
 *                 maximum: 240
 *               status:
 *                 type: string
 *                 enum: [AGENDADA, CONFIRMADA, EM_ANDAMENTO, CONCLUIDA, CANCELADA, NAO_COMPARECEU]
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Consulta criada com sucesso
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
 * /api/consultas/{id}:
 *   get:
 *     summary: Obter consulta por ID
 *     tags: [Consultas]
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
 *         description: Dados da consulta
 *       404:
 *         description: Consulta não encontrada
 */
router.get("/:id", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

/**
 * @swagger
 * /api/consultas/{id}:
 *   put:
 *     summary: Atualizar consulta
 *     tags: [Consultas]
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
 *               dataHora:
 *                 type: string
 *                 format: date-time
 *               duracao:
 *                 type: integer
 *                 minimum: 15
 *                 maximum: 240
 *               status:
 *                 type: string
 *                 enum: [AGENDADA, CONFIRMADA, EM_ANDAMENTO, CONCLUIDA, CANCELADA, NAO_COMPARECEU]
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Consulta atualizada
 *       404:
 *         description: Consulta não encontrada
 */
router.put("/:id", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

/**
 * @swagger
 * /api/consultas/{id}:
 *   delete:
 *     summary: Excluir consulta
 *     tags: [Consultas]
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
 *         description: Consulta excluída
 *       404:
 *         description: Consulta não encontrada
 */
router.delete("/:id", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

/**
 * @swagger
 * /api/consultas/{id}/reagendar:
 *   put:
 *     summary: Reagendar consulta
 *     tags: [Consultas]
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
 *             required:
 *               - novaDataHora
 *             properties:
 *               novaDataHora:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Consulta reagendada
 *       404:
 *         description: Consulta não encontrada
 */
router.put("/:id/reagendar", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

export default router;
